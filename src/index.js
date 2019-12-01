import path from 'path';
import _ from 'lodash';
import PhpMorphy, {
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
} from './lib/common';

const defaults = {
  dir: path.join(__dirname, '..', 'dicts'),
  storage: STORAGE_MEM,
  predict_by_suffix: true,
  predict_by_db: true,
  graminfo_as_text: true,
  use_ancodes_cache: false,
  resolve_ancodes: RESOLVE_ANCODES_AS_TEXT,
};

class Morphy {
  static get STORAGE_FILE() {
    return STORAGE_FILE;
  }

  static get STORAGE_MEM() {
    return STORAGE_MEM;
  }

  static get SOURCE_FSA() {
    return SOURCE_FSA;
  }

  static get RESOLVE_ANCODES_AS_TEXT() {
    return RESOLVE_ANCODES_AS_TEXT;
  }

  static get RESOLVE_ANCODES_AS_DIALING() {
    return RESOLVE_ANCODES_AS_DIALING;
  }

  static get RESOLVE_ANCODES_AS_INT() {
    return RESOLVE_ANCODES_AS_INT;
  }

  static get NORMAL() {
    return NORMAL;
  }

  static get IGNORE_PREDICT() {
    return IGNORE_PREDICT;
  }

  static get ONLY_PREDICT() {
    return ONLY_PREDICT;
  }

  static get PREDICT_BY_NONE() {
    return PREDICT_BY_NONE;
  }

  static get PREDICT_BY_SUFFIX() {
    return PREDICT_BY_SUFFIX;
  }

  static get PREDICT_BY_DB() {
    return PREDICT_BY_DB;
  }

  /**
   * @param {string|object} lang
   * @param {object} [opts]
   */
  constructor(lang, opts = {}) {
    let config = {};
    if (_.isPlainObject(lang)) {
      config = { ...lang };
    } else {
      config.lang = lang;
    }

    config = { ...defaults, ...config, ...opts };

    switch (config.lang.toLowerCase()) {
      case 'de':
      case 'de_de':
        config.lang = 'de_DE';
        break;
      case 'en':
      case 'en_en':
        config.lang = 'en_EN';
        break;
      case 'et':
      case 'ee':
      case 'et_ee':
        config.lang = 'et_EE';
        break;
      case 'ua':
      case 'uk':
      case 'uk_ua':
        config.lang = 'uk_UA';
        break;
      case 'ru':
      case 'ru_ru':
      default:
        config.lang = 'ru_RU';
        break;
    }

    this.lang = config.lang;
    this.dir = config.dir;
    this.options = config;

    if (this.options.lang !== 'ru_RU') {
      this.options.use_ancodes_cache = false;
    }

    this.morpher = new PhpMorphy(this.dir, this.lang, this.options);
  }

  /**
   * @param {string|Buffer} word
   * @param {boolean} [asBuffer=false]
   * @returns {*}
   */
  prepareWord(word, asBuffer = false) {
    if (_.isArray(word)) {
      return _.map(word, word => this.prepareWord(word));
    }

    if (Buffer.isBuffer(word)) {
      word = word.toString(this.morpher.getEncoding());
    }

    word = word.toUpperCase();

    return asBuffer ? Buffer.from(word, this.morpher.getEncoding()) : word;
  }

  /**
   * @returns {MorphierInterface}
   */
  getCommonMorphier() {
    return this.morpher.getCommonMorphier();
  }

  /**
   * @returns {MorphierInterface}
   */
  getPredictBySuffixMorphier() {
    return this.morpher.getPredictBySuffixMorphier();
  }

  /**
   * @returns {MorphierInterface}
   */
  getPredictByDatabaseMorphier() {
    return this.morpher.getPredictByDatabaseMorphier();
  }

  /**
   * @returns {MorphierBulk}
   */
  getBulkMorphier() {
    return this.morpher.getBulkMorphier();
  }

  /**
   * @returns {string}
   */
  getEncoding() {
    return this.morpher.getEncoding();
  }

