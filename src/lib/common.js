/**
 * This file is part of phpMorphy library
 *
 * Copyright c 2007-2008 Kamaev Vladimir <heromantor@users.sourceforge.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the
 * Free Software Foundation, Inc., 59 Temple Place - Suite 330,
 * Boston, MA 02111-1307, USA.
 */

import _ from 'lodash';
import path from 'path';
import { php, toBuffer } from '../utils';
import { Morphy_Fsa } from './fsa/fsa';
import { Morphy_Source_Fsa } from './source';
import { Morphy_GramTab_Proxy } from './gramtab';
import { Morphy_Storage_Factory } from './storage';
import {
  Morphy_GrammemsProvider_Factory,
  Morphy_GrammemsProvider_Interface
} from './langs_stuff/common';
import {
  Morphy_GramInfo_RuntimeCaching,
  Morphy_GramInfo_Proxy_WithHeader,
  Morphy_GramInfo_AncodeCache
} from './graminfo/graminfo';
import {
  Morphy_AncodesResolver_Proxy,
  Morphy_Morphier_Helper,
  Morphy_Morphier_Common,
  Morphy_Morphier_Bulk,
  Morphy_Morphier_Predict_Database,
  Morphy_Morphier_Empty,
  Morphy_Morphier_Predict_Suffix
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
  PREDICT_BY_DB
} from './constants';

class Morphy_FilesBundle {

  constructor (dirName, lang) {
    this.dir = dirName;
    this.setLang(lang);
  }

  getLang () {
    return this.lang;
  }

  setLang (lang) {
    this.lang = lang.toLowerCase();
  }

  getCommonAutomatFile () {
    return this.genFileName('common_aut');
  }

  getPredictAutomatFile () {
    return this.genFileName('predict_aut');
  }

  getGramInfoFile () {
    return this.genFileName('morph_data');
  }

  getGramInfoAncodesCacheFile () {
    return this.genFileName('morph_data_ancodes_cache');
  }

  getAncodesMapFile () {
    return this.genFileName('morph_data_ancodes_map');
  }

  getGramTabFile () {
    return this.genFileName('gramtab');
  }

  getGramTabFileWithTextIds () {
    return this.genFileName('gramtab_txt');
  }

  getGramInfoHeaderCacheFile () {
    return this.genFileName('morph_data_header_cache');
  }

  genFileName (token, extraExt) {
    extraExt = (!_.isUndefined(extraExt)) ? extraExt : null;
    
    return path.join(this.dir, [
      token,
      '.',
      this.lang,
      (php.var.isset(extraExt) ? '.' + extraExt : ''),
      '.bin'
    ].join(''));
  }

}

class Morphy_WordDescriptor_Collection_Serializer {

  /**
   * @param {Morphy_WordDescriptor_Collection} collection
   * @param {boolean} [asText=false]
   * @returns {*}
   */
  serialize (collection, asText = false) {
    const result = [];
    _.forEach(collection, descriptor => result.push(this.processWordDescriptor(descriptor, asText)));

    return result;
  }

  /**
   * @param {Morphy_WordDescriptor} descriptor
   * @param {boolean} [asText=false]
   * @returns {{forms: *, all: *, common: string}}
   */
  processWordDescriptor (descriptor, asText = false) {
    const all = [];
    const forms = [];

    _.forEach(descriptor, word_form => {
      forms.push(word_form.getWord());
      all.push(this.serializeGramInfo(word_form, asText));
    });

    return {
      all,
      forms,
      common: ''
    };
  }

  /**
   * @param {Morphy_WordForm} wordForm
   * @param {boolean} [asText=false]
   * @returns {*}
   */
  serializeGramInfo (wordForm, asText = false) {
    if (asText) {
      return wordForm.getPartOfSpeech() + ' ' + php.strings.implode(',', wordForm.getGrammems());
    }

    return {
      pos: wordForm.getPartOfSpeech(),
      grammems: wordForm.getGrammems()
    };
  }

}

class phpMorphy {
  
  constructor (dir, lang = null, options = {}) {
    this.options = this.repairOptions(options);
    this.init(this.createFilesBundle(dir, lang), this.options);
    this.last_prediction_type = PREDICT_BY_NONE;
  }

