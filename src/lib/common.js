import path from 'path';
import _ from 'lodash';
import { php, toBuffer } from '~/utils';
import { Fsa } from './fsa/fsa';
import { SourceFsa } from './source';
import { GramTabProxy } from './gramtab';
import { StorageFactory } from './storage';
import { GrammemsProviderFactory, GrammemsProviderInterface } from './langs-stuff/common';
import { GramInfoRuntimeCaching, GramInfoProxyWithHeader, GramInfoAncodeCache } from './graminfo/graminfo';
import {
  AncodesResolverProxy,
  MorphierHelper,
  MorphierCommon,
  MorphierBulk,
  MorphierPredictDatabase,
  MorphierEmpty,
  MorphierPredictSuffix,
} from './morphiers';
import {
  STORAGE_FILE,
  STORAGE_MEM,
  SOURCE_FSA,
  RESOLVE_ANCODES_AS_TEXT,
  RESOLVE_ANCODES_AS_DIALING,
  RESOLVE_ANCODES_AS_INT,
  NORMAL,
  IGNORE_PREDICT,
  ONLY_PREDICT,
  PREDICT_BY_NONE,
  PREDICT_BY_SUFFIX,
  PREDICT_BY_DB,
} from './constants';

class FilesBundle {
  constructor(dirName, lang) {
    this.dir = dirName;
    this.setLang(lang);
  }

  getLang() {
    return this.lang;
  }

  setLang(lang) {
    this.lang = lang.toLowerCase();
  }

  getCommonAutomatFile() {
    return this.genFileName('common_aut');
  }

  getPredictAutomatFile() {
    return this.genFileName('predict_aut');
  }

  getGramInfoFile() {
    return this.genFileName('morph_data');
  }

  getGramInfoAncodesCacheFile() {
    return this.genFileName('morph_data_ancodes_cache');
  }

  getAncodesMapFile() {
    return this.genFileName('morph_data_ancodes_map');
  }

  getGramTabFile() {
    return this.genFileName('gramtab');
  }

  getGramTabFileWithTextIds() {
    return this.genFileName('gramtab_txt');
  }

  getGramInfoHeaderCacheFile() {
    return this.genFileName('morph_data_header_cache');
  }

  genFileName(token, extraExt) {
    extraExt = !_.isUndefined(extraExt) ? extraExt : null;

    return path.join(this.dir, [token, '.', this.lang, php.var.isset(extraExt) ? `.${extraExt}` : '', '.bin'].join(''));
  }
}

class WordDescriptorCollectionSerializer {
  /**
   * @param {WordDescriptorCollection} collection
   * @param {boolean} [asText=false]
   * @returns {*}
   */
  serialize(collection, asText = false) {
    const result = [];
    _.forEach(collection, descriptor => result.push(this.processWordDescriptor(descriptor, asText)));

    return result;
  }

  /**
   * @param {WordDescriptor} descriptor
   * @param {boolean} [asText=false]
   * @returns {{forms: *, all: *, common: string}}
   */
  processWordDescriptor(descriptor, asText = false) {
    const all = [];
    const forms = [];

    _.forEach(descriptor, wordForm => {
      forms.push(wordForm.getWord());
      all.push(this.serializeGramInfo(wordForm, asText));
    });

    return {
      all,
      forms,
      common: '',
    };
  }

  /**
   * @param {WordForm} wordForm
   * @param {boolean} [asText=false]
   * @returns {*}
   */
  serializeGramInfo(wordForm, asText = false) {
    if (asText) {
      return `${wordForm.getPartOfSpeech()} ${php.strings.implode(',', wordForm.getGrammems())}`;
    }

    return {
      pos: wordForm.getPartOfSpeech(),
      grammems: wordForm.getGrammems(),
    };
  }
}

class PhpMorphy {
  constructor(dir, lang = null, options = {}) {
    this.options = this.repairOptions(options);
    this.init(this.createFilesBundle(dir, lang), this.options);
    this.last_prediction_type = PREDICT_BY_NONE;
  }