  /**
   * @returns {string}
   */
  getLocale() {
    return this.morpher.getLocale();
  }

  /**
   * @returns {GrammemsProviderBase}
   */
  getGrammemsProvider() {
    return this.morpher.getGrammemsProvider();
  }

  /**
   * @returns {GrammemsProviderBase}
   */
  getDefaultGrammemsProvider() {
    return this.morpher.getDefaultGrammemsProvider();
  }

  /**
   * @returns {boolean}
   */
  isLastPredicted() {
    return this.morpher.isLastPredicted();
  }

  /**
   * @returns {string}
   */
  getLastPredictionType() {
    return this.morpher.getLastPredictionType();
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {WordDescriptorCollection}
   */
  findWord(word, type = Morphy.NORMAL) {
    return this.morpher.findWord(this.prepareWord(word), type);
  }

  /**
   * Alias for getBaseForm
   *
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  lemmatize(word, type = Morphy.NORMAL) {
    return this.morpher.lemmatize(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getBaseForm(word, type = Morphy.NORMAL) {
    return this.morpher.getBaseForm(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getAllForms(word, type = Morphy.NORMAL) {
    return this.morpher.getAllForms(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getPseudoRoot(word, type = Morphy.NORMAL) {
    return this.morpher.getPseudoRoot(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getPartOfSpeech(word, type = Morphy.NORMAL) {
    return this.morpher.getPartOfSpeech(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getAllFormsWithAncodes(word, type = Morphy.NORMAL) {
    return this.morpher.getAllFormsWithAncodes(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {boolean} [asText=true] - represent graminfo as text or ancodes
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {*}
   */
  getAllFormsWithGramInfo(word, asText = true, type = Morphy.NORMAL) {
    return this.morpher.getAllFormsWithGramInfo(this.prepareWord(word), asText, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getAncode(word, type) {
    return this.morpher.getAncode(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getGramInfo(word, type = Morphy.NORMAL) {
    return this.morpher.getGramInfo(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getGramInfoMergeForms(word, type) {
    return this.morpher.getGramInfoMergeForms(this.prepareWord(word), type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param [type=Morphy.NORMAL] - prediction managment
   * @returns {[]}
   */
  getAnnotForWord(word, type = Morphy.NORMAL) {
    return this.morpher.getAnnotForWord(this.prepareWord(word), type);
  }

  /**
   * @param {string} word
   * @param {*} ancode
   * @param {*} [commonAncode=null]
   * @param {boolean} [returnOnlyWord]
   * @param {*} [callback=null]
   * @param {*} [type=Morphy]
   * @returns {[]}
   */
  castFormByAncode(word, ancode, commonAncode = null, returnOnlyWord = false, callback = null, type = Morphy.NORMAL) {
    return this.morpher.castFormByAncode(this.prepareWord(word), ancode, commonAncode, returnOnlyWord, callback, type);
  }

  /**
   * @param {string|Buffer} word
   * @param {*} partOfSpeech
   * @param {[]} grammems
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @param {*} [type=Morphy.NORMAL]
   * @returns {[]|boolean}
   */
  castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null, type = Morphy.NORMAL) {
    return this.morpher.castFormByGramInfo(
      this.prepareWord(word),
      partOfSpeech,
      grammems,
      returnOnlyWord,
      callback,
      type,
    );
  }

  /**
   * @param {string} word
   * @param {string} patternWord
   * @param {GrammemsProviderInterface} [grammemsProvider=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=false]
   * @param {*} [type=Morphy.NORMAL]
   * @returns {[]|boolean}
   */
  castFormByPattern(
    word,
    patternWord,
    grammemsProvider = null,
    returnOnlyWord = false,
    callback = null,
    type = Morphy.NORMAL,
  ) {
    return this.morpher.castFormByPattern(
      this.prepareWord(word),
      this.prepareWord(patternWord),
      grammemsProvider,
      returnOnlyWord,
      callback,
      type,
    );
  }
}

export default Morphy;