  /**
   * @param {Morphy_FilesBundle} bundle
   * @param options
   */
  init (bundle, options) {
    this.options = this.repairOptions(options);
    this.storage_factory = this.createStorageFactory();
    this.common_fsa = this.createFsa(
      this.storage_factory.open(this.options['storage'], bundle.getCommonAutomatFile(), false),
      false
    );
    this.predict_fsa = this.createFsa(
      this.storage_factory.open(this.options['storage'], bundle.getPredictAutomatFile(), true),
      true
    );

    const graminfo = this.createGramInfo(this.storage_factory.open(this.options['storage'], bundle.getGramInfoFile(), true), bundle);
    const gramtab = this.createGramTab(this.storage_factory.open(
      this.options['storage'],
      (this.options['graminfo_as_text'] ? bundle.getGramTabFileWithTextIds() : bundle.getGramTabFile()),
      true
    ));
    this.helper = this.createMorphierHelper(graminfo, gramtab, this.options['graminfo_as_text'], bundle);
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getCommonMorphier () {
    return this.__common_morphier;
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getPredictBySuffixMorphier () {
    return this.__predict_by_suf_morphier;
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getPredictByDatabaseMorphier () {
    return this.__predict_by_db_morphier;
  }

  /**
   * @return {Morphy_Morphier_Bulk}
   */
  getBulkMorphier () {
    return this.__bulk_morphier;
  }

  /**
   * @return {string}
   */
  getEncoding () {
    return this.helper.getGramInfo().getEncoding();
  }

  /**
   * @return {string}
   */
  getLocale () {
    return this.helper.getGramInfo().getLocale();
  }

  /**
   * @return {Morphy_GrammemsProvider_Base}
   */
  getGrammemsProvider () {
    return _.cloneDeep(this.__grammems_provider);
  }

  /**
   * @return {Morphy_GrammemsProvider_Base}
   */
  getDefaultGrammemsProvider () {
    return this.__grammems_provider;
  }

  /**
   * @return {boolean}
   */
  isLastPredicted () {
    return this.last_prediction_type !== PREDICT_BY_NONE;
  }

  /**
   * @returns {string}
   */
  getLastPredictionType () {
    return this.last_prediction_type;
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {Morphy_WordDescriptor_Collection|{}}
   */
  findWord (word, type = NORMAL) {
    const result = {};

    if (php.var.is_array(word)) {
      word.forEach(w => result[w] = this.invoke('getWordDescriptor', toBuffer(w), type));
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
  lemmatize (word, type = NORMAL) {
    word = toBuffer(word);

    return this.getBaseForm(word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getBaseForm (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getBaseForm', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllForms (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getAllForms', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPseudoRoot (word, type = NORMAL) {
    word = toBuffer(word);
    
    return this.invoke('getPseudoRoot', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPartOfSpeech (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getPartOfSpeech', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllFormsWithAncodes (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getAllFormsWithAncodes', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {boolean} [asText=true] - represent graminfo as text or ancodes
   * @param {*} [type=NORMAL] - prediction managment
   * @return {*}
   */
  getAllFormsWithGramInfo (word, asText = true, type = NORMAL) {
    word = toBuffer(word);

    const result = this.findWord(word, type);

    if (!result) {
      return false;
    }

    if (php.var.is_array(word)) {
      const out = {};
      _.forEach(result, (r, w) => {
        if (false !== r) {
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
  getAncode (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getAncode', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfo (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getGrammarInfo', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfoMergeForms (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getGrammarInfoMergeForms', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param [type=NORMAL] - prediction managment
   * @returns {[]}
   */
  getAnnotForWord (word, type = NORMAL) {
    word = toBuffer(word);

    return this.invoke('getAnnot', word, type);
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
  castFormByAncode (word, ancode, commonAncode = null, returnOnlyWord = false, callback = null, type = NORMAL) {
    word = toBuffer(word);

    const resolver = this.helper.getAncodesResolver();
    const common_ancode_id = resolver.unresolve(commonAncode);
    const ancode_id = resolver.unresolve(ancode);
    const data = this.helper.getGrammemsAndPartOfSpeech(ancode_id);

    if (php.var.isset(common_ancode_id)) {
      data[1] = php.array.array_merge(data[1], this.helper.getGrammems(common_ancode_id));
    }

    return this.castFormByGramInfo(
      word,
      data[0],
      data[1],
      returnOnlyWord,
      callback,
      type
    );
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
  castFormByGramInfo (word, partOfSpeech, grammems, returnOnlyWord = false, callback = null, type = NORMAL) {
    word = toBuffer(word);

    const annot = this.getAnnotForWord(word, type);
    if (!annot) {
      return false;
    }

    return this.helper.castFormByGramInfo(word, annot, partOfSpeech, grammems, returnOnlyWord, callback);
  }

  /**
   * @param {string} word
   * @param {string} patternWord
   * @param {Morphy_GrammemsProvider_Interface} [grammemsProvider=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=false]
   * @param {*} [type=NORMAL]
   * @return {[]|boolean}
   */
  castFormByPattern (word, patternWord, grammemsProvider = null, returnOnlyWord = false, callback = null, type = NORMAL) {
    word = toBuffer(word);
    patternWord = toBuffer(patternWord);

    const word_annot = this.getAnnotForWord(word, type);
    if (!word_annot) {
      return false;
    }
    
    if (!(grammemsProvider instanceof Morphy_GrammemsProvider_Interface)) {
      grammemsProvider = this.__grammems_provider;
    }
    
    let result = [];
    _.forEach(this.getGramInfo(patternWord, type), paradigm => {
      _.forEach(paradigm, grammar => {
        const pos = grammar['pos'];
        const essential_grammems = grammemsProvider.getGrammems(pos);
  
        const grammems = (essential_grammems !== false)
          ? php.array.array_intersect(grammar['grammems'], essential_grammems)
          : grammar['grammems']
        ;
        
        const res = this.helper.castFormByGramInfo(
          word,
          word_annot,
          pos,
          grammems,
          returnOnlyWord,
          callback,
          type
        );

        if (res.length) {
          result = php.array.array_merge(result, res);
        }
      });
    });

    return returnOnlyWord ? _.uniq(result) : result;
  }

  /**
   * @param {Morphy_WordDescriptor_Collection} collection
   * @param {boolean} asText
   * @returns {*}
   */
  processWordsCollection (collection, asText) {
    return this.__word_descriptor_serializer.serialize(collection, asText);
  }

  invoke (method, word, type) {
    this.last_prediction_type = PREDICT_BY_NONE;
    word = toBuffer(word);
    
    let result;
    let not_found;

    if (type === ONLY_PREDICT) {
      if (php.var.is_array(word)) {
        result = {};
        _.forEach(word, w => result[w] = this.predictWord(method, w));

        return result;
      } else {
        return this.predictWord(method, word);
      }
    }

    if (php.var.is_array(word)) {
      result = this.__bulk_morphier[method](word);
      not_found = this.__bulk_morphier.getNotFoundWords();

      _.forEach(not_found, word => {
        result[word] = (type !== IGNORE_PREDICT)
          ? this.predictWord(method, word)
          : false
        ;
      });
    } else {
      result = this.__common_morphier[method](word);
  
      if (!result && type !== IGNORE_PREDICT) {
        result = this.predictWord(method, word);
      }
    }
    
    return result;
  }

  predictWord (method, word) {
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
   * @param {Morphy_FilesBundle} bundle
   * @param {{}} opts
   * @returns {*}
   */
  createCommonSource (bundle, opts) {
    const type = opts['type'];

    switch (type) {
      case SOURCE_FSA:
        return new Morphy_Source_Fsa(this.common_fsa);
      default:
        throw new Error(`Unknown source type given '${ type }'`);
    }
  }

  repairOldOptions (options = {}) {
    const defaults = {
      predict_by_suffix: false,
      predict_by_db:     false
    };

    return Object.assign(defaults, options);
  }

  repairSourceOptions (options = {}) {
    const defaults = {
      type: SOURCE_FSA,
      opts: null
    };

    return Object.assign(defaults, options);
  }

  repairOptions (options = {}) {
    const defaults = {
      graminfo_as_text:  true,
      storage:           STORAGE_MEM,
      common_source:     this.repairSourceOptions(options.common_source || null),
      predict_by_suffix: true,
      predict_by_db:     true,
      use_ancodes_cache: false,
      resolve_ancodes:   RESOLVE_ANCODES_AS_TEXT
    };

    return Object.assign(defaults, options);
  }

  get __predict_by_db_morphier () {
    if (!this.___predict_by_db_morphier) {
      this.___predict_by_db_morphier = this.createPredictByDbMorphier(this.predict_fsa, this.helper);
    }

    return this.___predict_by_db_morphier;
  }
  set __predict_by_db_morphier (value) {
    this.___predict_by_db_morphier = (!_.isUndefined(value)) ? value : null;
  }

  get __predict_by_suf_morphier () {
    if (!this.___predict_by_suf_morphier) {
      this.___predict_by_suf_morphier = this.createPredictBySuffixMorphier(this.common_fsa, this.helper);
    }

    return this.___predict_by_suf_morphier;
  }
  set __predict_by_suf_morphier (value) {
    this.___predict_by_suf_morphier = (!_.isUndefined(value)) ? value : null;
  }

  get __bulk_morphier () {
    if (!this.___bulk_morphier) {
      this.___bulk_morphier = this.createBulkMorphier(this.common_fsa, this.helper);
    }

    return this.___bulk_morphier;
  }
  set __bulk_morphier (value) {
    this.___bulk_morphier = (!_.isUndefined(value)) ? value : null;
  }

  get __common_morphier () {
    if (!this.___common_morphier) {
      this.___common_morphier = this.createCommonMorphier(this.common_fsa, this.helper);
    }

    return this.___common_morphier;
  }
  set __common_morphier (value) {
    this.___common_morphier = (!_.isUndefined(value)) ? value : null;
  }

  get __word_descriptor_serializer () {
    if (!this.___word_descriptor_serializer) {
      this.___word_descriptor_serializer = this.createWordDescriptorSerializer();
    }

    return this.___word_descriptor_serializer;
  }
  set __word_descriptor_serializer (value) {
    this.___word_descriptor_serializer = (!_.isUndefined(value)) ? value : null;
  }

  get __grammems_provider () {
    if (!this.___grammems_provider) {
      this.___grammems_provider = this.createGrammemsProvider();
    }

    return this.___grammems_provider;
  }
  set __grammems_provider (value) {
    this.___grammems_provider = (!_.isUndefined(value)) ? value : null;
  }

  ////////////////////
  // factory methods
  ////////////////////
  createGrammemsProvider () {
    return Morphy_GrammemsProvider_Factory.create(this);
  }

  createWordDescriptorSerializer () {
    return new Morphy_WordDescriptor_Collection_Serializer();
  }

  createFilesBundle (dir, lang) {
    return new Morphy_FilesBundle(dir, lang);
  }

  createStorageFactory () {
    return new Morphy_Storage_Factory();
  }

  /**
   * @param {Morphy_Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  createFsa (storage, lazy) {
    return Morphy_Fsa.create(storage, lazy);
  }

  /**
   * @param {Morphy_Storage} graminfoFile
   * @param {Morphy_FilesBundle} bundle
   */
  createGramInfo (graminfoFile, bundle) {
    const result = new Morphy_GramInfo_RuntimeCaching(
      new Morphy_GramInfo_Proxy_WithHeader(
        graminfoFile,
        bundle.getGramInfoHeaderCacheFile()
      )
    );

    if (this.options['use_ancodes_cache']) {
      return new Morphy_GramInfo_AncodeCache(
        result,
        this.storage_factory.open(this.options['storage'], bundle.getGramInfoAncodesCacheFile(), true)
      );
    }

    return result;
  }

  /**
   * @param {Morphy_Storage} storage
   * @returns {Morphy_GramTab_Proxy}
   */
  createGramTab (storage) {
    return new Morphy_GramTab_Proxy(storage);
  }

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_FilesBundle} bundle
   */
  createAncodesResolverInternal (gramtab, bundle) {
    switch (this.options['resolve_ancodes']) {
      case RESOLVE_ANCODES_AS_TEXT:
        return ['Morphy_AncodesResolver_ToText', [gramtab]];
      case RESOLVE_ANCODES_AS_INT:
        return ['Morphy_AncodesResolver_AsIs', []];
      case RESOLVE_ANCODES_AS_DIALING:
        return ['Morphy_AncodesResolver_ToDialingAncodes', [
          this.storage_factory.open(
            this.options['storage'],
            bundle.getAncodesMapFile(),
            true
          )
        ]];
      default:
        throw new Error('Invalid resolve_ancodes option, valid values are RESOLVE_ANCODES_AS_DIALING, RESOLVE_ANCODES_AS_INT, RESOLVE_ANCODES_AS_TEXT');
    }
  }

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_FilesBundle} bundle
   * @param {boolean} lazy
   */
  createAncodesResolver (gramtab, bundle, lazy) {
    const [className, args] = this.createAncodesResolverInternal(gramtab, bundle);
        
    if (!!lazy) {
      return new Morphy_AncodesResolver_Proxy(className, args);
    }

    return Morphy_AncodesResolver_Proxy.instantinate(className, args);
  }

  /**
   * @param {Morphy_GramInfo_Interface} graminfo
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {boolean} graminfoAsText
   * @param {Morphy_FilesBundle} bundle
   */
  createMorphierHelper (graminfo, gramtab, graminfoAsText, bundle) {

    return new Morphy_Morphier_Helper(
      graminfo,
      gramtab,
      this.createAncodesResolver(gramtab, bundle, true),
      graminfoAsText
    );
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createCommonMorphier (fsa, helper) {
    return new Morphy_Morphier_Common(fsa, helper);
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createBulkMorphier (fsa, helper) {
    return new Morphy_Morphier_Bulk(fsa, helper);
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createPredictByDbMorphier (fsa, helper) {
    if (this.options['predict_by_db']) {
      return new Morphy_Morphier_Predict_Database(fsa, helper);
    }

    return new Morphy_Morphier_Empty();
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createPredictBySuffixMorphier (fsa, helper) {
    if (this.options['predict_by_suffix']) {
      return new Morphy_Morphier_Predict_Suffix(fsa, helper);
    }

    return new Morphy_Morphier_Empty();
  }

}

export default phpMorphy;
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
  PREDICT_BY_DB
};
