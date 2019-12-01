import _ from 'lodash';
import { php } from '~/utils';

class GramTabInterface {
  getGrammems(ancodeId) {}

  getPartOfSpeech(ancodeId) {}

  resolveGrammemIds(ids) {}

  resolvePartOfSpeechId(id) {}

  includeConsts() {}

  /**
   * @param ancodeId
   * @param {*} [commonAncode=null]
   */
  ancodeToString(ancodeId, commonAncode = null) {}

  stringToAncode(string) {}

  toString(partOfSpeechId, grammemIds) {}
}

class GramTabEmpty extends GramTabInterface {
  getGrammems(ancodeId) {
    return [];
  }

  getPartOfSpeech(ancodeId) {
    return 0;
  }

  resolveGrammemIds(ids) {
    return php.var.is_array(ids) ? {} : '';
  }

  resolvePartOfSpeechId(id) {
    return '';
  }

  includeConsts() {}

  ancodeToString(ancodeId, commonAncode) {
    return '';
  }

  stringToAncode(string) {
    return null;
  }

  toString(partOfSpeechId, grammemIds) {
    return '';
  }
}

class GramTabProxy extends GramTabInterface {
  /**
   * @param {Storage} storage
   */
  constructor(storage) {
    super();
    this.storage = storage;
    this.___obj = null;
  }

  getGrammems(...args) {
    return this.__obj.getGrammems(...args);
  }

  getPartOfSpeech(...args) {
    return this.__obj.getPartOfSpeech(...args);
  }

  resolveGrammemIds(...args) {
    return this.__obj.resolveGrammemIds(...args);
  }

  resolvePartOfSpeechId(...args) {
    return this.__obj.resolvePartOfSpeechId(...args);
  }

  includeConsts(...args) {
    return this.__obj.includeConsts(...args);
  }

  ancodeToString(...args) {
    return this.__obj.ancodeToString(...args);
  }

  stringToAncode(...args) {
    return this.__obj.stringToAncode(...args);
  }

  toString(...args) {
    return this.__obj.toString(...args);
  }

  get __obj() {
    if (!this.___obj) {
      this.___obj = GramTab.create(this.storage);
      delete this.storage;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_.isUndefined(value) ? value : null;
  }
}

class GramTab extends GramTabInterface {
  /**
   * @param {Storage} $storage
   * @returns {GramTab}
   */
  static create($storage) {
    return new GramTab($storage);
  }

  /**
   * @param {Storage} storage
   */
  constructor(storage) {
    super();

    this.data = php.var.unserialize(storage.read(0, storage.getFileSize()).toString());
    if (!this.data) {
      throw new Error('Broken gramtab data');
    }

    this.grammems = this.data.grammems;
    this.poses = this.data.poses;
    this.ancodes = this.data.ancodes;
    this.___ancodesMap = null;
  }

  getGrammems(ancodeId) {
    if (!php.var.isset(this.ancodes[ancodeId])) {
      throw new Error(`Invalid ancode id '${ancodeId}'`);
    }

    return this.ancodes[ancodeId].grammem_ids;
  }

  getPartOfSpeech(ancodeId) {
    if (!php.var.isset(this.ancodes[ancodeId])) {
      throw new Error(`Invalid ancode id '${ancodeId} '`);
    }

    return this.ancodes[ancodeId].pos_id;
  }

  resolveGrammemIds(ids) {
    if (php.var.is_array(ids)) {
      const result = [];

      _.forEach(ids, id => {
        if (!php.var.isset(this.grammems[id])) {
          throw new Error(`Invalid grammem id '${id}'`);
        }

        result.push(this.grammems[id].name);
      });

      return result;
    }

    if (!php.var.isset(this.grammems[ids])) {
      throw new Error(`Invalid grammem id '${ids}'`);
    }

    return this.grammems[ids].name;
  }

  resolvePartOfSpeechId(id) {
    if (!php.var.isset(this.poses[id])) {
      throw new Error(`Invalid part of speech id '${id}'`);
    }

    return this.poses[id].name;
  }

  includeConsts() {
    /** todo: вот те самые константы */
    return require('./gramtab-consts');
  }

  ancodeToString(ancodeId, commonAncode) {
    commonAncode = !_.isUndefined(commonAncode) ? commonAncode : null;

    if (php.var.isset(commonAncode)) {
      commonAncode = `${this.getGrammems(commonAncode).join(',')},`;
    }

    return [this.getPartOfSpeech(ancodeId), ' ', commonAncode || '', this.getGrammems(ancodeId).join(',')].join('');
  }

  findAncode(partOfSpeech, grammems) {}

  stringToAncode(string) {
    if (!php.var.isset(string)) {
      return null;
    }

    if (!php.var.isset(this.__ancodesMap[string])) {
      throw new Error(`Ancode with '${string}' graminfo not found`);
    }

    return this.__ancodesMap[string];
  }

  /**
   * @param partOfSpeechId
   * @param grammemIds
   * @returns {string}
   */
  toString(partOfSpeechId, grammemIds) {
    return `${partOfSpeechId} ${php.strings.implode(',', grammemIds)}`;
  }

  buildAncodesMap() {
    const result = {};

    _.forEach(this.ancodes, (data, ancodeId) => {
      const key = this.toString(data.pos_id, data.grammem_ids);

      result[key] = ancodeId;
    });

    return result;
  }

  get __ancodesMap() {
    if (!this.___ancodesMap) {
      this.___ancodesMap = this.buildAncodesMap();
    }

    return this.___ancodesMap;
  }

  set __ancodesMap(value) {
    this.___ancodesMap = !_.isUndefined(value) ? value : null;
  }
}

export { GramTabInterface, GramTabEmpty, GramTabProxy, GramTab };
