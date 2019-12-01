import fs from 'fs';
import _ from 'lodash';
import { php } from '~/utils';

class GramInfoInterface {
  /**
   * Returns language for graminfo file
   * @returns {string}
   */
  getLocale() {}

  /**
   * Return encoding for graminfo file
   * @returns {string}
   */
  getEncoding() {}

  /**
   * Return size of character (cp1251 - 1, utf8 - 1, utf16 - 2, utf32 - 4 etc)
   * @returns {number}
   */
  getCharSize() {}

  /**
   * Return end of string value (usually string with \0 value of char_size + 1 length)
   * @returns {string}
   */
  getEnds() {}

  /**
   * Reads graminfo header
   *
   * @param {number} offset
   * @returns {[]}
   */
  readGramInfoHeader(offset) {}

  /**
   * Returns size of header struct
   */
  getGramInfoHeaderSize() {}

  /**
   * Read ancodes section for header retrieved with readGramInfoHeader
   *
   * @param {[]} info
   * @returns {[]}
   */
  readAncodes(info) {}

  /**
   * Read flexias section for header retrieved with readGramInfoHeader
   *
   * @param {[]} info
   * @returns {[]}
   */
  readFlexiaData(info) {}

  /**
   * Read all graminfo headers offsets, which can be used latter for readGramInfoHeader method
   * @returns {[]}
   */
  readAllGramInfoOffsets() {}

  getHeader() {}

  readAllPartOfSpeech() {}

  readAllGrammems() {}

  readAllAncodes() {}
}

class GramInfo extends GramInfoInterface {
  static HEADER_SIZE = 128;

  /**
   * @param {Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  static create(storage, lazy) {
    if (lazy) {
      return new GramInfoProxy(storage);
    }

    const { readHeader, validateHeader, HEADER_SIZE } = GramInfo;
    const header = readHeader(storage.read(0, HEADER_SIZE));

    if (!validateHeader(header)) {
      throw new Error('Invalid graminfo format');
    }

    const storageType = storage.getTypeAsString();
    const className = `GramInfo${_.upperFirst(storageType)}`;
    const graminfoAccess = require(`./access/graminfo-${storageType}`);

    return new graminfoAccess[className](storage.getResource(), header);
  }

  static readHeader(headerRaw) {
    const header = php.unpack(
      [
        'Vver',
        'Vis_be',
        'Vflex_count_old',
        'Vflex_offset',
        'Vflex_size',
        'Vflex_count',
        'Vflex_index_offset',
        'Vflex_index_size',
        'Vposes_offset',
        'Vposes_size',
        'Vposes_count',
        'Vposes_index_offset',
        'Vposes_index_size',
        'Vgrammems_offset',
        'Vgrammems_size',
        'Vgrammems_count',
        'Vgrammems_index_offset',
        'Vgrammems_index_size',
        'Vancodes_offset',
        'Vancodes_size',
        'Vancodes_count',
        'Vancodes_index_offset',
        'Vancodes_index_size',
        'Vchar_size',
        '',
      ].join('/'),
      headerRaw,
    );

    let offset = 24 * 4;
    let len = php.strings.ord(php.strings.substr(headerRaw, offset++, 1));

    header.lang = php.strings.rtrim(php.strings.substr(headerRaw, offset, len));
    offset += len;
    len = php.strings.ord(php.strings.substr(headerRaw, offset++, 1));
    header.encoding = php.strings.rtrim(php.strings.substr(headerRaw, offset, len));

    return header;
  }

  static validateHeader(header) {
    return header.ver === 3 || header.is_be != 1;
  }

  constructor(resource, header) {
    super();

    this.resource = resource;
    this.header = header;
    // this.ends      = php.strings.str_repeat('\0', header['char_size'] + 1);
    // this.ends_size = php.strings.strlen(this.ends);
    const buf = Buffer.alloc(header.char_size + 1);
    this.ends = buf.fill('\0');
    this.ends_size = buf.length;
  }

  getLocale() {
    return this.header.lang;
  }

  getEncoding() {
    return this.header.encoding;
  }

  getCharSize() {
    return this.header.char_size;
  }

  getEnds() {
    return this.ends;
  }

  getHeader() {
    return this.header;
  }

  cleanupCString(string) {
    // var pos = php.strings.strpos(string, this.ends);
    // if (pos !== false) {
    //  string = php.strings.substr(string, 0, pos);
    // }

    let stringBuf = Buffer.isBuffer(string) ? string : Buffer.from(string);
    const pos = this.ends.indexOf(stringBuf);
    if (pos >= 0) {
      stringBuf = stringBuf.slice(0, pos);
    }

    return stringBuf.toString();
  }

  readSectionIndex(offset, count) {}

  readSectionIndexAsSize(offset, count, total_size) {
    // todo
    if (!count) {
      return [];
    }

    const index = this.readSectionIndex(offset, count);
    index[count] = index[0] + total_size;

    for (let i = 0; i < count; i++) {
      index[i] = index[i + 1] - index[i];
    }

    delete index[count];

    return index;
  }
}

class GramInfoDecorator extends GramInfoInterface {
  /**
   * @param {GramInfoInterface} info
   */
  constructor(info) {
    super();
    this.info = info;
  }