  /**
   * @param {FilesBundle} bundle
   * @param options
   */
  init(bundle, options) {
    this.options = this.repairOptions(options);
    this.storage_factory = this.createStorageFactory();
    this.common_fsa = this.createFsa(
      this.storage_factory.open(this.options.storage, bundle.getCommonAutomatFile(), false),
      false,
    );
    this.predict_fsa = this.createFsa(
      this.storage_factory.open(this.options.storage, bundle.getPredictAutomatFile(), true),
      true,
    );

    const graminfo = this.createGramInfo(
      this.storage_factory.open(this.options.storage, bundle.getGramInfoFile(), true),
      bundle,
    );
    const gramtab = this.createGramTab(
      this.storage_factory.open(
        this.options.storage,
        this.options.graminfo_as_text ? bundle.getGramTabFileWithTextIds() : bundle.getGramTabFile(),
        true,
      ),
    );
    this.helper = this.createMorphierHelper(graminfo, gramtab, this.options.graminfo_as_text, bundle);
  }

  /**
   * @return {MorphierInterface}
   */
  getCommonMorphier() {
    return this.__common_morphier;
  }

  /**
   * @return {MorphierInterface}
   */
  getPredictBySuffixMorphier() {
    return this.__predict_by_suf_morphier;
  }

  /**
   * @return {MorphierInterface}
   */
  getPredictByDatabaseMorphier() {
    return this.__predict_by_db_morphier;
  }

  /**
   * @return {MorphierBulk}
   */
  getBulkMorphier() {
    return this.__bulk_morphier;
  }

  /**
   * @return {string}
   */
  getEncoding() {
    return this.helper.getGramInfo().getEncoding();
  }

  /**
   * @return {string}
   */
  getLocale() {
    return this.helper.getGramInfo().getLocale();
  }

  /**
   * @return {GrammemsProviderBase}
   */
  getGrammemsProvider() {
    return _.cloneDeep(this.__grammems_provider);
  }

  /**
   * @return {GrammemsProviderBase}
   */
  getDefaultGrammemsProvider() {
    return this.__grammems_provider;
  }

  /**
   * @return {boolean}
   */
  isLastPredicted() {
    return this.last_prediction_type !== PREDICT_BY_NONE;
  }