  readGramInfoHeader(...args) {
    return this.info.readGramInfoHeader(...args);
  }

  getGramInfoHeaderSize(...args) {
    return this.info.getGramInfoHeaderSize(...args);
  }

  readAncodes(...args) {
    return this.info.readAncodes(...args);
  }

  readFlexiaData(...args) {
    return this.info.readFlexiaData(...args);
  }

  readAllGramInfoOffsets(...args) {
    return this.info.readAllGramInfoOffsets(...args);
  }

  readAllPartOfSpeech(...args) {
    return this.info.readAllPartOfSpeech(...args);
  }

  readAllGrammems(...args) {
    return this.info.readAllGrammems(...args);
  }

  readAllAncodes(...args) {
    return this.info.readAllAncodes(...args);
  }

  getLocale(...args) {
    return this.info.getLocale(...args);
  }

  getEncoding(...args) {
    return this.info.getEncoding(...args);
  }

  getCharSize(...args) {
    return this.info.getCharSize(...args);
  }

  getEnds(...args) {
    return this.info.getEnds(...args);
  }

  getHeader(...args) {
    return this.info.getHeader(...args);
  }
}

class GramInfoProxy extends GramInfoDecorator {
  /**
   * @param {Storage} storage
   */
  constructor(storage) {
    super(storage);

    this.storage = storage;
    this._info = null;
  }

  get info() {
    if (!this._info) {
      this._info = GramInfo.create(this.storage, false);
      delete this.storage;
    }

    return this._info;
  }

  set info(value) {
    this._info = !_.isUndefined(value) ? value : null;
  }
}

class GramInfoProxyWithHeader extends GramInfoDecorator {
  /**
   * @param {Storage} storage
   * @param cacheFile
   */
  constructor(storage, cacheFile) {
    super(storage);

    this.storage = storage;
    this._info = null;
    this.cache = this.readCache(cacheFile);
    // this.ends = php.strings.str_repeat('\0', this.getCharSize() + 1);
    const buf = Buffer.alloc(this.getCharSize() + 1);
    this.ends = buf.fill('\0');
  }

  readCache(fileName) {
    let result = fs.readFileSync(fileName);

    result = /\(([\S\s]*)\)/gim.exec(result.toString())[1];
    result = result
      .replace(/\s/gim, '')
      .replace(/,$/, '')
      .replace(/=>/g, ':')
      .replace(/'/g, '"');

    result = ['{', result, '}'].join('');

    let parsingGood = true;
    try {
      result = JSON.parse(result);
      parsingGood = _.isPlainObject(result);
    } catch (error) {
      parsingGood = false;
    }

    if (!parsingGood) {
      throw new Error(`Can\`t get header cache from "${fileName}" file`);
    }

    return result;
  }

  getLocale() {
    return this.cache.lang;
  }

  getEncoding() {
    return this.cache.encoding;
  }

  getCharSize() {
    return this.cache.char_size;
  }

  getEnds() {
    return this.ends;
  }

  getHeader() {
    return this.cache;
  }

  get info() {
    if (!this._info) {
      this._info = GramInfo.create(this.storage, false);
      delete this.storage;
    }

    return this._info;
  }

  set info(value) {
    this._info = !_.isUndefined(value) ? value : null;
  }
}

class GramInfoRuntimeCaching extends GramInfoDecorator {
  constructor(...args) {
    super(...args);
    this.ancodes = {};
    this.flexia_all = {};
  }

  readFlexiaData(info) {
    const offset = info.offset;

    if (!php.var.isset(this.flexia_all[offset])) {
      this.flexia_all[offset] = this.info.readFlexiaData(info);
    }

    return this.flexia_all[offset];
  }
}

class GramInfoAncodeCache extends GramInfoDecorator {
  /**
   * @param {GramInfoInterface} inner
   * @param resource
   */
  constructor(inner, resource) {
    super(inner);

    this.hits = 0;
    this.miss = 0;
    this.cache = null;

    this.cache = php.var.unserialize(resource.read(0, resource.getFileSize()).toString());
    if (this.cache === false) {
      throw new Error('Can`t read ancodes cache');
    }
  }

  readAncodes(info) {
    const { offset } = info;

    // todo: проверить доступ по индекс
    if (php.var.isset(this.cache[offset])) {
      this.hits += 1;
      return this.cache[offset];
    }

    // in theory misses never occur
    this.miss += 1;

    return super.readAncodes(info);
  }
}

export {
  GramInfoInterface,
  GramInfo,
  GramInfoDecorator,
  GramInfoProxy,
  GramInfoProxyWithHeader,
  GramInfoRuntimeCaching,
  GramInfoAncodeCache,
};