  /**
   * @returns {string}
   */
  getLastPredictionType() {
    return this.last_prediction_type;
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {WordDescriptorCollection|{}}
   */
  findWord(word, type = NORMAL) {
    const result = {};

    if (php.var.is_array(word)) {
      word.forEach(w => (result[w] = this.invoke('getWordDescriptor', toBuffer(w), type)));
      return result;
    }

    return this.invoke('getWordDescriptor', word, type);
  }

  /**
   * Alias for getBaseForm
   *
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  lemmatize(word, type = NORMAL) {
    return this.getBaseForm(toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getBaseForm(word, type = NORMAL) {
    return this.invoke('getBaseForm', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllForms(word, type = NORMAL) {
    return this.invoke('getAllForms', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPseudoRoot(word, type = NORMAL) {
    return this.invoke('getPseudoRoot', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPartOfSpeech(word, type = NORMAL) {
    return this.invoke('getPartOfSpeech', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllFormsWithAncodes(word, type = NORMAL) {
    return this.invoke('getAllFormsWithAncodes', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {boolean} [asText=true] - represent graminfo as text or ancodes
   * @param {*} [type=NORMAL] - prediction managment
   * @return {*}
   */
  getAllFormsWithGramInfo(word, asText = true, type = NORMAL) {
    const result = this.findWord(toBuffer(word), type);

    if (!result) return false;

    if (php.var.is_array(word)) {
      const out = {};
      _.forEach(result, (r, w) => {
        if (r !== false) {
          out[w] = this.processWordsCollection(r, asText);
        } else {
          out[w] = false;
        }
      });

      return out;
    }

    return this.processWordsCollection(result, asText);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAncode(word, type = NORMAL) {
    return this.invoke('getAncode', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfo(word, type = NORMAL) {
    return this.invoke('getGrammarInfo', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfoMergeForms(word, type = NORMAL) {
    return this.invoke('getGrammarInfoMergeForms', toBuffer(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param [type=NORMAL] - prediction managment
   * @returns {[]}
   */
  getAnnotForWord(word, type = NORMAL) {
    return this.invoke('getAnnot', toBuffer(word), type);
  }

  /**
   * @param {string} word
   * @param {*} ancode
   * @param {*} [commonAncode=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @param {*} [type=NORMAL]
   * @return {[]}
   */
  castFormByAncode(word, ancode, commonAncode = null, returnOnlyWord = false, callback = null, type = NORMAL) {
    const resolver = this.helper.getAncodesResolver();
    const commonAncodeId = resolver.unresolve(commonAncode);
    const ancodeId = resolver.unresolve(ancode);
    const data = this.helper.getGrammemsAndPartOfSpeech(ancodeId);

    if (php.var.isset(commonAncodeId)) {
      data[1] = php.array.array_merge(data[1], this.helper.getGrammems(commonAncodeId));
    }

    return this.castFormByGramInfo(toBuffer(word), data[0], data[1], returnOnlyWord, callback, type);
  }

  /**
   * @param {string} word
   * @param {*} partOfSpeech
   * @param {[]} grammems
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @param {*} [type=NORMAL]
   * @return {[]|boolean}
   */
  castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null, type = NORMAL) {
    const annot = this.getAnnotForWord(toBuffer(word), type);
    if (!annot) return false;

    return this.helper.castFormByGramInfo(toBuffer(word), annot, partOfSpeech, grammems, returnOnlyWord, callback);
  }

  /**
   * @param {string} word
   * @param {string} patternWord
   * @param {GrammemsProviderInterface} [grammemsProvider=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=false]
   * @param {*} [type=NORMAL]
   * @return {[]|boolean}
   */
  castFormByPattern(
    word,
    patternWord,
    grammemsProvider = null,
    returnOnlyWord = false,
    callback = null,
    type = NORMAL,
  ) {
    word = toBuffer(word);
    patternWord = toBuffer(patternWord);

    const wordAnnot = this.getAnnotForWord(word, type);
    if (!wordAnnot) {
      return false;
    }

    if (!(grammemsProvider instanceof GrammemsProviderInterface)) {
      grammemsProvider = this.__grammems_provider;
    }

    let result = [];
    _.forEach(this.getGramInfo(patternWord, type), paradigm => {
      _.forEach(paradigm, grammar => {
        const pos = grammar.pos;
        const essentialGrammems = grammemsProvider.getGrammems(pos);

        const grammems =
          essentialGrammems !== false
            ? php.array.array_intersect(grammar.grammems, essentialGrammems)
            : grammar.grammems;
        const res = this.helper.castFormByGramInfo(word, wordAnnot, pos, grammems, returnOnlyWord, callback, type);

        if (res.length > 0) {
          result = php.array.array_merge(result, res);
        }
      });
    });

    return returnOnlyWord ? _.uniq(result) : result;
  }

  /**
   * @param {WordDescriptorCollection} collection
   * @param {boolean} asText
   * @returns {*}
   */
  processWordsCollection(collection, asText) {
    return this.__word_descriptor_serializer.serialize(collection, asText);
  }

  invoke(method, word, type) {
    this.last_prediction_type = PREDICT_BY_NONE;
    word = toBuffer(word);

    let result;
    let notFound;

    if (type === ONLY_PREDICT) {
      if (php.var.is_array(word)) {
        result = {};
        _.forEach(word, w => (result[w] = this.predictWord(method, w)));

        return result;
      }
      return this.predictWord(method, word);
    }

    if (php.var.is_array(word)) {
      result = this.__bulk_morphier[method](word);
      notFound = this.__bulk_morphier.getNotFoundWords();

      _.forEach(notFound, word => {
        result[word] = type !== IGNORE_PREDICT ? this.predictWord(method, word) : false;
      });
    } else {
      result = this.__common_morphier[method](word);

      if (!result && type !== IGNORE_PREDICT) {
        result = this.predictWord(method, word);
      }
    }

    return result;
  }

  predictWord(method, word) {
    word = toBuffer(word);

    let result = this.__predict_by_suf_morphier[method](word);
    if (result !== false) {
      this.last_prediction_type = PREDICT_BY_SUFFIX;
      return result;
    }

    result = this.__predict_by_db_morphier[method](word);
    if (result !== false) {
      this.last_prediction_type = PREDICT_BY_DB;
      return result;
    }

    return false;
  }

  /**
   * @param {FilesBundle} bundle
   * @param {{}} opts
   * @returns {*}
   */
  createCommonSource(bundle, opts) {
    const type = opts.type;

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (type) {
      case SOURCE_FSA:
        return new SourceFsa(this.common_fsa);
      default:
        throw new Error(`Unknown source type given '${type}'`);
    }
  }

  repairOldOptions(options = {}) {
    const defaults = {
      predict_by_suffix: false,
      predict_by_db: false,
    };

    return Object.assign(defaults, options);
  }

  repairSourceOptions(options = {}) {
    const defaults = {
      type: SOURCE_FSA,
      opts: null,
    };

    return Object.assign(defaults, options);
  }

  repairOptions(options = {}) {
    const defaults = {
      graminfo_as_text: true,
      storage: STORAGE_MEM,
      common_source: this.repairSourceOptions(options.common_source || null),
      predict_by_suffix: true,
      predict_by_db: true,
      use_ancodes_cache: false,
      resolve_ancodes: RESOLVE_ANCODES_AS_TEXT,
    };

    return Object.assign(defaults, options);
  }

  get __predict_by_db_morphier() {
    if (!this.___predict_by_db_morphier) {
      this.___predict_by_db_morphier = this.createPredictByDbMorphier(this.predict_fsa, this.helper);
    }

    return this.___predict_by_db_morphier;
  }

  set __predict_by_db_morphier(value) {
    this.___predict_by_db_morphier = !_.isUndefined(value) ? value : null;
  }

  get __predict_by_suf_morphier() {
    if (!this.___predict_by_suf_morphier) {
      this.___predict_by_suf_morphier = this.createPredictBySuffixMorphier(this.common_fsa, this.helper);
    }

    return this.___predict_by_suf_morphier;
  }

  set __predict_by_suf_morphier(value) {
    this.___predict_by_suf_morphier = !_.isUndefined(value) ? value : null;
  }

  get __bulk_morphier() {
    if (!this.___bulk_morphier) {
      this.___bulk_morphier = this.createBulkMorphier(this.common_fsa, this.helper);
    }

    return this.___bulk_morphier;
  }

  set __bulk_morphier(value) {
    this.___bulk_morphier = !_.isUndefined(value) ? value : null;
  }

  get __common_morphier() {
    if (!this.___common_morphier) {
      this.___common_morphier = this.createCommonMorphier(this.common_fsa, this.helper);
    }

    return this.___common_morphier;
  }

  set __common_morphier(value) {
    this.___common_morphier = !_.isUndefined(value) ? value : null;
  }

  get __word_descriptor_serializer() {
    if (!this.___word_descriptor_serializer) {
      this.___word_descriptor_serializer = this.createWordDescriptorSerializer();
    }

    return this.___word_descriptor_serializer;
  }

  set __word_descriptor_serializer(value) {
    this.___word_descriptor_serializer = !_.isUndefined(value) ? value : null;
  }

  get __grammems_provider() {
    if (!this.___grammems_provider) {
      this.___grammems_provider = this.createGrammemsProvider();
    }

    return this.___grammems_provider;
  }

  set __grammems_provider(value) {
    this.___grammems_provider = !_.isUndefined(value) ? value : null;
  }

  // //////////////////
  // factory methods
  // //////////////////
  createGrammemsProvider() {
    return GrammemsProviderFactory.create(this);
  }

  createWordDescriptorSerializer() {
    return new WordDescriptorCollectionSerializer();
  }

  createFilesBundle(dir, lang) {
    return new FilesBundle(dir, lang);
  }

  createStorageFactory() {
    return new StorageFactory();
  }

  /**
   * @param {Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  createFsa(storage, lazy) {
    return Fsa.create(storage, lazy);
  }

  /**
   * @param {Storage} graminfoFile
   * @param {FilesBundle} bundle
   */
  createGramInfo(graminfoFile, bundle) {
    const result = new GramInfoRuntimeCaching(
      new GramInfoProxyWithHeader(graminfoFile, bundle.getGramInfoHeaderCacheFile()),
    );

    if (this.options.use_ancodes_cache) {
      return new GramInfoAncodeCache(
        result,
        this.storage_factory.open(this.options.storage, bundle.getGramInfoAncodesCacheFile(), true),
      );
    }

    return result;
  }

  /**
   * @param {Storage} storage
   * @returns {GramTabProxy}
   */
  createGramTab(storage) {
    return new GramTabProxy(storage);
  }

  /**
   * @param {GramTabInterface} gramtab
   * @param {FilesBundle} bundle
   */
  createAncodesResolverInternal(gramtab, bundle) {
    switch (this.options.resolve_ancodes) {
      case RESOLVE_ANCODES_AS_TEXT:
        return ['AncodesResolverToText', [gramtab]];
      case RESOLVE_ANCODES_AS_INT:
        return ['AncodesResolverAsIs', []];
      case RESOLVE_ANCODES_AS_DIALING:
        return [
          'AncodesResolverToDialingAncodes',
          [this.storage_factory.open(this.options.storage, bundle.getAncodesMapFile(), true)],
        ];
      default:
        throw new Error(
          'Invalid resolve_ancodes option, valid values are RESOLVE_ANCODES_AS_DIALING, RESOLVE_ANCODES_AS_INT, RESOLVE_ANCODES_AS_TEXT',
        );
    }
  }

  /**
   * @param {GramTabInterface} gramtab
   * @param {FilesBundle} bundle
   * @param {boolean} lazy
   */
  createAncodesResolver(gramtab, bundle, lazy) {
    const [className, args] = this.createAncodesResolverInternal(gramtab, bundle);

    if (lazy) {
      return new AncodesResolverProxy(className, args);
    }

    return AncodesResolverProxy.instantinate(className, args);
  }

  /**
   * @param {GramInfoInterface} graminfo
   * @param {GramTabInterface} gramtab
   * @param {boolean} graminfoAsText
   * @param {FilesBundle} bundle
   */
  createMorphierHelper(graminfo, gramtab, graminfoAsText, bundle) {
    return new MorphierHelper(graminfo, gramtab, this.createAncodesResolver(gramtab, bundle, true), graminfoAsText);
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  createCommonMorphier(fsa, helper) {
    return new MorphierCommon(fsa, helper);
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  createBulkMorphier(fsa, helper) {
    return new MorphierBulk(fsa, helper);
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  createPredictByDbMorphier(fsa, helper) {
    if (this.options.predict_by_db) {
      return new MorphierPredictDatabase(fsa, helper);
    }

    return new MorphierEmpty();
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  createPredictBySuffixMorphier(fsa, helper) {
    if (this.options.predict_by_suffix) {
      return new MorphierPredictSuffix(fsa, helper);
    }

    return new MorphierEmpty();
  }
}

export default PhpMorphy;
export {
  STORAGE_FILE,
  STORAGE_MEM,
  SOURCE_FSA,
  RESOLVE_ANCODES_AS_TEXT,
  RESOLVE_ANCODES_AS_DIALING,
  RESOLVE_ANCODES_AS_INT,
  NORMAL,
  IGNORE_PREDICT,
  ONLY_PREDICT,
  PREDICT_BY_NONE,
  PREDICT_BY_SUFFIX,
  PREDICT_BY_DB,
};
