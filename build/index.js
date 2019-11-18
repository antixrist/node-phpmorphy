module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 57);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = require("lodash");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clone = exports.str2hex = exports.str2ascii = exports.buffer2str = exports.toBuffer = exports.isStringifyedNumber = exports.php = exports.inspect = exports.logger = exports.castArray = exports.onShutdown = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _util = __webpack_require__(53);

var _util2 = _interopRequireDefault(_util);

var _php = __webpack_require__(51);

var _php2 = _interopRequireDefault(_php);

var _phpunserialize = __webpack_require__(52);

var _phpunserialize2 = _interopRequireDefault(_phpunserialize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {function} cb
 */

// import jschardet from 'jschardet';
// import encoding from 'encoding';
function onShutdown(cb) {
  onShutdown.handlers.push(cb);
}
onShutdown.handlers = [];

const logger = {};
logger.log = console.log.bind(console);
logger.trace = console.trace.bind(console);
logger.info = console.info.bind(console);
logger.warn = console.warn.bind(console);
logger.error = console.error.bind(console);

/**
 * @param any
 * @returns {Array}
 */
function castArray(any) {
  any = !_lodash2.default.isUndefined(any) && !_lodash2.default.isNull(any) ? any : [];
  any = _lodash2.default.isArray(any) ? any : [any];

  return any;
}

/**
 * @param object
 * @param {{}} [opts]
 * @returns {string}
 */
function inspect(object, opts = {
  depth: null,
  colors: true,
  maxArrayLength: 1000
}) {
  return _util2.default.inspect(object, opts);
}

// /**
//  * @param {String|Buffer} text
//  * @returns {String}
//  */
// function detectCharset (text) {
//   let buffer;
//   let retVal = null;
//
//   if (_.isArray(text)) {
//     return _.map(text, item => detectCharset(item));
//   } else
//   if (_.isString(text)) {
//     buffer = Buffer.from(text, 'binary');
//   } else
//   if (!Buffer.isBuffer(text)) {
//     buffer = null;
//   }
//
//   if (buffer) {
//     retVal = jschardet.detect(buffer).encoding;
//     retVal = (retVal) ? retVal.toLowerCase() : null;
//   }
//
//   return retVal;
// }

// /**
//  * @param {String|Buffer} text
//  * @param {String} to
//  * @param {String} [from='UTF-8']
//  * @returns {*}
//  */
// function convert (text, to, from = 'UTF-8') {
//   let args = _.toArray(arguments);
//   let buffer = null;
//   let retVal = text;
//
//   if (_.isArray(text)) {
//     return _.map(text, (item) => convert.apply(convert, [item].concat(args.slice(1))));
//   } else
//   if (_.isString(text)) {
//     buffer = Buffer.from(text, 'binary');
//   } else
//   if (!Buffer.isBuffer(text)) {
//     buffer = null;
//   }
//
//   if (buffer) {
//     from = (!from) ? detectCharset(buffer) : from;
//
//     if (from) {
//       retVal = encoding.convert(buffer, to, from);
//     }
//
//     return retVal.toString();
//   }
//
//   return retVal;
// }

//php.info.ini_set('unicode.semantics', 'on');
_php2.default.info.ini_set('phpjs.objectsAsArrays', false);

_php2.default.unpack = function unpack(format, buffer) {
  /**
   * Параметр format задается в виде строки и состоит из кодов формата и
   * опционального аргумента повторения. Аргумент может быть целочисленным,
   * либо * для повторения до конца введенных данных. Для a, A, h, H число
   * повторений определяет то, сколько символов взято от одного аргумента
   * данных, для @ - это абсолютная позиция для размещения следующих данных,
   * для всего остального число повторений определяет как много аргументов
   * данных было обработано и упаковано в результирующую бинарную строку.
   */
  const codes = {
    'a': 'Строка (string) с NULL-заполнением',
    'A': 'Строка (string) со SPACE-заполнением',
    'h': 'Hex-строка (Hex string), с нижнего разряда',
    'H': 'Hex-строка (Hex string), с верхнего разряда',
    'c': 'знаковый символ (char)',
    'C': 'беззнаковый символ (char)',
    's': 'знаковый short (всегда 16 бит, машинный байтовый порядок)',
    'S': 'беззнаковый short (всегда 16 бит, машинный байтовый порядок)',
    'n': 'беззнаковый short (всегда 16 бит, порядок big endian)',
    'v': 'беззнаковый short (всегда 16 бит, порядок little endian)',
    'i': 'знаковый integer (машинно-зависимый размер и порядок)',
    'I': 'беззнаковый integer (машинно-зависимый размер и порядок)',
    'l': 'знаковый long (всегда 32 бит, машинный порядок)',
    'L': 'беззнаковый long (всегда 32 бит, машинный порядок)',
    'N': 'беззнаковый long (всегда 32 бит, порядок big endian)',
    'V': 'беззнаковый long (всегда 32 бит, порядок little endian)',
    'f': 'float (машинно-зависимые размер и прдставление)',
    'd': 'double (машинно-зависимые размер и прдставление)',
    'x': 'NUL байт',
    'X': 'Резервирование одного байта',
    '@': 'NUL-заполнение до абсолютной позиции'
  };
  const parts = format.split('/');
  let offset = 0,
      mod,
      lenStr,
      len;
  if (parts.length > 1) {
    let result = {};
    for (let idx = 0; idx < parts.length; idx++) {
      mod = parts[idx][0];
      if (mod in codes) {
        switch (mod) {
          case 'V':
            result[parts[idx].slice(1)] = buffer.readUInt32LE(offset);
            offset += 4;
            break;
          case 'v':
            result[parts[idx].slice(1)] = buffer.readUInt16LE(offset);
            offset += 2;
            break;
          case 'a':
            lenStr = /\d+/g.exec(parts[idx])[0];
            len = parseInt(lenStr, 10);
            result[parts[idx].slice(1 + lenStr.length)] = buffer.toString('ascii', offset, len);
            offset += len;
            break;
          default:
            _util2.default.puts(parts[idx] + ' ' + offset);
            break;
        }
      }
    }

    return result;
  } else {
    let result = [];
    do {
      let obj = {};
      mod = format[0];
      if (mod in codes) {
        switch (mod) {
          case 'V':
            obj = buffer.readUInt32LE(offset);
            offset += 4;
            break;
          case 'v':
            obj = buffer.readUInt16LE(offset);
            offset += 2;
            break;
          case 'a':
            lenStr = /\d+/g.exec(format)[0];
            len = parseInt(lenStr, 10);
            obj = buffer.toString('ascii', offset, len);
            offset += len;
            break;
          default:
            _util2.default.puts(format);
            break;
        }
      }
      result.push(obj);
    } while (offset < buffer.length);

    return result;
  }
};

_php2.default.var.unserialize = _phpunserialize2.default;

_php2.default.strings.ord = function ord(str, idx) {
  if (!Buffer.isBuffer(str)) {
    str = Buffer.from(str);
  }

  idx = !_lodash2.default.isUndefined(idx) && _lodash2.default.isNumber(idx) && idx < str.length ? idx : 0;

  return str[idx];
};

_php2.default.strings._substr = _php2.default.strings.substr; // safe
/**
 * @param {String|Buffer} str
 * @param {Number} start
 * @param {Number} [len]
 * @returns {string|Buffer|boolean}
 */
_php2.default.strings.substr = function php$substr(str, start, len) {
  let end;

  if (Buffer.isBuffer(str)) {
    end = str.length;
    start = start < 0 ? start + end : start;
    end = typeof len === 'undefined' ? end : len < 0 ? len + end : len + start;

    return start >= str.length || start < 0 || start > end ? false : str.slice(start, end);
  }

  return _php2.default.strings._substr.apply(_php2.default.strings._substr, arguments);
};

// /**
//  * @param raw
//  * @returns {String|null}
//  */
// function detectEncoding (raw) {
//   let buffer, result;
//   if (Buffer.isBuffer(raw)) {
//     buffer = raw;
//   } else {
//     raw = (_.isString(raw)) ? raw : raw +'';
//     buffer = Buffer.from(raw, 'binary');
//   }
//
//   result = jschardet.detect(buffer);
//
//   return (result.encoding) ? result.encoding : null;
// }

/**
 * @param any
 * @returns {boolean}
 */
function isStringifyedNumber(any) {
  let int = _lodash2.default.toInteger(any);

  if (int === 0 && any !== '0') {
    return false;
  }

  return any == int;
}
/**
 * @param something
 * @param [encoding='utf-8']
 * @returns {Buffer|*}
 */
function toBuffer(something, encoding = 'utf-8') {
  let retVal = something;

  function _ref(item) {
    return toBuffer(item, encoding);
  }

  if (_lodash2.default.isArray(something)) {
    retVal = _lodash2.default.map(something, _ref);
  } else if (Buffer.isBuffer(something)) {
    retVal = something;
  } else if (_lodash2.default.isString(something)) {
    retVal = Buffer.from(something, encoding);
  } else if (_lodash2.default.isPlainObject(something)) {
    let obj = _lodash2.default.clone(something);
    _lodash2.default.forEach(obj, (val, key) => obj[key] = toBuffer(val, encoding));

    retVal = obj;
  }

  return retVal;
}

/**
 * @param something
 * @param {String} [encoding='utf8']
 * @returns {string|*}
 */
function buffer2str(something, encoding = 'utf8') {
  return Buffer.isBuffer(something) ? something.toString(encoding) : something;
}

/**
 * @param something
 * @returns {Array}
 */
function str2ascii(something) {
  let retVal = [];
  let buffer = !Buffer.isBuffer(something) ? Buffer.from(something, 'binary') : something;

  for (let i = 0, length = buffer.length; i < length; i++) {
    retVal.push(buffer[i]);
  }

  return retVal;
}

/**
 * @param something
 * @returns {String}
 */
function str2hex(something) {
  let retVal = !Buffer.isBuffer(something) ? Buffer.from(something, 'binary') : something;

  return retVal.toString('hex');
}

function clone(instance) {
  return _lodash2.default.merge({}, Object.create(Object.getPrototypeOf(instance)), instance);
}

exports.onShutdown = onShutdown;
exports.castArray = castArray;
exports.logger = logger;
exports.inspect = inspect;
exports.php = _php2.default;
exports.isStringifyedNumber = isStringifyedNumber;
exports.toBuffer = toBuffer;
exports.buffer2str = buffer2str;
exports.str2ascii = str2ascii;
exports.str2hex = str2hex;
exports.clone = clone;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Fsa_Proxy = exports.Morphy_Fsa_Decorator = exports.Morphy_Fsa_WordsCollector = exports.Morphy_Fsa = exports.Morphy_Fsa_Interface = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fsa_state = __webpack_require__(19);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_Fsa_Interface {

  /**
   * Return root transition of fsa
   * @return {[]}
   */
  getRootTrans() {}

  /**
   * Returns root state object
   * @return {*}
   */
  getRootState() {}

  /**
   * Returns alphabet i.e. all chars used in automat
   * @return {[]}
   */
  getAlphabet() {}

  /**
   * Return annotation for given transition(if annotation flag is set for given trans)
   *
   * @param {[]} trans
   * @return {string}
   */
  getAnnot(trans) {}

  /**
   * Find word in automat
   *
   * @param {*} trans starting transition
   * @param {string} word
   * @param {boolean} [readAnnot=true] read annot or simple check if word exists in automat
   * @return {boolean} TRUE if word is found, FALSE otherwise
   */
  walk(trans, word, readAnnot = true) {}

  /**
   * Traverse automat and collect words
   * For each found words callback function invoked with follow arguments:
   * call_user_func(callback, word, annot)
   * when `readAnnot` is FALSE then `annot` arg is always NULL
   *
   * @param {*} startNode
   * @param {*} callback callback function(in php format callback i.e. string or array(obj, method) or array(class,
   *   method)
   * @param {boolean} [readAnnot=true] read annot
   * @param {string} [path=] string to be append to all words
   */
  collect(startNode, callback, readAnnot = true, path = '') {}

  /**
   * Read state at given index
   *
   * @param {number} index
   * @return {[]}
   */
  readState(index) {}

  /**
   * Unpack transition from binary form to array
   *
   * @param {*} rawTranses may be array for convert more than one transitions
   * @return {[]}
   */
  unpackTranses(rawTranses) {}

} /**
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

class Morphy_Fsa extends Morphy_Fsa_Interface {

  static get HEADER_SIZE() {
    return 128;
  }

  /**
   * @param {Morphy_Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  static create(storage, lazy) {
    if (!!lazy) {
      return new Morphy_Fsa_Proxy(storage);
    }

    const readHeader = Morphy_Fsa.readHeader,
          validateHeader = Morphy_Fsa.validateHeader,
          HEADER_SIZE = Morphy_Fsa.HEADER_SIZE;

    const header = readHeader(storage.read(0, HEADER_SIZE, true));

    if (!validateHeader(header)) {
      throw new Error('Invalid fsa format');
    }

    let type;
    if (header['flags']['is_sparse']) {
      type = 'sparse';
    } else if (header['flags']['is_tree']) {
      type = 'tree';
    } else {
      throw new Error('Only sparse or tree fsa`s supported');
    }

    const storage_type = storage.getTypeAsString();
    const className = `Morphy_Fsa_${_utils.php.strings.ucfirst(type)}_${_utils.php.strings.ucfirst(storage_type)}`;
    const fsaAccess = __webpack_require__(25)("./fsa_" + type + '_' + storage_type);

    return new fsaAccess[className](storage.getResource(), header);
  }

  static readHeader(headerRaw) {
    const HEADER_SIZE = Morphy_Fsa.HEADER_SIZE;


    if (headerRaw.length != HEADER_SIZE) {
      throw new Error('Invalid header string given');
    }

    const header = _utils.php.unpack(['a4fourcc', 'Vver', 'Vflags', 'Valphabet_offset', 'Vfsa_offset', 'Vannot_offset', 'Valphabet_size', 'Vtranses_count', 'Vannot_length_size', 'Vannot_chunk_size', 'Vannot_chunks_count', 'Vchar_size', 'Vpadding_size', 'Vdest_size', 'Vhash_size'].join('/'), headerRaw);

    if (header === false) {
      throw new Error('Can`t unpack header');
    }

    const flags = {};
    const raw_flags = header['flags'];
    flags['is_tree'] = !!(raw_flags & 0x01);
    flags['is_hash'] = !!(raw_flags & 0x02);
    flags['is_sparse'] = !!(raw_flags & 0x04);
    flags['is_be'] = !!(raw_flags & 0x08);

    header['flags'] = flags;

    header['trans_size'] = header['char_size'] + header['padding_size'] + header['dest_size'] + header['hash_size'];

    return header;
  }

  static validateHeader(header) {
    return !(header['fourcc'] != 'meal' || header['ver'] != 3 || header['char_size'] != 1 || header['padding_size'] > 0 || header['dest_size'] != 3 || header['hash_size'] != 0 || header['annot_length_size'] != 1 || header['annot_chunk_size'] != 1 || header['flags']['is_be'] || header['flags']['is_hash'] || 1 == 0);
  }

  constructor(resource, header) {
    super(...arguments);
    this.resource = resource;
    this.header = header;
    this.fsa_start = header['fsa_offset'];
    this.root_trans = this.readRootTrans();
    this.alphabet = null;
  }

  getRootTrans() {
    return this.root_trans;
  }

  getRootState() {
    return this.createState(this.getRootStateIndex());
  }

  getAlphabet() {
    if (!_utils.php.var.isset(this.alphabet)) {
      //this.alphabet = php.strings.str_split(this.readAlphabet());

      const alphabet = this.readAlphabet();
      const alphabetBuf = Buffer.from(alphabet);
      const result = [];

      for (let i = 0, length = alphabetBuf.length; i < length; i++) {
        result.push(alphabetBuf.slice(i, i + 1).toString());
      }

      this.alphabet = result;
    }

    return this.alphabet;
  }

  createState(index) {
    return new _fsa_state.Morphy_State(this, index);
  }

  getRootStateIndex() {}

  readRootTrans() {}

  readAlphabet() {}

}

class Morphy_Fsa_WordsCollector {

  constructor(collectLimit) {
    this.limit = collectLimit;
    this.items = {};
  }

  collect(word, annot) {
    if (_lodash2.default.size(this.items) < this.limit) {
      this.items[word] = annot;
      return true;
    }

    return false;
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = {};
  }

  getCallback() {
    return [this, 'collect'];
  }

}

class Morphy_Fsa_Decorator extends Morphy_Fsa_Interface {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   */
  constructor(fsa) {
    super(...arguments);
    this.fsa = fsa;
  }

  getRootTrans(...args) {
    return this.fsa.getRootTrans(...args);
  }

  getRootState(...args) {
    return this.fsa.getRootState(...args);
  }

  getAlphabet(...args) {
    return this.fsa.getAlphabet(...args);
  }

  getAnnot(...args) {
    return this.fsa.getAnnot(...args);
  }

  walk(...args) {
    return this.fsa.walk(...args);
  }

  collect(...args) {
    return this.fsa.collect(...args);
  }

  readState(...args) {
    return this.fsa.readState(...args);
  }

  unpackTranses(...args) {
    return this.fsa.unpackTranses(...args);
  }

}

class Morphy_Fsa_Proxy extends Morphy_Fsa_Decorator {

  /**
   * @param {Morphy_Storage} storage
   */
  constructor(storage) {
    super(...arguments);
    this.storage = storage;
    this._fsa = null;
  }

  get fsa() {
    if (!this._fsa) {
      this._fsa = Morphy_Fsa.create(this.storage, false);
      delete this.storage;
    }

    return this._fsa;
  }

  set fsa(value) {
    this._fsa = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

exports.Morphy_Fsa_Interface = Morphy_Fsa_Interface;
exports.Morphy_Fsa = Morphy_Fsa;
exports.Morphy_Fsa_WordsCollector = Morphy_Fsa_WordsCollector;
exports.Morphy_Fsa_Decorator = Morphy_Fsa_Decorator;
exports.Morphy_Fsa_Proxy = Morphy_Fsa_Proxy;

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = require("fs");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GrammemsProvider_Factory = exports.Morphy_GrammemsProvider_ForFactory = exports.Morphy_GrammemsProvider_Empty = exports.Morphy_GrammemsProvider_Base = exports.Morphy_GrammemsProvider_Decorator = exports.Morphy_GrammemsProvider_Interface = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _encoding = __webpack_require__(16);

var _encoding2 = _interopRequireDefault(_encoding);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_GrammemsProvider_Interface {
  getGrammems(partOfSpeech) {}
}

class Morphy_GrammemsProvider_Decorator extends Morphy_GrammemsProvider_Interface {

  /**
   * @param {Morphy_GrammemsProvider_Interface} inner
   */
  constructor(inner) {
    super(...arguments);

    this.inner = inner;
  }

  getGrammems(partOfSpeech) {
    return this.inner.getGrammems(partOfSpeech);
  }

}

class Morphy_GrammemsProvider_Base extends Morphy_GrammemsProvider_Interface {

  static flatizeArray(array) {
    return _lodash2.default.flatten(_lodash2.default.values(array));
  }

  constructor() {
    super(...arguments);

    this.grammems = {};
    this.all_grammems = Morphy_GrammemsProvider_Base.flatizeArray(this.getAllGrammemsGrouped());
  }

  getAllGrammemsGrouped() {}

  includeGroups(partOfSpeech, names) {
    const grammems = this.getAllGrammemsGrouped();
    names = !_lodash2.default.isArray(names) ? [names] : names;
    names = _utils.php.array.array_flip(names);

    _lodash2.default.forEach(_utils.php.array.array_keys(grammems), key => {
      if (!_utils.php.var.isset(names[key])) {
        delete grammems[key];
      }
    });

    this.grammems[partOfSpeech] = Morphy_GrammemsProvider_Base.flatizeArray(grammems);

    return this;
  }

  excludeGroups(partOfSpeech, names) {
    const grammems = this.getAllGrammemsGrouped();
    names = !_lodash2.default.isArray(names) ? [names] : names;

    _lodash2.default.forEach(names, key => delete grammems[key]);

    this.grammems[partOfSpeech] = Morphy_GrammemsProvider_Base.flatizeArray(grammems);

    return this;
  }

  resetGroups(partOfSpeech) {
    delete this.grammems[partOfSpeech];

    return this;
  }

  resetGroupsForAll() {
    this.grammems = {};

    return this;
  }

  getGrammems(partOfSpeech) {
    if (_utils.php.var.isset(this.grammems[partOfSpeech])) {
      return this.grammems[partOfSpeech];
    }

    return this.all_grammems;
  }

}

class Morphy_GrammemsProvider_Empty extends Morphy_GrammemsProvider_Base {

  constructor() {
    super(...arguments);
  }

  getAllGrammemsGrouped() {
    return {};
  }

  getGrammems(partOfSpeech) {
    return false;
  }

}

class Morphy_GrammemsProvider_ForFactory extends Morphy_GrammemsProvider_Base {

  constructor(enc) {
    super(...arguments);
    this.encoded_grammems = this.encodeGrammems(this.getGrammemsMap(), enc);

    // а как по-другому?
    // кроме как копипастой кода родительского конструктора
    // и чтобы аккуратно - никак
    this.grammems = {};
    this.all_grammems = Morphy_GrammemsProvider_Base.flatizeArray(this.getAllGrammemsGrouped());
  }

  getGrammemsMap() {}

  getAllGrammemsGrouped() {
    return this.encoded_grammems;
  }

  encodeGrammems(grammems, enc) {
    const from_enc = this.getSelfEncoding();
    const result = {};

    if (from_enc == enc) {
      return grammems;
    }

    _lodash2.default.forEach(grammems, (ary, key) => {
      const keyBuffer = Buffer.from(key);
      const keyBufferConverted = _encoding2.default.convert(keyBuffer, enc, from_enc);
      const new_key = keyBufferConverted.toString();
      const new_value = [];

      _lodash2.default.forEach(ary, value => {
        const valueBuffer = Buffer.from(value);
        const valueBufferConverted = _encoding2.default.convert(valueBuffer, enc, from_enc);

        new_value.push(valueBufferConverted.toString());
      });

      result[new_key] = new_value;
    });

    return result;
  }

}

const Morphy_GrammemsProvider_Factory_included = new Map();

class Morphy_GrammemsProvider_Factory {
  /**
   * @param {phpMorphy} morphy
   * @returns {*}
   */
  static create(morphy) {
    const locale = morphy.getLocale().toLowerCase();

    if (!Morphy_GrammemsProvider_Factory_included.has(morphy)) {
      Morphy_GrammemsProvider_Factory_included.set(morphy, {});
    }

    const included = Morphy_GrammemsProvider_Factory_included.get(morphy);

    if (_lodash2.default.isUndefined(included[locale])) {
      const className = `Morphy_GrammemsProvider_${locale}`;
      let grammemsProviders = {};

      try {
        grammemsProviders = __webpack_require__(27)("./" + locale);
      } catch (err) {
        included[locale] = new Morphy_GrammemsProvider_Empty(morphy);
        return included[locale];
      }

      if (_lodash2.default.isFunction(grammemsProviders[className])) {
        included[locale] = grammemsProviders[className].instance(morphy);
      } else {
        throw new Error("Class '" + className + "' not found");
      }
    }

    return included[locale];
  }
}

exports.Morphy_GrammemsProvider_Interface = Morphy_GrammemsProvider_Interface;
exports.Morphy_GrammemsProvider_Decorator = Morphy_GrammemsProvider_Decorator;
exports.Morphy_GrammemsProvider_Base = Morphy_GrammemsProvider_Base;
exports.Morphy_GrammemsProvider_Empty = Morphy_GrammemsProvider_Empty;
exports.Morphy_GrammemsProvider_ForFactory = Morphy_GrammemsProvider_ForFactory;
exports.Morphy_GrammemsProvider_Factory = Morphy_GrammemsProvider_Factory;

/***/ },
/* 5 */
/***/ function(module, exports) {

module.exports = require("path");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GramInfo_AncodeCache = exports.Morphy_GramInfo_RuntimeCaching = exports.Morphy_GramInfo_Proxy_WithHeader = exports.Morphy_GramInfo_Proxy = exports.Morphy_GramInfo_Decorator = exports.Morphy_GramInfo = exports.Morphy_GramInfo_Interface = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = __webpack_require__(3);

var _fs2 = _interopRequireDefault(_fs);

var _path = __webpack_require__(5);

var _path2 = _interopRequireDefault(_path);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class Morphy_GramInfo_Interface {

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

class Morphy_GramInfo extends Morphy_GramInfo_Interface {

  static get HEADER_SIZE() {
    return 128;
  }

  /**
   * @param {Morphy_Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  static create(storage, lazy) {
    if (lazy) {
      return new Morphy_GramInfo_Proxy(storage);
    }

    const readHeader = Morphy_GramInfo.readHeader,
          validateHeader = Morphy_GramInfo.validateHeader,
          HEADER_SIZE = Morphy_GramInfo.HEADER_SIZE;

    const header = readHeader(storage.read(0, HEADER_SIZE));

    if (!validateHeader(header)) {
      throw new Error('Invalid graminfo format');
    }

    const storage_type = storage.getTypeAsString();
    const className = `Morphy_GramInfo_${_utils.php.strings.ucfirst(storage_type)}`;
    const graminfoAccess = __webpack_require__(26)("./graminfo_" + storage_type);

    return new graminfoAccess[className](storage.getResource(), header);
  }

  static readHeader(headerRaw) {
    const header = _utils.php.unpack(['Vver', 'Vis_be', 'Vflex_count_old', 'Vflex_offset', 'Vflex_size', 'Vflex_count', 'Vflex_index_offset', 'Vflex_index_size', 'Vposes_offset', 'Vposes_size', 'Vposes_count', 'Vposes_index_offset', 'Vposes_index_size', 'Vgrammems_offset', 'Vgrammems_size', 'Vgrammems_count', 'Vgrammems_index_offset', 'Vgrammems_index_size', 'Vancodes_offset', 'Vancodes_size', 'Vancodes_count', 'Vancodes_index_offset', 'Vancodes_index_size', 'Vchar_size', ''].join('/'), headerRaw);

    let offset = 24 * 4;
    let len = _utils.php.strings.ord(_utils.php.strings.substr(headerRaw, offset++, 1));

    header['lang'] = _utils.php.strings.rtrim(_utils.php.strings.substr(headerRaw, offset, len));
    offset += len;
    len = _utils.php.strings.ord(_utils.php.strings.substr(headerRaw, offset++, 1));
    header['encoding'] = _utils.php.strings.rtrim(_utils.php.strings.substr(headerRaw, offset, len));

    return header;
  }

  static validateHeader(header) {
    return header['ver'] == 3 || header['is_be'] != 1;
  }

  constructor(resource, header) {
    super(...arguments);

    this.resource = resource;
    this.header = header;
    //this.ends      = php.strings.str_repeat('\0', header['char_size'] + 1);
    //this.ends_size = php.strings.strlen(this.ends);
    const buf = Buffer.alloc(header['char_size'] + 1);
    this.ends = buf.fill('\0');
    this.ends_size = buf.length;
  }

  getLocale() {
    return this.header['lang'];
  }

  getEncoding() {
    return this.header['encoding'];
  }

  getCharSize() {
    return this.header['char_size'];
  }

  getEnds() {
    return this.ends;
  }

  getHeader() {
    return this.header;
  }

  cleanupCString(string) {
    //var pos = php.strings.strpos(string, this.ends);
    //if (pos !== false) {
    //  string = php.strings.substr(string, 0, pos);
    //}

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

class Morphy_GramInfo_Decorator extends Morphy_GramInfo_Interface {

  /**
   * @param {Morphy_GramInfo_Interface} info
   */
  constructor(info) {
    super(...arguments);
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

class Morphy_GramInfo_Proxy extends Morphy_GramInfo_Decorator {

  /**
   * @param {Morphy_Storage} $storage
   */
  constructor($storage) {
    super(...arguments);

    this.storage = $storage;
    this._info = null;
  }

  get info() {
    if (!this._info) {
      this._info = Morphy_GramInfo.create(this.storage, false);
      delete this.storage;
    }

    return this._info;
  }

  set info(value) {
    this._info = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

class Morphy_GramInfo_Proxy_WithHeader extends Morphy_GramInfo_Decorator {

  /**
   * @param {Morphy_Storage} $storage
   * @param $cacheFile
   */
  constructor($storage, $cacheFile) {
    super(...arguments);

    this.storage = $storage;
    this._info = null;
    this.cache = this.readCache($cacheFile);
    //this.ends = php.strings.str_repeat('\0', this.getCharSize() + 1);
    const buf = Buffer.alloc(this.getCharSize() + 1);
    this.ends = buf.fill('\0');
  }

  readCache(fileName) {
    let result = _fs2.default.readFileSync(fileName);

    result = /\(([\s\S]*)\)/igm.exec(result.toString())[1];
    result = result.replace(/\s/igm, '').replace(/,$/, '').replace(/=>/g, ':').replace(/'/g, '"');

    result = ['{', result, '}'].join('');

    let parsingGood = true;
    try {
      result = JSON.parse(result);
      parsingGood = _lodash2.default.isPlainObject(result);
    } catch (e) {
      parsingGood = false;
    }

    if (!parsingGood) {
      throw new Error('Can`t get header cache from "' + fileName + '" file');
    }

    return result;
  }

  getLocale() {
    return this.cache['lang'];
  }

  getEncoding() {
    return this.cache['encoding'];
  }

  getCharSize() {
    return this.cache['char_size'];
  }

  getEnds() {
    return this.ends;
  }

  getHeader() {
    return this.cache;
  }

  get info() {
    if (!this._info) {
      this._info = Morphy_GramInfo.create(this.storage, false);
      delete this.storage;
    }

    return this._info;
  }

  set info(value) {
    this._info = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

class Morphy_GramInfo_RuntimeCaching extends Morphy_GramInfo_Decorator {

  constructor(...args) {
    super(...args);
    this.$ancodes = {};
    this.$flexia_all = {};
  }

  readFlexiaData(info) {
    const offset = info['offset'];

    if (!_utils.php.var.isset(this.$flexia_all[offset])) {
      this.$flexia_all[offset] = this.info.readFlexiaData(info);
    }

    return this.$flexia_all[offset];
  }

}

class Morphy_GramInfo_AncodeCache extends Morphy_GramInfo_Decorator {

  /**
   * @param {Morphy_GramInfo_Interface} inner
   * @param resource
   */
  constructor(inner, resource) {
    super(...arguments);

    this.hits = 0;
    this.miss = 0;
    this.cache = null;

    this.cache = _utils.php.var.unserialize(resource.read(0, resource.getFileSize()).toString());
    if (this.cache === false) {
      throw new Error("Can`t read ancodes cache");
    }
  }

  readAncodes(info) {
    const $offset = info['offset'];

    // todo: проверить доступ по индекс
    if (_utils.php.var.isset(this.cache[$offset])) {
      this.hits++;
      return this.cache[$offset];
    }

    // in theory misses never occur
    this.miss++;

    return super.readAncodes(info);
  }

}

exports.Morphy_GramInfo_Interface = Morphy_GramInfo_Interface;
exports.Morphy_GramInfo = Morphy_GramInfo;
exports.Morphy_GramInfo_Decorator = Morphy_GramInfo_Decorator;
exports.Morphy_GramInfo_Proxy = Morphy_GramInfo_Proxy;
exports.Morphy_GramInfo_Proxy_WithHeader = Morphy_GramInfo_Proxy_WithHeader;
exports.Morphy_GramInfo_RuntimeCaching = Morphy_GramInfo_RuntimeCaching;
exports.Morphy_GramInfo_AncodeCache = Morphy_GramInfo_AncodeCache;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
const STORAGE_FILE = exports.STORAGE_FILE = 'file';
const STORAGE_MEM = exports.STORAGE_MEM = 'mem';
const SOURCE_FSA = exports.SOURCE_FSA = 'fsa';

const RESOLVE_ANCODES_AS_TEXT = exports.RESOLVE_ANCODES_AS_TEXT = 0;
const RESOLVE_ANCODES_AS_DIALING = exports.RESOLVE_ANCODES_AS_DIALING = 1;
const RESOLVE_ANCODES_AS_INT = exports.RESOLVE_ANCODES_AS_INT = 2;
const NORMAL = exports.NORMAL = 0;
const IGNORE_PREDICT = exports.IGNORE_PREDICT = 2;
const ONLY_PREDICT = exports.ONLY_PREDICT = 3;
const PREDICT_BY_NONE = exports.PREDICT_BY_NONE = 'none';
const PREDICT_BY_SUFFIX = exports.PREDICT_BY_SUFFIX = 'by_suffix';
const PREDICT_BY_DB = exports.PREDICT_BY_DB = 'by_db';

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Fsa_Sparse_File = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = __webpack_require__(3);

var _fs2 = _interopRequireDefault(_fs);

var _utils = __webpack_require__(1);

var _fsa = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Morphy_Fsa_Sparse_File extends _fsa.Morphy_Fsa {

  constructor(...args) {
    super(...args);

    this.alphabet_num = null;
  }

  /**
   * @param trans
   * @param word
   * @param {boolean} [readAnnot=true]
   */
  walk(trans, word, readAnnot = true) {
    const fh = this.resource;
    const fsa_start = this.fsa_start;
    const wordBuf = Buffer.from(word);

    let prev_trans;
    let char;
    let result;
    let annot;
    let buf;

    let i = 0;
    let c = wordBuf.length;
    for (; i < c; i++) {
      prev_trans = trans;
      char = _utils.php.strings.ord(wordBuf, i);

      /////////////////////////////////
      // find char in state begin
      // sparse version
      result = true;
      buf = Buffer.alloc(4);
      _fs2.default.readSync(fh, buf, 0, 4, fsa_start + ((trans >> 10 & 0x3FFFFF) + char + 1 << 2));
      trans = _utils.php.unpack('V', buf)[0];

      if (trans & 0x0200 || (trans & 0xFF) != char) {
        result = false;
      }
      // find char in state end
      /////////////////////////////////

      if (!result) {
        trans = prev_trans;
        break;
      }
    }

    annot = null;
    result = false;
    prev_trans = trans;

    if (i >= c) {
      // Read annotation when we walked all chars in word
      result = true;

      if (readAnnot) {
        // read annot trans
        buf = Buffer.alloc(4);
        _fs2.default.readSync(fh, buf, 0, 4, fsa_start + ((trans >> 10 & 0x3FFFFF) << 2));
        trans = _utils.php.unpack('V', buf)[0];

        if ((trans & 0x0100) == 0) {
          result = false;
        } else {
          annot = this.getAnnot(trans);
        }
      }
    }

    return {
      result,
      annot,
      walked: i,
      last_trans: trans,
      word_trans: prev_trans
    };
  }

  /**
   * @param {*} startNode
   * @param {*} callback
   * @param {boolean} [readAnnot=true]
   * @param {string} [path=]
   * @returns {number}
   */
  collect(startNode, callback, readAnnot = true, path = '') {
    const stack = [];
    const stack_idx = [];

    let total = 0;
    let start_idx = 0;
    let state;
    let trans;
    let annot;

    stack.push(null);
    stack_idx.push(null);

    state = this.readState(startNode >> 10 & 0x3FFFFF);

    do {
      let i = start_idx;
      let c = _lodash2.default.size(state);
      for (; i < c; i++) {
        trans = state[i];

        if (trans & 0x0100) {
          total++;

          if (readAnnot) {
            annot = this.getAnnot(trans);
          } else {
            annot = trans;
          }

          //if (!php.funchand.call_user_func(callback, path, annot)) {
          if (!_utils.php.funchand.call_user_func(callback, null, annot)) {
            return total;
          }
        } else {
          //path += php.strings.chr((trans & 0xFF));
          stack.push(state);
          stack_idx.push(i + 1);
          state = this.readState(trans >> 10 & 0x3FFFFF);
          start_idx = 0;

          break;
        }
      }

      if (i >= c) {
        state = stack.pop();
        start_idx = stack_idx.pop();
        //path = php.strings.substr(Buffer.from(path), 0, -1).toString();
      }
    } while (!!stack.length);

    return total;
  }

  readState(index) {
    const fh = this.resource;
    const fsa_start = this.fsa_start;
    const result = [];

    let buf;
    let trans;
    let start_offset = fsa_start + (index << 2);

    // first try read annot transition
    buf = Buffer.alloc(4);
    _fs2.default.readSync(fh, buf, 0, 4, start_offset);
    trans = _utils.php.unpack('V', buf)[0];

    if (trans & 0x0100) {
      result.push(trans);
    }

    // read rest
    start_offset += 4;
    _lodash2.default.forEach(this.getAlphabetNum(), char => {
      buf = Buffer.alloc(4);
      _fs2.default.readSync(fh, buf, 0, 4, start_offset + (char << 2));
      trans = _utils.php.unpack('V', buf)[0];

      //if(!(trans & 0x0200) && (trans & 0xFF) == char) {
      // TODO: check term and empty flags at once i.e. trans & 0x0300
      if (!(trans & 0x0200 || trans & 0x0100) && (trans & 0xFF) == char) {
        result.push(trans);
      }
    });

    return result;
  }

  unpackTranses(rawTranses) {
    rawTranses = (0, _utils.castArray)(rawTranses);
    const result = [];

    _lodash2.default.forEach(rawTranses, rawTrans => {
      result.push({
        term: !!(rawTrans & 0x0100),
        empty: !!(rawTrans & 0x0200),
        attr: rawTrans & 0xFF,
        dest: rawTrans >> 10 & 0x3FFFFF
      });
    });

    return result;
  }

  readRootTrans() {
    const fh = this.resource;
    const fsa_start = this.fsa_start;
    let trans;
    let buf;

    buf = Buffer.alloc(4);
    _fs2.default.readSync(fh, buf, 0, 4, fsa_start + 4);
    trans = _utils.php.unpack('V', buf)[0];

    return trans;
  }

  readAlphabet() {
    const fh = this.resource;
    let buf;

    buf = Buffer.alloc(this.header['alphabet_size']);
    _fs2.default.readSync(fh, buf, 0, this.header['alphabet_size'], this.header['alphabet_offset']);

    return buf.toString();
  }

  getAnnot(trans) {
    if (!(trans & 0x0100)) {
      return null;
    }

    const fh = this.resource;
    const offset = this.header['annot_offset'] + ((trans & 0xFF) << 22 | trans >> 10 & 0x3FFFFF);
    let len;
    let annot;
    let buf;

    buf = Buffer.alloc(1);
    _fs2.default.readSync(fh, buf, 0, 1, offset);
    len = _utils.php.strings.ord(buf);

    if (len) {
      buf = Buffer.alloc(len);
      _fs2.default.readSync(fh, buf, 0, len, offset + 1);
      annot = buf;
    } else {
      annot = null;
    }

    return annot;
  }

  getAlphabetNum() {
    if (!_utils.php.var.isset(this.alphabet_num)) {
      this.alphabet_num = _utils.php.array.array_map(_utils.php.strings.ord, this.getAlphabet());
    }

    return this.alphabet_num;
  }

}

exports.Morphy_Fsa_Sparse_File = Morphy_Fsa_Sparse_File;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Fsa_Sparse_Mem = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

var _fsa = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_Fsa_Sparse_Mem extends _fsa.Morphy_Fsa {

  constructor(...args) {
    super(...args);

    this.alphabet_num = null;
  }

  /**
   * @param trans
   * @param word
   * @param {boolean} [readAnnot=true]
   */
  walk(trans, word, readAnnot = true) {
    const mem = this.resource;
    const fsa_start = this.fsa_start;
    const wordBuf = Buffer.from(word);
    let prev_trans;
    let char;
    let result;
    let annot;
    let buf;

    let i = 0;
    let c = wordBuf.length;
    for (; i < c; i++) {
      prev_trans = trans;
      char = _utils.php.strings.ord(wordBuf, i);

      /////////////////////////////////
      // find char in state begin
      // sparse version
      result = true;
      buf = _utils.php.strings.substr(mem, fsa_start + ((trans >> 10 & 0x3FFFFF) + char + 1 << 2), 4);
      trans = _utils.php.unpack('V', buf)[0];

      if (trans & 0x0200 || (trans & 0xFF) != char) {
        result = false;
      }
      // find char in state end
      /////////////////////////////////

      if (!result) {
        trans = prev_trans;
        break;
      }
    }

    annot = null;
    result = false;
    prev_trans = trans;

    if (i >= c) {
      // Read annotation when we walked all chars in word
      result = true;

      if (readAnnot) {
        // read annot trans
        buf = _utils.php.strings.substr(mem, fsa_start + ((trans >> 10 & 0x3FFFFF) << 2), 4);
        trans = _utils.php.unpack('V', buf)[0];

        if ((trans & 0x0100) == 0) {
          result = false;
        } else {
          annot = this.getAnnot(trans);
        }
      }
    }

    return {
      result,
      annot,
      walked: i,
      last_trans: trans,
      word_trans: prev_trans
    };
  }

  /**
   * @param {*} startNode
   * @param {*} callback
   * @param {boolean} [readAnnot=true]
   * @param {string} [path=]
   * @returns {number}
   */
  collect(startNode, callback, readAnnot = true, path = '') {
    const stack = [];
    const stack_idx = [];

    let total = 0;
    let start_idx = 0;
    let state;
    let trans;
    let annot;

    stack.push(null);
    stack_idx.push(null);

    state = this.readState(startNode >> 10 & 0x3FFFFF);

    do {
      let i = start_idx;
      let c = _lodash2.default.size(state);
      for (; i < c; i++) {
        trans = state[i];

        if (trans & 0x0100) {
          total++;

          if (readAnnot) {
            annot = this.getAnnot(trans);
          } else {
            annot = trans;
          }

          //if (!php.funchand.call_user_func(callback, path, annot)) {
          if (!_utils.php.funchand.call_user_func(callback, null, annot)) {
            return total;
          }
        } else {
          //path += php.strings.chr((trans & 0xFF));
          stack.push(state);
          stack_idx.push(i + 1);
          state = this.readState(trans >> 10 & 0x3FFFFF);
          start_idx = 0;

          break;
        }
      }

      if (i >= c) {
        state = stack.pop();
        start_idx = stack_idx.pop();
        //path      = php.strings.substr(Buffer.from(path), 0, -1).toString();
      }
    } while (!!stack.length);

    return total;
  }

  readState($index) {
    const mem = this.resource;
    const fsa_start = this.fsa_start;
    const result = [];

    let buf;
    let trans;
    let start_offset = fsa_start + ($index << 2);

    // first try read annot transition
    buf = _utils.php.strings.substr(mem, start_offset, 4);
    trans = _utils.php.unpack('V', buf)[0];

    if (trans & 0x0100) {
      result.push(trans);
    }

    // read rest
    start_offset += 4;
    _lodash2.default.forEach(this.getAlphabetNum(), char => {
      buf = _utils.php.strings.substr(mem, start_offset + (char << 2), 4);
      trans = _utils.php.unpack('V', buf)[0];

      //if(!(trans & 0x0200) && (trans & 0xFF) == char) {
      // TODO: check term and empty flags at once i.e. trans & 0x0300
      if (!(trans & 0x0200 || trans & 0x0100) && (trans & 0xFF) == char) {
        result.push(trans);
      }
    });

    return result;
  }

  unpackTranses(rawTranses) {
    rawTranses = (0, _utils.castArray)(rawTranses);
    const result = [];

    _lodash2.default.forEach(rawTranses, rawTrans => {
      result.push({
        term: !!(rawTrans & 0x0100),
        empty: !!(rawTrans & 0x0200),
        attr: rawTrans & 0xFF,
        dest: rawTrans >> 10 & 0x3FFFFF
      });
    });

    return result;
  }

  readRootTrans() {
    const mem = this.resource;
    const fsa_start = this.fsa_start;

    let buf;
    let trans;

    buf = _utils.php.strings.substr(mem, fsa_start + 4, 4);
    trans = _utils.php.unpack('V', buf)[0];

    return trans;
  }

  readAlphabet() {
    const mem = this.resource;
    const buf = _utils.php.strings.substr(mem, this.header['alphabet_offset'], this.header['alphabet_size']);

    return buf.toString();
  }

  getAnnot(trans) {
    if (!(trans & 0x0100)) {
      return null;
    }

    const mem = this.resource;
    const offset = this.header['annot_offset'] + ((trans & 0xFF) << 22 | trans >> 10 & 0x3FFFFF);

    let annot;
    let buf = _utils.php.strings.substr(mem, offset, 1);
    let len = _utils.php.strings.ord(buf);

    if (len) {
      buf = _utils.php.strings.substr(mem, offset + 1, len);
      annot = buf;
    } else {
      annot = null;
    }

    return annot;
  }

  getAlphabetNum() {
    if (!_utils.php.var.isset(this.alphabet_num)) {
      this.alphabet_num = _utils.php.array.array_map(_utils.php.strings.ord, this.getAlphabet());
    }

    return this.alphabet_num;
  }

} /**
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

exports.Morphy_Fsa_Sparse_Mem = Morphy_Fsa_Sparse_Mem;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Fsa_Tree_File = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = __webpack_require__(3);

var _fs2 = _interopRequireDefault(_fs);

var _utils = __webpack_require__(1);

var _fsa = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Morphy_Fsa_Tree_File extends _fsa.Morphy_Fsa {

  constructor(...args) {
    super(...args);
  }

  /**
   * @param trans
   * @param word
   * @param {boolean} [readAnnot=true]
   * @returns {*}
   */
  walk(trans, word, readAnnot = true) {
    const fh = this.resource;
    const fsa_start = this.fsa_start;
    const wordBuf = Buffer.from(word);

    let prev_trans;
    let char;
    let result;
    let start_offset;
    let buf;
    let attr;
    let annot;

    let i = 0;
    let c = wordBuf.length;
    for (; i < c; i++) {
      prev_trans = trans;
      char = _utils.php.strings.ord(wordBuf, i);

      /////////////////////////////////
      // find char in state begin
      // tree version
      result = true;
      start_offset = fsa_start + ((trans >> 11 & 0x1FFFFF) << 2);

      // read first trans in state
      buf = Buffer.alloc(4);
      _fs2.default.readSync(fh, buf, 0, 4, start_offset);
      trans = _utils.php.unpack('V', buf)[0];

      // If first trans is term(i.e. pointing to annot) then skip it
      if (trans & 0x0100) {
        // When this is single transition in state then break
        if (trans & 0x0200 && trans & 0x0400) {
          result = false;
        } else {
          start_offset += 4;
          buf = Buffer.alloc(4);
          _fs2.default.readSync(fh, buf, 0, 4, start_offset);
          trans = _utils.php.unpack('V', buf)[0];
        }
      }

      // if all ok process rest transitions in state
      if (result) {
        // walk through state
        let idx = 1;
        let j = 0;
        for (;; j++) {
          attr = trans & 0xFF;

          if (attr == char) {
            result = true;
            break;
          } else if (attr > char) {
            if (trans & 0x0200) {
              result = false;
              break;
            }

            idx = idx << 1;
          } else {
            if (trans & 0x0400) {
              result = false;
              break;
            }

            idx = (idx << 1) + 1;
          }

          if (j > 255) {
            throw new Error('Infinite recursion possible');
          }

          // read next trans
          buf = Buffer.alloc(4);
          _fs2.default.readSync(fh, buf, 0, 4, start_offset + (idx - 1 << 2));
          trans = _utils.php.unpack('V', buf)[0];
        }
      }
      // find char in state end
      /////////////////////////////////

      if (!result) {
        trans = prev_trans;
        break;
      }
    }

    annot = null;
    result = false;
    prev_trans = trans;

    if (i >= c) {
      // Read annotation when we walked all chars in word
      result = true;

      if (readAnnot) {
        // read annot trans
        buf = Buffer.alloc(4);
        _fs2.default.readSync(fh, buf, 0, 4, fsa_start + ((trans >> 11 & 0x1FFFFF) << 2));
        trans = _utils.php.unpack('V', buf)[0];

        if ((trans & 0x0100) == 0) {
          result = false;
        } else {
          annot = this.getAnnot(trans);
        }
      }
    }

    return {
      result,
      annot,
      walked: i,
      last_trans: trans,
      word_trans: prev_trans
    };
  }

  /**
   * @param startNode
   * @param callback
   * @param {boolean} [readAnnot=true]
   * @param {string} [path=]
   * @returns {number}
   */
  collect(startNode, callback, readAnnot = true, path = '') {
    // `path` нигде не используется, даже в `Morphy_Morphier_PredictCollector.collect`,
    // куда попадает этот `path` через вызов коллбека ниже
    const stack = [];
    const stack_idx = [];

    let total = 0;
    let start_idx = 0;
    let state;
    let trans;
    let annot;

    stack.push(null);
    stack_idx.push(null);
    state = this.readState(startNode >> 11 & 0x1FFFFF);

    do {
      let i = start_idx;
      let c = _lodash2.default.size(state);
      for (; i < c; i++) {
        trans = state[i];

        if (trans & 0x0100) {
          total++;

          if (readAnnot) {
            annot = this.getAnnot(trans);
          } else {
            annot = trans;
          }

          if (!_utils.php.funchand.call_user_func(callback, null, annot)) {
            return total;
          }
        } else {
          //path += php.strings.chr((trans & 0xFF));
          stack.push(state);
          stack_idx.push(i + 1);
          state = this.readState(trans >> 11 & 0x1FFFFF);
          start_idx = 0;

          break;
        }
      }

      if (i >= c) {
        state = stack.pop();
        start_idx = stack_idx.pop();
        //path = php.strings.substr(path, 0, -1);
      }
    } while (!!stack.length);

    return total;
  }

  readState(index) {
    const fh = this.resource;
    const fsa_start = this.fsa_start;
    const result = [];

    let buf;
    let trans;
    let offset = fsa_start + (index << 2);

    // read first trans
    buf = Buffer.alloc(4);
    _fs2.default.readSync(fh, buf, 0, 4, offset);
    trans = _utils.php.unpack('V', buf)[0];

    // check if first trans is pointer to annot, and not single in state
    if (trans & 0x0100 && !(trans & 0x0200 || trans & 0x0400)) {
      result.push(trans);

      buf = Buffer.alloc(4);
      _fs2.default.readSync(fh, buf, 0, 4, null);
      trans = _utils.php.unpack('V', buf)[0];
      offset += 4;
    }

    // read rest
    for (let expect = 1; expect; expect--) {
      if (!(trans & 0x0200)) {
        expect++;
      }
      if (!(trans & 0x0400)) {
        expect++;
      }

      result.push(trans);

      if (expect > 1) {
        buf = Buffer.alloc(4);
        _fs2.default.readSync(fh, buf, 0, 4, null);
        trans = _utils.php.unpack('V', buf)[0];
        offset += 4;
      }
    }

    return result;
  }

  unpackTranses(rawTranses) {
    rawTranses = (0, _utils.castArray)(rawTranses);
    const result = [];

    _lodash2.default.forEach(rawTranses, rawTrans => {
      result.push({
        term: !!(rawTrans & 0x0100),
        llast: !!(rawTrans & 0x0200),
        rlast: !!(rawTrans & 0x0400),
        attr: rawTrans & 0xFF,
        dest: rawTrans >> 11 & 0x1FFFFF
      });
    });

    return result;
  }

  readRootTrans() {
    const fh = this.resource;
    const fsa_start = this.fsa_start;

    let buf = Buffer.alloc(4);
    _fs2.default.readSync(fh, buf, 0, 4, fsa_start + 0);
    return _utils.php.unpack('V', buf)[0];
  }

  readAlphabet() {
    const fh = this.resource;
    let buf = Buffer.alloc(this.header['alphabet_size']);
    _fs2.default.readSync(fh, buf, 0, this.header['alphabet_size'], this.header['alphabet_offset']);

    return buf.toString();
  }

  getAnnot(trans) {
    if (!(trans & 0x0100)) {
      return null;
    }

    const fh = this.resource;
    const offset = this.header['annot_offset'] + ((trans & 0xFF) << 21 | trans >> 11 & 0x1FFFFF);

    let annot;
    let buf = Buffer.alloc(1);
    _fs2.default.readSync(fh, buf, 0, 1, offset);

    let len = _utils.php.strings.ord(buf);
    if (len) {
      buf = Buffer.alloc(len);
      _fs2.default.readSync(fh, buf, 0, len, null);
      annot = buf;
    } else {
      annot = null;
    }

    return annot;
  }

}

exports.Morphy_Fsa_Tree_File = Morphy_Fsa_Tree_File;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Fsa_Tree_Mem = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

var _fsa = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_Fsa_Tree_Mem extends _fsa.Morphy_Fsa {

  constructor(...args) {
    super(...args);
  }

  /**
   * @param trans
   * @param word
   * @param {boolean} [readAnnot=true]
   * @returns {*}
   */
  walk(trans, word, readAnnot = true) {
    const mem = this.resource;
    const fsa_start = this.fsa_start;
    const wordBuf = Buffer.from(word);

    let prev_trans;
    let char;
    let result;
    let start_offset;
    let buf;
    let attr;
    let annot;

    let i = 0;
    let c = wordBuf.length;
    for (; i < c; i++) {
      prev_trans = trans;
      char = _utils.php.strings.ord(wordBuf, i);

      /////////////////////////////////
      // find char in state begin
      // tree version
      result = true;
      start_offset = fsa_start + ((trans >> 11 & 0x1FFFFF) << 2);

      // read first trans in state
      buf = _utils.php.strings.substr(mem, start_offset, 4);
      trans = _utils.php.unpack('V', buf)[0];

      // If first trans is term(i.e. pointing to annot) then skip it
      if (trans & 0x0100) {
        // When this is single transition in state then break
        if (trans & 0x0200 && trans & 0x0400) {
          result = false;
        } else {
          start_offset += 4;
          buf = _utils.php.strings.substr(mem, start_offset, 4);
          trans = _utils.php.unpack('V', buf)[0];
        }
      }

      // if all ok process rest transitions in state
      if (result) {
        // walk through state
        for (let idx = 1, j = 0;; j++) {
          attr = trans & 0xFF;

          if (attr == char) {
            result = true;
            break;
          } else if (attr > char) {
            if (trans & 0x0200) {
              result = false;
              break;
            }

            idx = idx << 1;
          } else {
            if (trans & 0x0400) {
              result = false;
              break;
            }

            idx = (idx << 1) + 1;
          }

          if (j > 255) {
            throw new Error('Infinite recursion possible');
          }

          // read next trans
          buf = _utils.php.strings.substr(mem, start_offset + (idx - 1 << 2), 4);
          trans = _utils.php.unpack('V', buf)[0];
        }
      }

      // find char in state end
      /////////////////////////////////

      if (!result) {
        trans = prev_trans;
        break;
      }
    }

    annot = null;
    result = false;
    prev_trans = trans;

    if (i >= c) {
      // Read annotation when we walked all chars in word
      result = true;

      if (readAnnot) {
        // read annot trans
        buf = _utils.php.strings.substr(mem, fsa_start + ((trans >> 11 & 0x1FFFFF) << 2), 4);
        trans = _utils.php.unpack('V', buf)[0];

        if ((trans & 0x0100) == 0) {
          result = false;
        } else {
          annot = this.getAnnot(trans);
        }
      }
    }

    return {
      result,
      annot,
      walked: i,
      last_trans: trans,
      word_trans: prev_trans
    };
  }

  /**
   * @param startNode
   * @param callback
   * @param {boolean} [readAnnot=true]
   * @param {string} [path=]
   * @returns {number}
   */
  collect(startNode, callback, readAnnot = true, path = '') {
    // `path` нигде не используется, даже в `Morphy_Morphier_PredictCollector.collect`,
    // куда попадает этот `path` через вызов коллбека ниже

    const stack = [];
    const stack_idx = [];

    let total = 0;
    let start_idx = 0;
    let trans;
    let annot;

    stack.push(null);
    stack_idx.push(null);

    let state = this.readState(startNode >> 11 & 0x1FFFFF);

    do {
      let i = start_idx;
      let c = _lodash2.default.size(state);
      for (; i < c; i++) {
        trans = state[i];

        if (trans & 0x0100) {
          total++;

          if (readAnnot) {
            annot = this.getAnnot(trans);
          } else {
            annot = trans;
          }

          //if (!php.funchand.call_user_func(callback, path, annot)) {
          if (!_utils.php.funchand.call_user_func(callback, null, annot)) {
            return total;
          }
        } else {
          //path += php.strings.chr((trans & 0xFF));
          stack.push(state);
          stack_idx.push(i + 1);
          state = this.readState(trans >> 11 & 0x1FFFFF);
          start_idx = 0;

          break;
        }
      }

      if (i >= c) {
        state = stack.pop();
        start_idx = stack_idx.pop();
        //path = php.strings.substr(path, 0, -1);
      }
    } while (!!stack.length);

    return total;
  }

  readState(index) {
    const mem = this.resource;
    const fsa_start = this.fsa_start;
    const result = [];

    let offset = fsa_start + (index << 2);
    // read first trans
    let buf = _utils.php.strings.substr(mem, offset, 4);
    let trans = _utils.php.unpack('V', buf)[0];

    // check if first trans is pointer to annot, and not single in state
    if (trans & 0x0100 && !(trans & 0x0200 || trans & 0x0400)) {
      result.push(trans);
      buf = _utils.php.strings.substr(mem, offset, 4);
      trans = _utils.php.unpack('V', buf)[0];
      offset += 4;
    }

    // read rest
    for (let expect = 1; expect; expect--) {
      if (!(trans & 0x0200)) {
        expect++;
      }
      if (!(trans & 0x0400)) {
        expect++;
      }

      result.push(trans);

      if (expect > 1) {
        buf = _utils.php.strings.substr(mem, offset, 4);
        trans = _utils.php.unpack('V', buf)[0];
        offset += 4;
      }
    }

    return result;
  }

  unpackTranses(rawTranses) {
    rawTranses = (0, _utils.castArray)(rawTranses);
    const result = [];

    _lodash2.default.forEach(rawTranses, rawTrans => {
      result.push({
        term: !!(rawTrans & 0x0100),
        llast: !!(rawTrans & 0x0200),
        rlast: !!(rawTrans & 0x0400),
        attr: rawTrans & 0xFF,
        dest: rawTrans >> 11 & 0x1FFFFF
      });
    });

    return result;
  }

  readRootTrans() {
    const fh = this.resource;
    const fsa_start = this.fsa_start;

    let buf = _utils.php.strings.substr(fh, fsa_start + 0, 4);
    return _utils.php.unpack('V', buf)[0];
  }

  readAlphabet() {
    const fh = this.resource;
    let buf = _utils.php.strings.substr(fh, this.header['alphabet_offset'], this.header['alphabet_size']);

    return buf.toString();
  }

  getAnnot(trans) {
    if (!(trans & 0x0100)) {
      return null;
    }

    const fh = this.resource;
    const offset = this.header['annot_offset'] + ((trans & 0xFF) << 21 | trans >> 11 & 0x1FFFFF);

    let annot;
    let buf = _utils.php.strings.substr(fh, offset, 1);
    let len = _utils.php.strings.ord(buf);
    if (len) {
      buf = _utils.php.strings.substr(fh, offset + 1, len);
      annot = buf;
    } else {
      annot = null;
    }

    return annot;
  }

} /**
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

exports.Morphy_Fsa_Tree_Mem = Morphy_Fsa_Tree_Mem;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GramInfo_File = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = __webpack_require__(3);

var _fs2 = _interopRequireDefault(_fs);

var _utils = __webpack_require__(1);

var _graminfo = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Morphy_GramInfo_File extends _graminfo.Morphy_GramInfo {

  constructor(...args) {
    super(...args);

    // todo: вместо магической константы, хаотично распиханной по методам, подставить эту переменную
    this.header_size = 20;
  }

  getGramInfoHeaderSize() {
    return 20;
  }

  readGramInfoHeader(offset) {
    const fh = this.resource;
    let buf = Buffer.alloc(20);

    _fs2.default.readSync(fh, buf, 0, 20, offset);

    const result = _utils.php.unpack(['vid', 'vfreq', 'vforms_count', 'vpacked_forms_count', 'vancodes_count', 'vancodes_offset', 'vancodes_map_offset', 'vaffixes_offset', 'vaffixes_size', 'vbase_size'].join('/'), buf);

    result['offset'] = offset;

    return result;
  }

  readAncodesMap(info) {
    const fh = this.resource;
    // TODO: this can be wrong due to aligning ancodes map section
    const offset = info['offset'] + 20 + info['forms_count'] * 2;
    const forms_count = info['packed_forms_count'];
    const buf = Buffer.alloc(forms_count * 2);
    _fs2.default.readSync(fh, buf, 0, forms_count * 2, offset);

    return _utils.php.unpack('v' + forms_count, buf);
  }

  splitAncodes(ancodes, map) {
    const result = [];

    let k;
    let kc;
    let j = 0;
    _lodash2.default.forEach(map, function (mapItem) {
      const res = [];

      for (k = 0, kc = mapItem; k < kc; k++, j++) {
        res.push(ancodes[j]);
      }

      result.push(res);
    });

    return result;
  }

  readAncodes(info) {
    const fh = this.resource;
    // TODO: this can be wrong due to aligning ancodes section
    const offset = info['offset'] + 20;
    const forms_count = info['forms_count'];
    const buf = Buffer.alloc(forms_count * 2);
    _fs2.default.readSync(fh, buf, 0, forms_count * 2, offset);
    const ancodes = _utils.php.unpack('v' + forms_count, buf);

    // if (!expand) { return ancodes; }

    const map = this.readAncodesMap(info);

    return this.splitAncodes(ancodes, map);
  }

  readFlexiaData(info) {
    const fh = this.resource;
    let offset = info['offset'] + 20;

    if (_utils.php.var.isset(info['affixes_offset'])) {
      offset += info['affixes_offset'];
    } else {
      offset += info['forms_count'] * 2 + info['packed_forms_count'] * 2;
    }

    const buf = Buffer.alloc(info['affixes_size'] - this.ends_size);
    _fs2.default.readSync(fh, buf, 0, info['affixes_size'] - this.ends_size, offset);

    return buf.toString().split(this.ends.toString());
  }

  readAllGramInfoOffsets() {
    return this.readSectionIndex(this.header['flex_index_offset'], this.header['flex_count']);
  }

  readSectionIndex(offset, count) {
    const buf = Buffer.alloc(count * 4);
    _fs2.default.readSync(this.resource, buf, 0, count * 4, offset);

    return _lodash2.default.values(_utils.php.unpack('V' + count, buf));
  }

  readAllFlexia() {
    const result = {};
    let offset = this.header['flex_offset'];

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['flex_index_offset'], this.header['flex_count'], this.header['flex_size']), size => {
      const header = this.readGramInfoHeader(offset);
      const affixes = this.readFlexiaData(header);
      const ancodes = this.readAncodes(header, true);

      // todo: проверить полученные переменные
      result[header['id']] = {
        'header': header,
        'affixes': affixes,
        'ancodes': ancodes
      };

      offset += size;
    });

    return result;
  }

  readAllPartOfSpeech() {
    const fh = this.resource;
    const result = {};
    let offset = this.header['poses_offset'];
    let buf;
    let res;

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['poses_index_offset'], this.header['poses_count'], this.header['poses_size']), size => {
      buf = Buffer.alloc(3);
      _fs2.default.readSync(fh, buf, 0, 3, offset);
      res = _utils.php.unpack('vid/Cis_predict', buf);

      buf = Buffer.alloc(size - 3);
      _fs2.default.readSync(fh, buf, 0, size - 3, offset);

      result[res['id']] = {
        name: this.cleanupCString(buf),
        is_predict: !!res['is_predict']
      };

      offset += size;
    });

    // todo: сверить result
    return result;
  }

  readAllGrammems() {
    const fh = this.resource;
    const result = {};
    let offset = this.header['grammems_offset'];
    let buf;
    let res;

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['grammems_index_offset'], this.header['grammems_count'], this.header['grammems_size']), size => {
      buf = Buffer.alloc(3);
      _fs2.default.readSync(fh, buf, 0, 3, offset);
      res = _utils.php.unpack('vid/Cshift', buf);

      buf = Buffer.alloc(size - 3);
      _fs2.default.readSync(fh, buf, 0, size - 3, offset);

      result[res['id']] = {
        name: this.cleanupCString(buf),
        shift: res['shift']
      };

      offset += size;
    });

    return result;
  }

  readAllAncodes() {
    const fh = this.resource;
    const result = {};
    let offset = this.header['ancodes_offset'];
    let res;
    let grammems_count;
    let grammem_ids;
    let buf;

    for (let i = 0; i < this.header['ancodes_count']; i++) {
      buf = Buffer.alloc(4);
      _fs2.default.readSync(fh, buf, 0, 4, offset);
      res = _utils.php.unpack('vid/vpos_id', buf);

      offset += 4;

      buf = Buffer.alloc(2);
      _fs2.default.readSync(fh, buf, 0, 2, offset);
      grammems_count = _utils.php.unpack('v', buf)[1];

      offset += 2;

      if (grammems_count) {
        buf = Buffer.alloc(grammems_count * 2);
        _fs2.default.readSync(fh, buf, 0, grammems_count * 2, offset);
        grammem_ids = _lodash2.default.values(_utils.php.unpack('v' + grammems_count, buf));
      } else {
        grammem_ids = [];
      }

      result[res['id']] = {
        pos_id: res['pos_id'],
        offset: offset,
        grammem_ids: grammem_ids
      };

      offset += grammems_count * 2;
    }

    return result;
  }

}

exports.Morphy_GramInfo_File = Morphy_GramInfo_File;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GramInfo_Mem = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

var _graminfo = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_GramInfo_Mem extends _graminfo.Morphy_GramInfo {

  constructor(...args) {
    super(...args);
  }

  getGramInfoHeaderSize() {
    return 20;
  }

  readGramInfoHeader(offset) {
    const mem = this.resource;
    const result = _utils.php.unpack(['vid', 'vfreq', 'vforms_count', 'vpacked_forms_count', 'vancodes_count', 'vancodes_offset', 'vancodes_map_offset', 'vaffixes_offset', 'vaffixes_size', 'vbase_size'].join('/'), _utils.php.strings.substr(mem, offset, 20));

    result['offset'] = offset;

    return result;
  }

  readAncodesMap(info) {
    const mem = this.resource;
    const forms_count = info['packed_forms_count'];
    // TODO: this can be wrong due to aligning ancodes map section
    const offset = info['offset'] + 20 + info['forms_count'] * 2;

    return _utils.php.unpack('v' + forms_count, _utils.php.strings.substr(mem, offset, forms_count * 2));
  }

  splitAncodes(ancodes, map) {
    const result = [];

    let k;
    let kc;
    let j = 0;
    _lodash2.default.forEach(map, mapItem => {
      const res = [];

      for (k = 0, kc = mapItem; k < kc; k++, j++) {
        res.push(ancodes[j]);
      }

      result.push(res);
    });

    return result;
  }

  readAncodes(info) {
    const mem = this.resource;
    const forms_count = info['forms_count'];
    // TODO: this can be wrong due to aligning ancodes section
    const offset = info['offset'] + 20;
    const ancodes = _utils.php.unpack('v' + forms_count, _utils.php.strings.substr(mem, offset, forms_count * 2));
    const map = this.readAncodesMap(info);

    return this.splitAncodes(ancodes, map);
  }

  readFlexiaData(info) {
    const mem = this.resource;
    let offset = info['offset'] + 20;

    if (_utils.php.var.isset(info['affixes_offset'])) {
      offset += info['affixes_offset'];
    } else {
      offset += info['forms_count'] * 2 + info['packed_forms_count'] * 2;
    }

    return _utils.php.strings.substr(mem, offset, info['affixes_size'] - this.ends_size).toString().split(this.ends.toString());
  }

  readAllGramInfoOffsets() {
    return this.readSectionIndex(this.header['flex_index_offset'], this.header['flex_count']);
  }

  readSectionIndex(offset, count) {
    const mem = this.resource;

    return _utils.php.array.array_values(_utils.php.unpack('V' + count, _utils.php.strings.substr(mem, offset, count * 4)));
  }

  readAllFlexia() {
    const result = {};
    let offset = this.header['flex_offset'];

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['flex_index_offset'], this.header['flex_count'], this.header['flex_size']), size => {
      const header = this.readGramInfoHeader(offset);
      const affixes = this.readFlexiaData(header);
      const ancodes = this.readAncodes(header, true);

      result[header['id']] = {
        header: header,
        affixes: affixes,
        ancodes: ancodes
      };

      offset += size;
    });

    return result;
  }

  readAllPartOfSpeech() {
    const mem = this.resource;
    const result = {};
    let offset = this.header['poses_offset'];
    let res;

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['poses_index_offset'], this.header['poses_count'], this.header['poses_size']), $size => {
      res = _utils.php.unpack('vid/Cis_predict', _utils.php.strings.substr(mem, offset, 3));

      result[res['id']] = {
        name: this.cleanupCString(_utils.php.strings.substr(mem, offset + 3, $size - 3)),
        is_predict: !!res['is_predict']
      };

      offset += $size;
    });

    return result;
  }

  readAllGrammems() {
    const mem = this.resource;
    const result = {};
    let offset = this.header['grammems_offset'];
    let res;

    _lodash2.default.forEach(this.readSectionIndexAsSize(this.header['grammems_index_offset'], this.header['grammems_count'], this.header['grammems_size']), size => {
      res = _utils.php.unpack('vid/Cshift', _utils.php.strings.substr(mem, offset, 3));

      result[res['id']] = {
        'shift': res['shift'],
        'name': this.cleanupCString(_utils.php.strings.substr(mem, offset + 3, size - 3))
      };

      offset += size;
    });

    return result;
  }

  readAllAncodes() {
    const mem = this.resource;
    const result = {};
    let offset = this.header['ancodes_offset'];
    let res;
    let grammems_count;
    let grammem_ids;

    for (let $i = 0; $i < this.header['ancodes_count']; $i++) {
      res = _utils.php.unpack('vid/vpos_id', _utils.php.strings.substr(mem, offset, 4));
      offset += 4;

      grammems_count = _utils.php.unpack('v', _utils.php.strings.substr(mem, offset, 2))[1];
      offset += 2;

      grammem_ids = grammems_count ? _utils.php.array.array_values(_utils.php.unpack('v' + grammems_count, _utils.php.strings.substr(mem, offset, grammems_count * 2))) : [];

      result[res['id']] = {
        offset,
        grammem_ids,
        pos_id: res['pos_id']
      };

      offset += grammems_count * 2;
    }

    return result;
  }

} /**
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

exports.Morphy_GramInfo_Mem = Morphy_GramInfo_Mem;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GrammemsProvider_ru_ru = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

var _common = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Morphy_GrammemsProvider_ru_ru_instances = new WeakMap();

class Morphy_GrammemsProvider_ru_ru extends _common.Morphy_GrammemsProvider_ForFactory {

  static get self_encoding() {
    return 'utf-8';
  }

  static get grammems_map() {
    return {
      'род': ['МР', 'ЖР', 'СР'],
      'одушевленность': ['ОД', 'НО'],
      'число': ['ЕД', 'МН'],
      'падеж': ['ИМ', 'РД', 'ДТ', 'ВН', 'ТВ', 'ПР', 'ЗВ', '2'],
      'залог': ['ДСТ', 'СТР'],
      'время': ['НСТ', 'ПРШ', 'БУД'],
      'повелительная форма': ['ПВЛ'],
      'лицо': ['1Л', '2Л', '3Л'],
      'краткость': ['КР'],
      'сравнительная форма': ['СРАВН'],
      'превосходная степень': ['ПРЕВ'],
      'вид': ['СВ', 'НС'],
      'переходность': ['ПЕ', 'НП'],
      'безличный глагол': ['БЕЗЛ']
    };
  }

  /**
   * @param {phpMorphy} morphy
   * @returns {*}
   */
  static instance(morphy) {
    const key = morphy.getEncoding();
    if (!Morphy_GrammemsProvider_ru_ru_instances.has(morphy)) {
      Morphy_GrammemsProvider_ru_ru_instances.set(morphy, {});
    }

    const instances = Morphy_GrammemsProvider_ru_ru_instances.get(morphy);

    if (_lodash2.default.isUndefined(instances[key])) {
      instances[key] = new Morphy_GrammemsProvider_ru_ru(key);
    }

    return instances[key];
  }

  constructor() {
    super(...arguments);
  }

  getSelfEncoding() {
    return 'utf-8';
  }

  getGrammemsMap() {
    return Morphy_GrammemsProvider_ru_ru.grammems_map;
  }

}

exports.Morphy_GrammemsProvider_ru_ru = Morphy_GrammemsProvider_ru_ru;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Morphier_Bulk = exports.Morphy_Morphier_Predict_Database = exports.Morphy_Morphier_Predict_Suffix = exports.Morphy_Morphier_Common = exports.Morphy_Morphier_Base = exports.Morphy_Morphier_Finder_Predict_Database = exports.Morphy_Morphier_PredictCollector = exports.Morphy_Morphier_Finder_Predict_Suffix = exports.Morphy_Morphier_Finder_Common = exports.Morphy_Morphier_Finder_Base = exports.Morphy_Morphier_Finder_Interface = exports.Morphy_WordDescriptor = exports.Morphy_WordForm = exports.Morphy_Morphier_Helper = exports.Morphy_WordDescriptor_Collection = exports.Morphy_AncodesResolver_Proxy = exports.Morphy_AncodesResolver_AsIs = exports.Morphy_AncodesResolver_ToDialingAncodes = exports.Morphy_AncodesResolver_ToText = exports.Morphy_AncodesResolver_Interface = exports.Morphy_AnnotDecoder_Factory = exports.Morphy_AnnotDecoder_Predict = exports.Morphy_AnnotDecoder_Common = exports.Morphy_AnnotDecoder_Base = exports.Morphy_AnnotDecoder_Interface = exports.Morphy_Morphier_Empty = exports.Morphy_Morphier_Interface = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
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

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

var _unicode = __webpack_require__(24);

var _fsa = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ----------------------------
// Morphier interface
// ----------------------------
class Morphy_Morphier_Interface {

  getAnnot(word) {}

  getBaseForm(word) {}

  getAllForms(word) {}

  getPseudoRoot(word) {}

  getPartOfSpeech(word) {}

  getWordDescriptor(word) {}

  getAllFormsWithAncodes(word) {}

  getAncode(word) {}

  getGrammarInfoMergeForms(word) {}

  getGrammarInfo(word) {}

}

class Morphy_Morphier_Empty extends Morphy_Morphier_Interface {

  getAnnot(word) {
    return false;
  }

  getBaseForm(word) {
    return false;
  }

  getAllForms(word) {
    return false;
  }

  getAllFormsWithGramInfo(word) {
    return false;
  }

  getPseudoRoot(word) {
    return false;
  }

  getPartOfSpeech(word) {
    return false;
  }

  getWordDescriptor(word) {
    return false;
  }

  getAllFormsWithAncodes(word) {
    return false;
  }

  getAncode(word) {
    return false;
  }

  getGrammarInfoMergeForms(word) {
    return false;
  }

  getGrammarInfo(word) {
    return false;
  }

  /**
   * @param word
   * @param partOfSpeech
   * @param grammems
   * @param {boolean} [returnWords=false]
   * @param {*} [callback=null]
   * @returns {boolean}
   */
  castFormByGramInfo(word, partOfSpeech, grammems, returnWords, callback) {
    return false;
  }

}

// ----------------------------
// Annot decoder
// ----------------------------
class Morphy_AnnotDecoder_Interface {

  decode(annotsRaw, withBase) {}

}

class Morphy_AnnotDecoder_Base extends Morphy_AnnotDecoder_Interface {
  static get INVALID_ANCODE_ID() {
    return 0xFFFF;
  }

  constructor(ends) {
    super();
    this.ends = ends;

    this.unpack_str = this.getUnpackString();
    this.block_size = this.getUnpackBlockSize();
  }

  getUnpackString() {}

  getUnpackBlockSize() {}

  decode(annotRawBuf, withBase) {
    if (_utils.php.var.empty(annotRawBuf)) {
      throw new Error("Empty annot given");
    }

    const annotRaw = annotRawBuf.toString();
    const unpack_size = this.block_size;
    const unpack_str = this.unpack_str;
    let result = _utils.php.unpack('Vcount/' + unpack_str, annotRawBuf);
    let res;
    let count;
    let items;
    let start;

    if (result === false) {
      throw new Error(`Invalid annot string '${annotRaw}'`);
    }

    if (result['common_ancode'] == Morphy_AnnotDecoder_Base.INVALID_ANCODE_ID) {
      result['common_ancode'] = null;
    }

    count = result['count'];
    result = [result];

    if (count > 1) {
      for (let i = 0; i < count - 1; i++) {
        start = 4 + (i + 1) * unpack_size;
        res = _utils.php.unpack(unpack_str, annotRawBuf.slice(start, start + unpack_size));

        if (res['common_ancode'] == Morphy_AnnotDecoder_Base.INVALID_ANCODE_ID) {
          res['common_ancode'] = null;
        }

        result.push(res);
      }
    }

    if (withBase) {
      start = 4 + count * unpack_size;
      items = annotRawBuf.slice(start).toString().split(this.ends.toString());
      for (let i = 0; i < count; i++) {
        result[i]['base_prefix'] = items[i * 2];
        result[i]['base_suffix'] = items[i * 2 + 1];
      }
    }

    return result;
  }

}

class Morphy_AnnotDecoder_Common extends Morphy_AnnotDecoder_Base {

  constructor() {
    super(...arguments);
  }

  getUnpackString() {
    return ['Voffset', 'vcplen', 'vplen', 'vflen', 'vcommon_ancode', 'vforms_count', 'vpacked_forms_count', 'vaffixes_size', 'vform_no', 'vpos_id'].join('/');
  }

  getUnpackBlockSize() {
    return 22;
  }

}

class Morphy_AnnotDecoder_Predict extends Morphy_AnnotDecoder_Common {

  constructor() {
    super(...arguments);
  }

  getUnpackString() {
    return [super.getUnpackString(), 'vfreq'].join('/');
  }

  getUnpackBlockSize() {
    return super.getUnpackBlockSize() + 2;
  }

}

const Morphy_AnnotDecoder_Factory_instances = {};
class Morphy_AnnotDecoder_Factory {

  static get instances() {
    return Morphy_AnnotDecoder_Factory_instances;
  }

  static get AnnotDecoders() {
    return {
      Morphy_AnnotDecoder_Common,
      Morphy_AnnotDecoder_Predict
    };
  }

  static create(eos) {
    const instances = Morphy_AnnotDecoder_Factory.instances;

    if (!_utils.php.var.isset(instances[eos])) {
      instances[eos] = new Morphy_AnnotDecoder_Factory(eos);
    }

    return instances[eos];
  }

  constructor(eos) {
    this.eos = eos;
  }

  getCommonDecoder() {
    if (!_utils.php.var.isset(this.cache_common)) {
      this.cache_common = this.instantinate('common');
    }

    return this.cache_common;
  }

  getPredictDecoder() {
    if (!_utils.php.var.isset(this.cache_predict)) {
      this.cache_predict = this.instantinate('predict');
    }

    return this.cache_predict;
  }

  instantinate(type) {
    const className = 'Morphy_AnnotDecoder_' + _utils.php.strings.ucfirst(type.toLowerCase());

    return new Morphy_AnnotDecoder_Factory.AnnotDecoders[className](this.eos);
  }

}

class Morphy_AncodesResolver_Interface {

  resolve(ancodeId) {}

  unresolve(ancode) {}

}

class Morphy_AncodesResolver_ToText extends Morphy_AncodesResolver_Interface {

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @private
   */
  constructor(gramtab) {
    super();
    this.gramtab = gramtab;
  }

  resolve(ancodeId) {
    if (!_utils.php.var.isset(ancodeId)) {
      return null;
    }

    return this.gramtab.ancodeToString(ancodeId);
  }

  unresolve(ancode) {
    return this.gramtab.stringToAncode(ancode);
  }

}

class Morphy_AncodesResolver_ToDialingAncodes extends Morphy_AncodesResolver_Interface {

  /**
   * @param {Morphy_Storage} ancodesMap
   */
  constructor(ancodesMap) {
    super();
    this.ancodes_map = _utils.php.var.unserialize(ancodesMap.read(0, ancodesMap.getFileSize()).toString());
    if (this.ancodes_map === false) {
      throw new Error("Can`t open phpMorphy => Dialing ancodes map");
    }

    this.reverse_map = _utils.php.array.array_flip(this.ancodes_map);
  }

  unresolve(ancode) {
    if (!_utils.php.var.isset(ancode)) {
      return null;
    }

    if (!_utils.php.var.isset(this.reverse_map[ancode])) {
      throw new Error(`Unknown ancode found '${ancode}'`);
    }

    return this.reverse_map[ancode];
  }

  resolve(ancodeId) {
    if (!_utils.php.var.isset(ancodeId)) {
      return null;
    }

    if (!_utils.php.var.isset(this.ancodes_map[ancodeId])) {
      throw new Error(`Unknown ancode id found '${ancodeId}'`);
    }

    return this.ancodes_map[ancodeId];
  }

}

class Morphy_AncodesResolver_AsIs extends Morphy_AncodesResolver_Interface {

  constructor() {
    super();
  }

  resolve(ancodeId) {
    return ancodeId;
  }

  unresolve(ancode) {
    return ancode;
  }

}

class Morphy_AncodesResolver_Proxy extends Morphy_AncodesResolver_Interface {
  static get AncodesResolvers() {
    return {
      Morphy_AncodesResolver_ToText,
      Morphy_AncodesResolver_ToDialingAncodes,
      Morphy_AncodesResolver_AsIs
    };
  }

  static instantinate(className, args) {
    const AncodesResolvers = Morphy_AncodesResolver_Proxy.AncodesResolvers;


    return new AncodesResolvers[className](...args);
    // return new (Function.prototype.bind.apply(AncodesResolvers[className], args));
  }

  constructor(className, ctorArgs) {
    super();
    this.className = className;
    this.args = ctorArgs;
    this.___obj = null;
  }

  unresolve(ancode) {
    return this.__obj.unresolve(ancode);
  }

  resolve(ancodeId) {
    return this.__obj.resolve(ancodeId);
  }

  get __obj() {
    if (!this.___obj) {
      this.___obj = Morphy_AncodesResolver_Proxy.instantinate(this.className, this.args);

      delete this.args;
      delete this.className;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

// ----------------------------
// WordDescriptor
// ----------------------------

/**
 * @class
 * @augments Array
 */
class Morphy_WordDescriptor_Collection extends Array {

  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes#Species
  static get [Symbol.species]() {
    return Array;
  }

  /**
   * @param {*} word
   * @param {*} annots
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(word, annots, helper) {
    super();

    this.word = (word || '') + '';
    this.annots = false === annots ? false : helper.decodeAnnot(annots, true);
    this.helper = helper;

    if (this.annots !== false) {
      _lodash2.default.forEach(this.annots, annot => this.push(this.createDescriptor(word, annot, helper)));
    }
  }

  /**
   * @param {*} word
   * @param {*} annot
   * @param {Morphy_Morphier_Helper} helper
   */
  createDescriptor(word, annot, helper) {
    return new Morphy_WordDescriptor(word, annot, helper);
  }

  getByPartOfSpeech(poses) {
    poses = (0, _utils.castArray)(poses);
    const result = [];

    _lodash2.default.forEach(this, desc => {
      if (desc.hasPartOfSpeech(poses)) {
        result.push(desc);
      }
    });

    return result;
  }

}

// ----------------------------
// Helper
// ----------------------------
class Morphy_Morphier_Helper {

  /**
   * @param {Morphy_GramInfo_Interface} graminfo
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_AncodesResolver_Interface} ancodesResolver
   * @param {*} resolvePartOfSpeech
   */
  constructor(graminfo, gramtab, ancodesResolver, resolvePartOfSpeech) {
    this.graminfo = graminfo;
    this.gramtab = gramtab;
    this.resolve_pos = !!resolvePartOfSpeech;
    this.ancodes_resolver = ancodesResolver;
    this.char_size = graminfo.getCharSize();
    this.ends = graminfo.getEnds();
    this.annot_decoder = null;
    this.gramtab_consts_included = false;
  }

  /**
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  setAnnotDecoder(annotDecoder) {
    this.annot_decoder = annotDecoder;
  }

  // getters
  getEndOfString() {
    return this.ends;
  }

  getCharSize() {
    return this.char_size;
  }

  hasAnnotDecoder() {
    return _utils.php.var.isset(this.annot_decoder);
  }

  getAnnotDecoder() {
    return this.annot_decoder;
  }

  getAncodesResolver() {
    return this.ancodes_resolver;
  }

  getGramInfo() {
    return this.graminfo;
  }

  getGramTab() {
    return this.gramtab;
  }

  isResolvePartOfSpeech() {
    return this.resolve_pos;
  }

  // other
  resolvePartOfSpeech(posId) {
    return this.gramtab.resolvePartOfSpeechId(posId);
  }

  getGrammems(ancodeId) {
    return this.gramtab.getGrammems(ancodeId);
  }

  getGrammemsAndPartOfSpeech(ancodeId) {
    return [this.gramtab.getPartOfSpeech(ancodeId), this.gramtab.getGrammems(ancodeId)];
  }

  extractPartOfSpeech(annot) {
    if (this.resolve_pos) {
      return this.resolvePartOfSpeech(annot['pos_id']);
    }

    return annot['pos_id'];
  }

  includeGramTabConsts() {
    if (this.isResolvePartOfSpeech()) {
      this.gramtab.includeConsts();
    }

    this.gramtab_consts_included = true;
  }

  // getters
  getWordDescriptor(word, annots) {
    if (!this.gramtab_consts_included) {
      this.includeGramTabConsts();
    }

    return new Morphy_WordDescriptor_Collection(word, annots, this);
  }

  getBaseAndPrefix(word, cplen, plen, flen) {
    const wordBuf = Buffer.from(word);
    let base;
    let prefix;

    if (flen) {
      base = _utils.php.strings.substr(wordBuf, cplen + plen, -flen);
    } else {
      if (cplen || plen) {
        base = _utils.php.strings.substr(wordBuf, cplen + plen);
      } else {
        base = wordBuf;
      }
    }

    prefix = cplen ? _utils.php.strings.substr(wordBuf, 0, cplen) : '';
    base = base.toString();
    prefix = prefix.toString();

    return [base, prefix];
  }

  getPartOfSpeech(word, annots) {
    if (annots === false) {
      return false;
    }

    let result = {};
    _lodash2.default.forEach(this.decodeAnnot(annots, false), annot => result[this.extractPartOfSpeech(annot)] = 1);
    result = _lodash2.default.keys(result);
    result = this.resolve_pos ? result : result.map(_lodash2.default.toInteger);

    return result;
  }

  getBaseForm(word, annots) {
    if (annots === false) {
      return false;
    }

    annots = this.decodeAnnot(annots, true);

    return this.composeBaseForms(word, annots);
  }

  getPseudoRoot(word, annots) {
    if (annots == false) {
      return false;
    }

    const result = {};
    annots = this.decodeAnnot(annots, false);
    _lodash2.default.forEach(annots, annot => {
      const base = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen'])[0];

      result[base] = 1;
    });

    return _utils.php.array.array_keys(result);
  }

  getAllForms(word, annots) {
    if (annots === false) {
      return false;
    }

    annots = this.decodeAnnot(annots, false);

    return this.composeForms(word, annots);
  }

  /**
   * @param word
   * @param annots
   * @param partOfSpeech
   * @param grammems
   * @param {boolean} [returnWords=false]
   * @param {*} [callback=null]
   * @returns {*}
   */
  castFormByGramInfo(word, annots, partOfSpeech, grammems, returnWords = false, callback = null) {
    if (annots === false) {
      return false;
    }

    /**
     * @todo: вот сюда данные приходят правильные (как в php),
     * а выходят не правильные (не как в php)
     */

    grammems = _lodash2.default.toArray(grammems);
    partOfSpeech = _utils.php.var.isset(partOfSpeech) ? partOfSpeech + '' : null;

    /**
     * Проверено:
     * grammems
     * partOfSpeech
     * this.decodeAnnot(annots, false)
     */
    const result = !!returnWords ? {} : [];
    _lodash2.default.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const flexias = this.graminfo.readFlexiaData(annot);
      const common_ancode = annot['common_ancode'];
      const common_grammems = _utils.php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];

      var _getBaseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']),
          _getBaseAndPrefix2 = _slicedToArray(_getBaseAndPrefix, 2);

      const base = _getBaseAndPrefix2[0],
            prefix = _getBaseAndPrefix2[1];

      let form_no = 0;
      let i = 0;

      /**
       * Проверено:
       * all_ancodes
       * flexias
       * common_ancode
       * common_grammems
       * base
       * prefix
       */

      _lodash2.default.forEach(all_ancodes, form_ancodes => {
        _lodash2.default.forEach(form_ancodes, ancode => {
          const form_pos = this.gramtab.getPartOfSpeech(ancode);
          const form_grammems = _utils.php.array.array_merge(this.gramtab.getGrammems(ancode), common_grammems);
          const form = [prefix, flexias[i], base, flexias[i + 1]].join('');

          if (_lodash2.default.isFunction(callback)) {
            if (!callback(form, form_pos, form_grammems, form_no)) {
              form_no++;
              return;
            }
          } else {
            if (_utils.php.var.isset(partOfSpeech) && form_pos !== partOfSpeech) {
              form_no++;
              return;
            }

            if (_lodash2.default.size(_utils.php.array.array_diff(grammems, form_grammems)) > 0) {
              form_no++;
              return;
            }
          }

          if (returnWords) {
            result[form] = 1;
          } else {
            result.push({
              form,
              form_no,
              pos: form_pos,
              grammems: form_grammems
            });
          }

          form_no++;
        });

        i += 2;
      });
    });

    return returnWords ? _utils.php.array.array_keys(result) : result;
  }

  getAncode(annots) {
    if (annots === false) {
      return false;
    }

    const result = [];
    _lodash2.default.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);

      result.push({
        common: this.ancodes_resolver.resolve(annot['common_ancode']),
        all: _utils.php.array.array_map([this.ancodes_resolver, 'resolve'], all_ancodes[annot['form_no']])
      });
    });

    return _lodash2.default.uniqWith(result, _lodash2.default.isEqual);
  }

  getGrammarInfoMergeForms(annots) {
    if (annots === false) {
      return false;
    }

    const result = [];
    _lodash2.default.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const common_ancode = annot['common_ancode'];
      const form_no = annot['form_no'];
      let grammems = _utils.php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];
      let forms_count = 0;

      let ancodeId;
      _lodash2.default.forEach(all_ancodes[form_no], ancode => {
        ancodeId = ancode;

        grammems = _utils.php.array.array_merge(grammems, this.gramtab.getGrammems(ancode));
        forms_count++;
      });

      grammems = _lodash2.default.sortedUniq(_lodash2.default.sortBy(grammems, this.resolve_pos ? JSON.stringify : _lodash2.default.toInteger));

      result.push({
        // todo: незарезолвенный ancodeId
        // part of speech identical across all joined forms
        pos: this.gramtab.getPartOfSpeech(ancodeId),
        grammems,
        forms_count,
        form_no_low: form_no,
        form_no_high: form_no + forms_count
      });
    });

    return _lodash2.default.uniqWith(result, _lodash2.default.isEqual);
  }

  getGrammarInfo(annots) {
    if (annots == false) {
      return false;
    }

    const result = [];
    _lodash2.default.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const common_ancode = annot['common_ancode'];
      const common_grammems = _utils.php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];
      const info = [];
      const form_no = annot['form_no'];

      _lodash2.default.forEach(all_ancodes[form_no], ancode => {
        let grammems = _utils.php.array.array_merge(common_grammems, this.gramtab.getGrammems(ancode));
        grammems = _lodash2.default.sortBy(grammems, this.resolve_pos ? JSON.stringify : _lodash2.default.toInteger);

        let info_item = {
          pos: this.gramtab.getPartOfSpeech(ancode),
          grammems,
          form_no
        };

        info.push(info_item);
      });

      let unique_info = _lodash2.default.sortedUniq(_lodash2.default.sortBy(info, JSON.stringify));

      result.push(unique_info);
    });

    return _lodash2.default.uniqWith(result, _lodash2.default.isEqual);
  }

  /**
   * @param word
   * @param annots
   * @param {string} [resolveType='no_resolve']
   * @returns {boolean}
   */
  getAllFormsWithResolvedAncodes(word, annots, resolveType = 'no_resolve') {
    if (annots == false) {
      return false;
    }

    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithResolvedAncodes(word, annots);
  }

  getAllFormsWithAncodes(word, annots, foundFormNo) {
    if (annots === false) {
      return false;
    }

    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithAncodes(word, annots);
  }

  getAllAncodes(word, annots) {
    if (annots === false) {
      return false;
    }

    const result = [];

    _lodash2.default.forEach(annots, annot => result.push(this.graminfo.readAncodes(annot)));

    return result;
  }

  composeBaseForms(word, annots) {
    const result = {};

    _lodash2.default.forEach(annots, annot => {
      if (annot['form_no'] > 0) {
        const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
        const base = baseAndPrefix[0];
        const prefix = baseAndPrefix[1];
        const form = [prefix, annot['base_prefix'], base, annot['base_suffix']].join('');

        result[form] = 1;
      } else {
        result[word] = 1;
      }
    });

    return _utils.php.array.array_keys(result);
  }

  composeForms(word, annots) {
    const result = {};

    _lodash2.default.forEach(annots, annot => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);

      let form;
      for (let i = 0, c = _lodash2.default.size(flexias); i < c; i += 2) {
        form = [prefix, flexias[i], base, flexias[i + 1]].join('');
        result[form] = 1;
      }
    });

    return _utils.php.array.array_keys(result);
  }

  composeFormsWithResolvedAncodes(word, annots) {
    const result = [];

    _lodash2.default.forEach(annots, (annot, annotIdx) => {
      const words = [];
      const ancodes = [];
      const common_ancode = annot['common_ancode'];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const all_ancodes = this.graminfo.readAncodes(annot);
      const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];

      let form;
      let current_ancodes;

      for (let i = 0, c = _lodash2.default.size(flexias); i < c; i += 2) {
        form = [prefix, flexias[i], base, flexias[i + 1]].join('');
        current_ancodes = all_ancodes[i / 2];

        _lodash2.default.forEach(current_ancodes, ancode => {
          words.push(form);
          ancodes.push(this.ancodes_resolver.resolve(ancode));
        });
      }

      result.push({
        all: ancodes,
        forms: words,
        common: this.ancodes_resolver.resolve(common_ancode)
      });
    });

    return result;
  }

  composeFormsWithAncodes(word, annots, foundFormNo) {
    const result = [];

    function _ref(ancode) {
      return result.push([word, ancode]);
    }

    _lodash2.default.forEach(annots, (annot, annotIdx) => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const ancodes = this.graminfo.readAncodes(annot);
      const found_form_no = annot['form_no'];

      let count;
      let form_no;

      foundFormNo = !_lodash2.default.isArray(foundFormNo) ? [] : foundFormNo;

      for (let i = 0, c = _lodash2.default.size(flexias); i < c; i += 2) {
        form_no = i / 2;
        word = [prefix, flexias[i], base, flexias[i + 1]].join('');

        if (found_form_no == form_no) {
          foundFormNo[annotIdx] = _lodash2.default.isPlainObject(foundFormNo[annotIdx]) ? foundFormNo[annotIdx] : {};
          count = _lodash2.default.size(result);
          foundFormNo[annotIdx]['low'] = count;
          foundFormNo[annotIdx]['high'] = count + _lodash2.default.size(ancodes[form_no]) - 1;
        }

        _lodash2.default.forEach(ancodes[form_no], _ref);
      }
    });

    return {
      foundFormNo,
      forms: result
    };
  }

  decodeAnnot(annotsRaw, withBase) {
    if (_utils.php.var.is_array(annotsRaw)) {
      return annotsRaw;
    }

    return this.annot_decoder.decode(annotsRaw, withBase);
  }

}

class Morphy_WordForm {

  static compareGrammems(a, b) {
    return _lodash2.default.size(a) == _lodash2.default.size(b) && _lodash2.default.size(_utils.php.array.array_diff(a, b)) == 0;
  }

  constructor(word, form_no, pos_id, grammems) {
    grammems = _lodash2.default.values(grammems);

    this.word = word + '';
    this.form_no = parseInt(form_no, 10);
    this.pos_id = pos_id;
    this.grammems = grammems.length ? _lodash2.default.sortBy(grammems, _lodash2.default.isNumber(grammems[0]) ? _lodash2.default.toInteger : JSON.stringify) : grammems;
  }

  getPartOfSpeech() {
    return this.pos_id;
  }

  getGrammems() {
    return this.grammems;
  }

  hasGrammems(grammems) {
    grammems = !_lodash2.default.isArray(grammems) ? [grammems] : grammems;
    const grammes_count = _lodash2.default.size(grammems);

    return grammes_count && _lodash2.default.size(_utils.php.array.array_intersect(grammems, this.grammems)) == grammes_count;
  }

  getWord() {
    return this.word;
  }

  getFormNo() {
    return this.form_no;
  }

}

class Morphy_WordDescriptor extends Array {

  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes#Species
  static get [Symbol.species]() {
    return Array;
  }

  /**
   * @param word
   * @param annot
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(word, annot, helper) {
    super();

    this.word = word;
    this.annot = [annot];
    this.helper = helper;
    this.cached_base = null;
    this.cached_forms = null;
    this.found_form_no = null;
    this.all_forms_readed = false;
    this.cached_pseudo_root = null;
    this.common_ancode_grammems = null;

    this.readAllForms();
  }

  getPseudoRoot() {
    if (!_utils.php.var.isset(this.cached_pseudo_root)) {
      this.cached_pseudo_root = this.helper.getPseudoRoot(this.word, this.annot)[0];
    }

    return this.cached_pseudo_root;
  }

  getBaseForm() {
    if (!_utils.php.var.isset(this.cached_base)) {
      this.cached_base = this.helper.getBaseForm(this.word, this.annot)[0];
    }

    return this.cached_base;
  }

  getAllForms() {
    if (!_utils.php.var.isset(this.cached_forms)) {
      this.cached_forms = this.helper.getAllForms(this.word, this.annot);
    }

    return this.cached_forms;
  }

  getWordForm(index) {
    this.readAllForms();

    return this.slice(index, index + 1)[0];
  }

  createWordForm(word, form_no, ancode) {
    let common_ancode;
    let grammemsAndPartOfSpeech;
    let pos_id;
    let all_grammems;

    if (!_utils.php.var.isset(this.common_ancode_grammems)) {
      common_ancode = this.annot[0]['common_ancode'];

      this.common_ancode_grammems = _utils.php.var.isset(common_ancode) ? this.helper.getGrammems(common_ancode) : {};
    }

    grammemsAndPartOfSpeech = this.helper.getGrammemsAndPartOfSpeech(ancode);
    pos_id = grammemsAndPartOfSpeech[0];
    all_grammems = grammemsAndPartOfSpeech[1];

    return new Morphy_WordForm(word, form_no, pos_id, _utils.php.array.array_merge(this.common_ancode_grammems, all_grammems));
  }

  readAllForms() {
    const forms = [];
    let form_no = 0;
    let formsWithAncodes;

    if (!this.all_forms_readed) {
      formsWithAncodes = this.helper.getAllFormsWithAncodes(this.word, this.annot);

      _lodash2.default.forEach(formsWithAncodes.forms, form => {
        forms.push(this.createWordForm(form[0], form_no, form[1]));
        form_no++;
      });

      this.found_form_no = formsWithAncodes.foundFormNo[0];

      this.splice(0, this.length);
      _lodash2.default.forEach(forms, form => this.push(form));

      this.all_forms_readed = true;
    }

    return this;
  }

  getFoundFormNoLow() {
    this.readAllForms();

    return this.found_form_no['low'];
  }

  getFoundFormNoHigh() {
    this.readAllForms();

    return this.found_form_no['high'];
  }

  getFoundWordForm() {
    const result = [];
    for (let i = this.getFoundFormNoLow(), c = this.getFoundFormNoHigh() + 1; i < c; i++) {
      result.push(this.getWordForm(i));
    }

    return result;
  }

  hasGrammems(grammems) {
    grammems = (0, _utils.castArray)(grammems);

    return _lodash2.default.some(this, wf => wf.hasGrammems(grammems));
  }

  getWordFormsByGrammems(grammems) {
    grammems = (0, _utils.castArray)(grammems);
    const result = [];

    _lodash2.default.forEach(this, wf => {
      if (wf.hasGrammems(grammems)) {
        result.push(wf);
      }
    });

    return result;
    //return count(result) ? result : false;
  }

  hasPartOfSpeech(poses) {
    poses = (0, _utils.castArray)(poses);

    return _lodash2.default.some(this, wf => {
      return poses.indexOf(wf.getPartOfSpeech()) >= 0;
      // return poses.includes(wf.getPartOfSpeech());
    });
  }

  getWordFormsByPartOfSpeech(poses) {
    poses = (0, _utils.castArray)(poses);
    const result = [];

    _lodash2.default.forEach(this, wf => {
      if (poses.indexOf(wf.getPartOfSpeech()) >= 0) {
        // if (poses.includes(wf.getPartOfSpeech())) {
        result.push(wf);
      }
    });

    return result;
    //return count(result) ? result : false;
  }

}

// ----------------------------
// Finders
// ----------------------------
class Morphy_Morphier_Finder_Interface {

  findWord(word) {}

  decodeAnnot(raw, withBase) {}

  getAnnotDecoder() {}

}

class Morphy_Morphier_Finder_Base extends Morphy_Morphier_Finder_Interface {

  /**
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor(annotDecoder) {
    super();
    this.annot_decoder = annotDecoder;
    this.prev_word = null;
    this.prev_result = false;
  }

  findWord(word) {
    if (this.prev_word === word) {
      return this.prev_result;
    }

    const result = this.doFindWord(word);

    this.prev_word = word;
    this.prev_result = result;

    return result;
  }

  getAnnotDecoder() {
    return this.annot_decoder;
  }

  decodeAnnot(raw, withBase) {
    return this.annot_decoder.decode(raw, withBase);
  }

  doFindWord(word) {}

}

class Morphy_Morphier_Finder_Common extends Morphy_Morphier_Finder_Base {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor(fsa, annotDecoder) {
    super(annotDecoder);

    this.fsa = fsa;
    this.root = this.fsa.getRootTrans();
  }

  getFsa() {
    return this.fsa;
  }

  doFindWord(word) {
    const result = this.fsa.walk(this.root, word);

    if (!result['result'] || result['annot'] === null) {
      return false;
    }

    return result['annot'];
  }

}

class Morphy_Morphier_Finder_Predict_Suffix extends Morphy_Morphier_Finder_Common {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   * @param {string} encoding
   * @param {number} [minimalSuffixLength=4]
   */
  constructor(fsa, annotDecoder, encoding, minimalSuffixLength = 4) {
    super(fsa, annotDecoder);

    this.min_suf_len = minimalSuffixLength;
    this.unicode = _unicode.Morphy_UnicodeHelper.create(encoding);
  }

  doFindWord(word) {
    const word_len = this.unicode.strlen(word);
    let result;

    if (!word_len) {
      return false;
    }

    let i = 1;
    let c = word_len - this.min_suf_len;
    for (; i < c; i++) {
      word = _utils.php.strings.substr(word, this.unicode.firstCharSize(word));
      result = super.doFindWord(word);

      if (result !== false) {
        break;
      }
    }

    if (i < c) {
      return result;
    }

    return false;
  }

  fixAnnots(annots, len) {
    _lodash2.default.forEach(annots, annot => annot['cplen'] = len);

    return annots;
  }

}

class Morphy_Morphier_PredictCollector extends _fsa.Morphy_Fsa_WordsCollector {

  /**
   * @param {*} limit
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor(limit, annotDecoder) {
    super(limit);

    this.collected = 0;
    this.used_poses = {};
    this.annot_decoder = annotDecoder;
  }

  collect(path, annotRaw) {
    if (this.collected > this.limit) {
      return false;
    }

    const annots = this.decodeAnnot(annotRaw);
    let pos_id;
    let result_idx;
    let nextItemsIndex;
    let itemsSize;

    _lodash2.default.forEach(annots, annot => {
      annot['cplen'] = annot['plen'] = 0;
      pos_id = annot['pos_id'];

      if (_utils.php.var.isset(this.used_poses[pos_id])) {
        result_idx = this.used_poses[pos_id];

        if (annot['freq'] > this.items[result_idx]['freq']) {
          this.items[result_idx] = annot;
        }
      } else {
        itemsSize = _lodash2.default.size(this.items);
        this.used_poses[pos_id] = itemsSize;
        // оригинал:
        // $this->items[] = annot;
        nextItemsIndex = itemsSize ? _lodash2.default.max(_lodash2.default.keys(this.items)) : -1;

        this.items[parseInt(nextItemsIndex, 10) + 1] = annot;
      }
    });

    this.collected++;

    return true;
  }

  clear() {
    super.clear();
    this.collected = 0;
    this.used_poses = {};
  }

  decodeAnnot(annotRaw) {
    return this.annot_decoder.decode(annotRaw, true);
  }

}

class Morphy_Morphier_Finder_Predict_Database extends Morphy_Morphier_Finder_Common {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   * @param {string} encoding
   * @param {Morphy_GramInfo_Interface} graminfo
   * @param {number} [minPostfixMatch=2]
   * @param {number} [collectLimit=32]
   */
  constructor(fsa, annotDecoder, encoding, graminfo, minPostfixMatch = 2, collectLimit = 32) {
    super(fsa, annotDecoder);

    this.graminfo = graminfo;
    this.min_postfix_match = minPostfixMatch;
    this.collector = this.createCollector(collectLimit, this.getAnnotDecoder());
    this.unicode = _unicode.Morphy_UnicodeHelper.create(encoding);
  }

  createAnnotDecoder() {
    // todo: какая-то херня
    //return phpmorphy_annot_decoder_new('predict');
    return Morphy_AnnotDecoder_Factory.create('predict');
  }

  doFindWord(word) {
    word = (0, _utils.toBuffer)(word);

    const rev_word = this.unicode.strrev(word);
    const result = this.fsa.walk(this.root, rev_word);
    let annots;
    let match_len;

    if (result['result'] && null !== result['annot']) {
      annots = result['annot'];
    } else {
      match_len = this.unicode.strlen(this.unicode.fixTrailing(rev_word.slice(0, result['walked'])));
      annots = this.determineAnnots(result['last_trans'], match_len);

      if (annots === null) {
        return false;
      }
    }

    if (!_utils.php.var.is_array(annots)) {
      annots = this.collector.decodeAnnot(annots);
    }

    return this.fixAnnots(word, annots);
  }

  determineAnnots(trans, matchLen) {
    let annots = this.fsa.getAnnot(trans);
    if (annots == null && matchLen >= this.min_postfix_match) {
      this.collector.clear();
      this.fsa.collect(trans, this.collector.getCallback());
      annots = this.collector.getItems();
    }

    return annots;
  }

  fixAnnots(word, annots) {
    word = (0, _utils.toBuffer)(word);

    const result = [];
    let flexias;
    let prefix;
    let suffix;
    let plen;
    let slen;

    // remove all prefixes?
    _lodash2.default.forEach(annots, annot => {
      annot['cplen'] = annot['plen'] = 0;
      flexias = this.graminfo.readFlexiaData(annot, false);
      prefix = Buffer.from(flexias[annot['form_no'] * 2]);
      suffix = Buffer.from(flexias[annot['form_no'] * 2 + 1]);

      plen = prefix.length;
      slen = suffix.length;

      const partOfWordInPlaceOfPrefix = _utils.php.strings.substr(word, 0, plen);
      const partOfWordInPlaceOfSuffix = _utils.php.strings.substr(word, -slen);

      if ((!plen || partOfWordInPlaceOfPrefix && partOfWordInPlaceOfPrefix.equals(prefix)) && (!slen || partOfWordInPlaceOfSuffix && partOfWordInPlaceOfSuffix.equals(suffix))) {
        result.push(annot);
      }
    });

    return _lodash2.default.size(result) ? result : false;
  }

  createCollector(limit) {
    return new Morphy_Morphier_PredictCollector(limit, this.getAnnotDecoder());
  }

}

// ----------------------------
// Morphiers
// ----------------------------
class Morphy_Morphier_Base extends Morphy_Morphier_Interface {

  /**
   * @param {Morphy_Morphier_Finder_Interface} finder
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(finder, helper) {
    super();
    this.finder = finder;
    this.helper = _lodash2.default.cloneDeep(helper);
    this.helper.setAnnotDecoder(finder.getAnnotDecoder());
  }

  /**
   * @return Morphy_Morphier_Finder_Interface
   */
  getFinder() {
    return this.finder;
  }

  /**
   * @return Morphy_Morphier_Helper
   */
  getHelper() {
    return this.helper;
  }

  getAnnot(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.decodeAnnot(annots, true);
  }

  getWordDescriptor(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getWordDescriptor(word, annots);
  }

  getAllFormsWithAncodes(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getAllFormsWithResolvedAncodes(word, annots);
  }

  getPartOfSpeech(word) {
    const annots = this.finder.findWord(word);
    if (annots == false) {
      return false;
    }

    return this.helper.getPartOfSpeech(word, annots);
  }

  getBaseForm(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getBaseForm(word, annots);
  }

  getPseudoRoot(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getPseudoRoot(word, annots);
  }

  getAllForms(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getAllForms(word, annots);
  }

  getAncode(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getAncode(annots);
  }

  getGrammarInfo(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getGrammarInfo(annots);
  }

  getGrammarInfoMergeForms(word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getGrammarInfoMergeForms(annots);
  }

  /**
   * @param word
   * @param partOfSpeech
   * @param grammems
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @returns {boolean}
   */
  castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.castFormByGramInfo(word, annots);
  }

  /**
   * @param word
   * @param patternWord
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @returns {boolean}
   */
  castFormByPattern(word, patternWord, returnOnlyWord = false, callback = null) {
    const orig_annots = this.finder.findWord(word);
    if (orig_annots === false) {
      return false;
    }

    const pattern_annots = this.finder.findWord(patternWord);
    if (pattern_annots === false) {
      return false;
    }

    return this.helper.castFormByPattern(word, orig_annots, patternWord, pattern_annots, returnOnlyWord, callback);
  }

}

class Morphy_Morphier_Common extends Morphy_Morphier_Base {

  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {Morphy_AnnotDecoder_Interface}
   */
  static createAnnotDecoder(helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(fsa, helper) {
    super(new Morphy_Morphier_Finder_Common(fsa, Morphy_Morphier_Common.createAnnotDecoder(helper)), helper);
  }

}

class Morphy_Morphier_Predict_Suffix extends Morphy_Morphier_Base {

  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {Morphy_AnnotDecoder_Interface}
   */
  static createAnnotDecoder(helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(fsa, helper) {
    super(new Morphy_Morphier_Finder_Predict_Suffix(fsa, Morphy_Morphier_Predict_Suffix.createAnnotDecoder(helper), helper.getGramInfo().getEncoding(), 4), helper);
  }

}

class Morphy_Morphier_Predict_Database extends Morphy_Morphier_Base {

  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {Morphy_AnnotDecoder_Interface}
   */
  static createAnnotDecoder(helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getPredictDecoder();
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(fsa, helper) {
    super(new Morphy_Morphier_Finder_Predict_Database(fsa, Morphy_Morphier_Predict_Database.createAnnotDecoder(helper), helper.getGramInfo().getEncoding(), helper.getGramInfo(), 2, 32), helper);
  }

}

class Morphy_Morphier_Bulk extends Morphy_Morphier_Interface {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor(fsa, helper) {
    super();

    this.fsa = fsa;
    this.root_trans = fsa.getRootTrans();
    this.helper = _lodash2.default.cloneDeep(helper);
    this.helper.setAnnotDecoder(this.createAnnotDecoder(helper));
    this.graminfo = helper.getGramInfo();
    this.notfound = [];
  }

  getFsa() {
    return this.fsa;
  }

  getHelper() {
    return this.helper;
  }

  getGraminfo() {
    return this.graminfo;
  }

  getNotFoundWords() {
    return this.notfound;
  }

  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {*}
   */
  createAnnotDecoder(helper) {
    return new Morphy_AnnotDecoder_Common(helper.getGramInfo().getEnds());
  }

  getAnnot(word) {
    const result = {};

    _lodash2.default.forEach(this.findWord(word), item => {
      const words = item.data;
      let annot = item.annots;
      annot = this.helper.decodeAnnot(annot, true);

      _lodash2.default.forEach(words, word => {
        result[word] = result[word] || [];
        result[word].push(annot);
      });
    });

    return result;
  }

  getBaseForm(words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, true, false, false);
  }

  getAllForms(words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, false, false);
  }

  getPseudoRoot(words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, true, false);
  }

  getPartOfSpeech(words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, false, true);
  }

  /**
   * @param words
   * @param method
   * @param {boolean} [callWithWord=false]
   * @returns {*}
   */
  processAnnotsWithHelper(words, method, callWithWord = false) {
    const result = {};
    let annot_raw;
    let result_for_annot;

    function _ref2(word) {
      return result[word] = result_for_annot;
    }

    _lodash2.default.forEach(this.findWord(words), item => {
      words = item.data;
      annot_raw = item.annots;

      if (annot_raw.length == 0) {
        return;
      }

      if (callWithWord) {
        _lodash2.default.forEach(words, word => result[word] = this.helper[method](word, annot_raw));
      } else {
        result_for_annot = this.helper[method](annot_raw);
        _lodash2.default.forEach(words, _ref2);
      }
    });

    return result;
  }

  getAncode(words) {
    return this.processAnnotsWithHelper(words, 'getAncode');
  }

  getGrammarInfoMergeForms(words) {
    return this.processAnnotsWithHelper(words, 'getGrammarInfoMergeForms');
  }

  getGrammarInfo(words) {
    return this.processAnnotsWithHelper(words, 'getGrammarInfo');
  }

  getAllFormsWithAncodes(words) {
    return this.processAnnotsWithHelper(words, 'getAllFormsWithResolvedAncodes', true);
  }

  getWordDescriptor(words) {
    return this.processAnnotsWithHelper(words, 'getWordDescriptor', true);
  }

  findWord(words) {
    this.notfound = [];

    const patriciaTrie = this.buildPatriciaTrie(words);
    const labels = patriciaTrie[0];
    const finals = patriciaTrie[1];
    const dests = patriciaTrie[2];
    const annots = {};
    const stack = [0, Buffer.from(''), this.root_trans];
    const fsa = this.fsa;

    let n;
    let path;
    let trans;
    let label;
    let result;
    let is_final;
    let stack_idx = 0;

    // TODO: Improve this

    function _ref3(dest) {
      stack_idx += 3;
      stack[stack_idx] = dest;
      stack[stack_idx + 1] = path;
      stack[stack_idx + 2] = trans;
    }

    while (stack_idx >= 0) {
      n = stack[stack_idx];
      path = Buffer.concat([Buffer.from(stack[stack_idx + 1]), labels[n]]);
      trans = stack[stack_idx + 2];
      stack_idx -= 3; // TODO: Remove items from stack? (performance!!!)

      is_final = finals[n] > 0;
      //is_final = dests[n] === false;

      result = false;
      if (trans !== false && n > 0) {
        label = labels[n];
        result = fsa.walk(trans, label, is_final);

        if (label.length == result['walked']) {
          trans = result['word_trans'];
        } else {
          trans = false;
        }
      }

      if (is_final) {
        if (trans !== false && _utils.php.var.isset(result['annot'])) {
          annots[result['annot']] = annots[result['annot']] || {
            annots: result['annot'],
            data: []
          };
          annots[result['annot']].data.push(path);
        } else {
          this.notfound.push(path);
        }
      }

      if (dests[n] !== false) {
        _lodash2.default.forEach(dests[n], _ref3);
      }
    }

    return annots;
  }

  composeForms(annotsRaw, onlyBase, pseudoRoot, partOfSpeech) {
    const result = {};
    let key;
    let annot_raw;
    let words;

    // process found annotations
    _lodash2.default.forEach(annotsRaw, item => {
      words = item.data;
      annot_raw = item.annots;

      if (annot_raw.length == 0) {
        return;
      }

      _lodash2.default.forEach(this.helper.decodeAnnot(annot_raw, onlyBase), annot => {
        let flexias;
        let cplen;
        let plen;
        let flen;
        let pos_id;

        if (!(onlyBase || pseudoRoot)) {
          flexias = this.graminfo.readFlexiaData(annot);
        }

        cplen = annot['cplen'];
        plen = annot['plen'];
        flen = annot['flen'];

        if (partOfSpeech) {
          pos_id = this.helper.extractPartOfSpeech(annot);
        }

        _lodash2.default.forEach(words, word => {
          let base;
          let prefix;
          let form;

          if (flen) {
            base = _utils.php.strings.substr(word, cplen + plen, -flen);
          } else {
            if (cplen || plen) {
              base = _utils.php.strings.substr(word, cplen + plen);
            } else {
              base = word;
            }
          }

          prefix = cplen ? _utils.php.strings.substr(word, 0, cplen) : '';
          result[word] = result[word] || {};

          if (pseudoRoot) {
            result[word][base] = 1;
          } else if (onlyBase) {
            form = [prefix, annot['base_prefix'], base, annot['base_suffix']].join('');

            result[word][form] = 1;
          } else if (partOfSpeech) {
            result[word][pos_id] = 1;
          } else {
            for (let i = 0, c = _lodash2.default.size(flexias); i < c; i += 2) {
              form = [prefix, flexias[i], base, flexias[i + 1]].join('');

              result[word][form] = 1;
            }
          }
        });
      });
    });

    _lodash2.default.keys(result).forEach(key => {
      result[key] = _lodash2.default.keys(result[key]);

      if (result[key].length && (0, _utils.isStringifyedNumber)(result[key][0])) {
        result[key] = result[key].map(_lodash2.default.toInteger);
      }
    });

    return result;
  }

  buildPatriciaTrie(words) {
    if (!_utils.php.var.is_array(words)) {
      throw new Error('Words must be array');
    }

    //words = php.array.sort(words);
    words = words.length && Buffer.isBuffer(words[0]) ? words.sort(Buffer.compare) : words.sort();

    let stack = [];
    let prev_word = '';
    let prev_wordBuf = Buffer.alloc(0);
    let prev_word_len = 0;
    let prev_lcp = 0;
    let node = 0;

    const state_labels = [];
    const state_dests = [];
    const state_finals = [0];

    state_labels.push(Buffer.from(''));
    state_dests.push([]);

    _lodash2.default.forEach(words, word => {
      const wordBuf = Buffer.from(word, 'utf8');

      if (wordBuf.equals(prev_wordBuf)) {
        return;
      }

      const word_len = wordBuf.length;
      let new_state_id;
      let need_split;
      let trim_size;
      let node_key;
      let new_node_id_1;
      let new_node_id_2;
      let new_node_id;

      // find longest common prefix
      let lcp = 0;
      let c = Math.min(prev_word_len, word_len);
      for (; lcp < c && wordBuf[lcp] == prev_wordBuf[lcp]; lcp++) {}

      if (lcp == 0) {
        stack = [];
        new_state_id = _lodash2.default.size(state_labels);
        state_labels.push(wordBuf);
        state_finals.push(1);
        state_dests.push(false);
        state_dests[0].push(new_state_id);
        node = new_state_id;
      } else {
        need_split = true;
        trim_size = 0; // for split

        if (lcp == prev_lcp) {
          need_split = false;
          node = stack[_lodash2.default.size(stack) - 1];
        } else if (lcp > prev_lcp) {
          if (lcp == prev_word_len) {
            need_split = false;
          } else {
            need_split = true;
            trim_size = lcp - prev_lcp;
          }

          stack.push(node);
        } else {
          trim_size = prev_wordBuf.length - lcp;

          let stack_size = _lodash2.default.size(stack) - 1;
          for (;; --stack_size) {
            trim_size -= state_labels[node].length;

            if (trim_size <= 0) {
              break;
            }

            if (_lodash2.default.size(stack) < 1) {
              throw new Error('Infinite loop possible');
            }

            node = stack.pop();
          }

          need_split = trim_size < 0;
          trim_size = Math.abs(trim_size);

          if (need_split) {
            stack.push(node);
          } else {
            node = stack[stack_size];
          }
        }

        let node_key_buf;

        if (need_split) {
          node_key = state_labels[node];
          node_key_buf = Buffer.from(node_key);

          // split
          new_node_id_1 = _lodash2.default.size(state_labels);
          new_node_id_2 = new_node_id_1 + 1;

          // new_node_1
          state_labels.push(_utils.php.strings.substr(node_key_buf, trim_size));
          state_finals.push(state_finals[node]);
          state_dests.push(state_dests[node]);

          // adjust old node
          state_labels[node] = _utils.php.strings.substr(node_key_buf, 0, trim_size);
          state_finals[node] = 0;
          state_dests[node] = [new_node_id_1];

          // append new node, new_node_2
          state_labels.push(_utils.php.strings.substr(wordBuf, lcp));
          state_finals.push(1);
          state_dests.push(false);

          state_dests[node].push(new_node_id_2);

          node = new_node_id_2;
        } else {
          new_node_id = _lodash2.default.size(state_labels);

          state_labels.push(_utils.php.strings.substr(wordBuf, lcp));
          state_finals.push(1);
          state_dests.push(false);

          if (state_dests[node] !== false) {
            state_dests[node].push(new_node_id);
          } else {
            state_dests[node] = [new_node_id];
          }

          node = new_node_id;
        }
      }

      prev_word = word;
      prev_word_len = word_len;
      prev_wordBuf = wordBuf;
      prev_lcp = lcp;
    });

    return [state_labels, state_finals.join(''), state_dests];
  }

}

exports.Morphy_Morphier_Interface = Morphy_Morphier_Interface;
exports.Morphy_Morphier_Empty = Morphy_Morphier_Empty;
exports.Morphy_AnnotDecoder_Interface = Morphy_AnnotDecoder_Interface;
exports.Morphy_AnnotDecoder_Base = Morphy_AnnotDecoder_Base;
exports.Morphy_AnnotDecoder_Common = Morphy_AnnotDecoder_Common;
exports.Morphy_AnnotDecoder_Predict = Morphy_AnnotDecoder_Predict;
exports.Morphy_AnnotDecoder_Factory = Morphy_AnnotDecoder_Factory;
exports.Morphy_AncodesResolver_Interface = Morphy_AncodesResolver_Interface;
exports.Morphy_AncodesResolver_ToText = Morphy_AncodesResolver_ToText;
exports.Morphy_AncodesResolver_ToDialingAncodes = Morphy_AncodesResolver_ToDialingAncodes;
exports.Morphy_AncodesResolver_AsIs = Morphy_AncodesResolver_AsIs;
exports.Morphy_AncodesResolver_Proxy = Morphy_AncodesResolver_Proxy;
exports.Morphy_WordDescriptor_Collection = Morphy_WordDescriptor_Collection;
exports.Morphy_Morphier_Helper = Morphy_Morphier_Helper;
exports.Morphy_WordForm = Morphy_WordForm;
exports.Morphy_WordDescriptor = Morphy_WordDescriptor;
exports.Morphy_Morphier_Finder_Interface = Morphy_Morphier_Finder_Interface;
exports.Morphy_Morphier_Finder_Base = Morphy_Morphier_Finder_Base;
exports.Morphy_Morphier_Finder_Common = Morphy_Morphier_Finder_Common;
exports.Morphy_Morphier_Finder_Predict_Suffix = Morphy_Morphier_Finder_Predict_Suffix;
exports.Morphy_Morphier_PredictCollector = Morphy_Morphier_PredictCollector;
exports.Morphy_Morphier_Finder_Predict_Database = Morphy_Morphier_Finder_Predict_Database;
exports.Morphy_Morphier_Base = Morphy_Morphier_Base;
exports.Morphy_Morphier_Common = Morphy_Morphier_Common;
exports.Morphy_Morphier_Predict_Suffix = Morphy_Morphier_Predict_Suffix;
exports.Morphy_Morphier_Predict_Database = Morphy_Morphier_Predict_Database;
exports.Morphy_Morphier_Bulk = Morphy_Morphier_Bulk;

/***/ },
/* 16 */
/***/ function(module, exports) {

module.exports = require("encoding");

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(34);

__webpack_require__(39);

__webpack_require__(42);

__webpack_require__(43);

__webpack_require__(37);

__webpack_require__(40);

__webpack_require__(38);

__webpack_require__(41);

__webpack_require__(35);

__webpack_require__(36);

__webpack_require__(30);

__webpack_require__(32);

__webpack_require__(44);

__webpack_require__(45);

__webpack_require__(31);

__webpack_require__(33);

__webpack_require__(29);

__webpack_require__(28);

__webpack_require__(48);

__webpack_require__(46);

__webpack_require__(47);

__webpack_require__(50);

__webpack_require__(49);

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _path = __webpack_require__(5);

var _path2 = _interopRequireDefault(_path);

var _common = __webpack_require__(18);

var _common2 = _interopRequireDefault(_common);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaults = {
  dir: _path2.default.join(__dirname, '..', 'dicts'),
  storage: _common.STORAGE_MEM,
  predict_by_suffix: true,
  predict_by_db: true,
  graminfo_as_text: true,
  use_ancodes_cache: false,
  resolve_ancodes: _common.RESOLVE_ANCODES_AS_TEXT
};

class Morphy {

  static get STORAGE_FILE() {
    return _common.STORAGE_FILE;
  }
  static get STORAGE_MEM() {
    return _common.STORAGE_MEM;
  }
  static get SOURCE_FSA() {
    return _common.SOURCE_FSA;
  }
  static get RESOLVE_ANCODES_AS_TEXT() {
    return _common.RESOLVE_ANCODES_AS_TEXT;
  }
  static get RESOLVE_ANCODES_AS_DIALING() {
    return _common.RESOLVE_ANCODES_AS_DIALING;
  }
  static get RESOLVE_ANCODES_AS_INT() {
    return _common.RESOLVE_ANCODES_AS_INT;
  }
  static get NORMAL() {
    return _common.NORMAL;
  }
  static get IGNORE_PREDICT() {
    return _common.IGNORE_PREDICT;
  }
  static get ONLY_PREDICT() {
    return _common.ONLY_PREDICT;
  }
  static get PREDICT_BY_NONE() {
    return _common.PREDICT_BY_NONE;
  }
  static get PREDICT_BY_SUFFIX() {
    return _common.PREDICT_BY_SUFFIX;
  }
  static get PREDICT_BY_DB() {
    return _common.PREDICT_BY_DB;
  }

  /**
   * @param {string|{}} lang
   * @param {{}} [opts]
   */
  constructor(lang, opts = {}) {
    if (_lodash2.default.isPlainObject(lang)) {
      opts = lang;
    } else {
      opts.lang = lang;
    }

    opts = Object.assign({}, defaults, opts);

    switch (opts.lang.toLowerCase()) {
      case 'de':
      case 'de_de':
        opts.lang = 'de_DE';
        break;
      case 'en':
      case 'en_en':
        opts.lang = 'en_EN';
        break;
      case 'et':
      case 'ee':
      case 'et_ee':
        opts.lang = 'et_EE';
        break;
      case 'ua':
      case 'uk':
      case 'uk_ua':
        opts.lang = 'uk_UA';
        break;
      case 'ru':
      case 'ru_ru':
      default:
        opts.lang = 'ru_RU';
        break;
    }

    this.lang = opts.lang;
    this.dir = opts.dir;
    this.options = opts;

    if (this.options.lang != 'ru_RU') {
      this.options.use_ancodes_cache = false;
    }

    this.morpher = new _common2.default(this.dir, this.lang, this.options);
  }

  // wordConvertor (word) {
  //   let encoding = null;
  //
  //   word = word.toUpperCase();
  //   if (this.options.detectEncoding && !this.options.encoding) {
  //     encoding = detectEncoding(word);
  //   } else
  //   if (this.options.encoding) {
  //     encoding = this.options.encoding;
  //   }
  //
  //   if (encoding) {
  //     word = encoding.convert(toBuffer(word, encoding), this.morpher.getEncoding(), encoding);
  //   }
  //
  //   return word;
  // }

  /**
   * @param {string|Buffer} word
   * @param {boolean} [asBuffer=false]
   * @returns {*}
   */
  prepareWord(word, asBuffer = false) {
    if (_lodash2.default.isArray(word)) {
      return _lodash2.default.map(word, word => this.prepareWord(word));
    }

    if (Buffer.isBuffer(word)) {
      word = word.toString(this.morpher.getEncoding());
    }

    word = word.toUpperCase();

    return asBuffer ? Buffer.from(word, this.morpher.getEncoding()) : word;
  }

  /**
   * @returns {Morphy_Morphier_Interface}
   */
  getCommonMorphier() {
    return this.morpher.getCommonMorphier();
  }

  /**
   * @returns {Morphy_Morphier_Interface}
   */
  getPredictBySuffixMorphier() {
    return this.morpher.getPredictBySuffixMorphier();
  }

  /**
   * @returns {Morphy_Morphier_Interface}
   */
  getPredictByDatabaseMorphier() {
    return this.morpher.getPredictByDatabaseMorphier();
  }

  /**
   * @returns {Morphy_Morphier_Bulk}
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
   * @returns {Morphy_GrammemsProvider_Base}
   */
  getGrammemsProvider() {
    return this.morpher.getGrammemsProvider();
  }

  /**
   * @returns {Morphy_GrammemsProvider_Base}
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
   * @returns {Morphy_WordDescriptor_Collection}
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
    return this.morpher.castFormByGramInfo(this.prepareWord(word), partOfSpeech, grammems, returnOnlyWord, callback, type);
  }

  /**
   * @param {string} word
   * @param {string} patternWord
   * @param {Morphy_GrammemsProvider_Interface} [grammemsProvider=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=false]
   * @param {*} [type=Morphy.NORMAL]
   * @returns {[]|boolean}
   */
  castFormByPattern(word, patternWord, grammemsProvider = null, returnOnlyWord = false, callback = null, type = Morphy.NORMAL) {
    return this.morpher.castFormByPattern(this.prepareWord(word), this.prepareWord(patternWord), grammemsProvider, returnOnlyWord, callback, type);
  }

}

exports.default = Morphy;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PREDICT_BY_DB = exports.PREDICT_BY_SUFFIX = exports.PREDICT_BY_NONE = exports.ONLY_PREDICT = exports.IGNORE_PREDICT = exports.NORMAL = exports.RESOLVE_ANCODES_AS_INT = exports.RESOLVE_ANCODES_AS_DIALING = exports.RESOLVE_ANCODES_AS_TEXT = exports.SOURCE_FSA = exports.STORAGE_MEM = exports.STORAGE_FILE = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
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

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _path = __webpack_require__(5);

var _path2 = _interopRequireDefault(_path);

var _utils = __webpack_require__(1);

var _fsa = __webpack_require__(2);

var _source = __webpack_require__(22);

var _gramtab = __webpack_require__(20);

var _storage = __webpack_require__(23);

var _common = __webpack_require__(4);

var _graminfo = __webpack_require__(6);

var _morphiers = __webpack_require__(15);

var _constants = __webpack_require__(7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_FilesBundle {

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
    extraExt = !_lodash2.default.isUndefined(extraExt) ? extraExt : null;

    return _path2.default.join(this.dir, [token, '.', this.lang, _utils.php.var.isset(extraExt) ? '.' + extraExt : '', '.bin'].join(''));
  }

}

class Morphy_WordDescriptor_Collection_Serializer {

  /**
   * @param {Morphy_WordDescriptor_Collection} collection
   * @param {boolean} [asText=false]
   * @returns {*}
   */
  serialize(collection, asText = false) {
    const result = [];
    _lodash2.default.forEach(collection, descriptor => result.push(this.processWordDescriptor(descriptor, asText)));

    return result;
  }

  /**
   * @param {Morphy_WordDescriptor} descriptor
   * @param {boolean} [asText=false]
   * @returns {{forms: *, all: *, common: string}}
   */
  processWordDescriptor(descriptor, asText = false) {
    const all = [];
    const forms = [];

    _lodash2.default.forEach(descriptor, word_form => {
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
  serializeGramInfo(wordForm, asText = false) {
    if (asText) {
      return wordForm.getPartOfSpeech() + ' ' + _utils.php.strings.implode(',', wordForm.getGrammems());
    }

    return {
      pos: wordForm.getPartOfSpeech(),
      grammems: wordForm.getGrammems()
    };
  }

}

class phpMorphy {

  constructor(dir, lang = null, options = {}) {
    this.options = this.repairOptions(options);
    this.init(this.createFilesBundle(dir, lang), this.options);
    this.last_prediction_type = _constants.PREDICT_BY_NONE;
  }

  /**
   * @param {Morphy_FilesBundle} bundle
   * @param options
   */
  init(bundle, options) {
    this.options = this.repairOptions(options);
    this.storage_factory = this.createStorageFactory();
    this.common_fsa = this.createFsa(this.storage_factory.open(this.options['storage'], bundle.getCommonAutomatFile(), false), false);
    this.predict_fsa = this.createFsa(this.storage_factory.open(this.options['storage'], bundle.getPredictAutomatFile(), true), true);

    const graminfo = this.createGramInfo(this.storage_factory.open(this.options['storage'], bundle.getGramInfoFile(), true), bundle);
    const gramtab = this.createGramTab(this.storage_factory.open(this.options['storage'], this.options['graminfo_as_text'] ? bundle.getGramTabFileWithTextIds() : bundle.getGramTabFile(), true));
    this.helper = this.createMorphierHelper(graminfo, gramtab, this.options['graminfo_as_text'], bundle);
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getCommonMorphier() {
    return this.__common_morphier;
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getPredictBySuffixMorphier() {
    return this.__predict_by_suf_morphier;
  }

  /**
   * @return {Morphy_Morphier_Interface}
   */
  getPredictByDatabaseMorphier() {
    return this.__predict_by_db_morphier;
  }

  /**
   * @return {Morphy_Morphier_Bulk}
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
   * @return {Morphy_GrammemsProvider_Base}
   */
  getGrammemsProvider() {
    return _lodash2.default.cloneDeep(this.__grammems_provider);
  }

  /**
   * @return {Morphy_GrammemsProvider_Base}
   */
  getDefaultGrammemsProvider() {
    return this.__grammems_provider;
  }

  /**
   * @return {boolean}
   */
  isLastPredicted() {
    return this.last_prediction_type !== _constants.PREDICT_BY_NONE;
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
   * @return {Morphy_WordDescriptor_Collection|{}}
   */
  findWord(word, type = _constants.NORMAL) {
    const result = {};

    if (_utils.php.var.is_array(word)) {
      word.forEach(w => result[w] = this.invoke('getWordDescriptor', (0, _utils.toBuffer)(w), type));
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
  lemmatize(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.getBaseForm(word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getBaseForm(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getBaseForm', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllForms(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getAllForms', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPseudoRoot(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getPseudoRoot', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getPartOfSpeech(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getPartOfSpeech', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getAllFormsWithAncodes(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getAllFormsWithAncodes', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {boolean} [asText=true] - represent graminfo as text or ancodes
   * @param {*} [type=NORMAL] - prediction managment
   * @return {*}
   */
  getAllFormsWithGramInfo(word, asText = true, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    const result = this.findWord(word, type);

    if (!result) {
      return false;
    }

    if (_utils.php.var.is_array(word)) {
      const out = {};
      _lodash2.default.forEach(result, (r, w) => {
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
  getAncode(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getAncode', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfo(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getGrammarInfo', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param {*} [type=NORMAL] - prediction managment
   * @return {[]}
   */
  getGramInfoMergeForms(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    return this.invoke('getGrammarInfoMergeForms', word, type);
  }

  /**
   * @param {*} word - string or array of strings
   * @param [type=NORMAL] - prediction managment
   * @returns {[]}
   */
  getAnnotForWord(word, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

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
  castFormByAncode(word, ancode, commonAncode = null, returnOnlyWord = false, callback = null, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

    const resolver = this.helper.getAncodesResolver();
    const common_ancode_id = resolver.unresolve(commonAncode);
    const ancode_id = resolver.unresolve(ancode);
    const data = this.helper.getGrammemsAndPartOfSpeech(ancode_id);

    if (_utils.php.var.isset(common_ancode_id)) {
      data[1] = _utils.php.array.array_merge(data[1], this.helper.getGrammems(common_ancode_id));
    }

    return this.castFormByGramInfo(word, data[0], data[1], returnOnlyWord, callback, type);
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
  castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);

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
  castFormByPattern(word, patternWord, grammemsProvider = null, returnOnlyWord = false, callback = null, type = _constants.NORMAL) {
    word = (0, _utils.toBuffer)(word);
    patternWord = (0, _utils.toBuffer)(patternWord);

    const word_annot = this.getAnnotForWord(word, type);
    if (!word_annot) {
      return false;
    }

    if (!(grammemsProvider instanceof _common.Morphy_GrammemsProvider_Interface)) {
      grammemsProvider = this.__grammems_provider;
    }

    let result = [];
    _lodash2.default.forEach(this.getGramInfo(patternWord, type), paradigm => {
      _lodash2.default.forEach(paradigm, grammar => {
        const pos = grammar['pos'];
        const essential_grammems = grammemsProvider.getGrammems(pos);

        const grammems = essential_grammems !== false ? _utils.php.array.array_intersect(grammar['grammems'], essential_grammems) : grammar['grammems'];

        const res = this.helper.castFormByGramInfo(word, word_annot, pos, grammems, returnOnlyWord, callback, type);

        if (res.length) {
          result = _utils.php.array.array_merge(result, res);
        }
      });
    });

    return returnOnlyWord ? _lodash2.default.uniq(result) : result;
  }

  /**
   * @param {Morphy_WordDescriptor_Collection} collection
   * @param {boolean} asText
   * @returns {*}
   */
  processWordsCollection(collection, asText) {
    return this.__word_descriptor_serializer.serialize(collection, asText);
  }

  invoke(method, word, type) {
    this.last_prediction_type = _constants.PREDICT_BY_NONE;
    word = (0, _utils.toBuffer)(word);

    let result;
    let not_found;

    if (type === _constants.ONLY_PREDICT) {
      if (_utils.php.var.is_array(word)) {
        result = {};
        _lodash2.default.forEach(word, w => result[w] = this.predictWord(method, w));

        return result;
      } else {
        return this.predictWord(method, word);
      }
    }

    if (_utils.php.var.is_array(word)) {
      result = this.__bulk_morphier[method](word);
      not_found = this.__bulk_morphier.getNotFoundWords();

      _lodash2.default.forEach(not_found, word => {
        result[word] = type !== _constants.IGNORE_PREDICT ? this.predictWord(method, word) : false;
      });
    } else {
      result = this.__common_morphier[method](word);

      if (!result && type !== _constants.IGNORE_PREDICT) {
        result = this.predictWord(method, word);
      }
    }

    return result;
  }

  predictWord(method, word) {
    word = (0, _utils.toBuffer)(word);

    let result = this.__predict_by_suf_morphier[method](word);
    if (result !== false) {
      this.last_prediction_type = _constants.PREDICT_BY_SUFFIX;
      return result;
    }

    result = this.__predict_by_db_morphier[method](word);
    if (result !== false) {
      this.last_prediction_type = _constants.PREDICT_BY_DB;
      return result;
    }

    return false;
  }

  /**
   * @param {Morphy_FilesBundle} bundle
   * @param {{}} opts
   * @returns {*}
   */
  createCommonSource(bundle, opts) {
    const type = opts['type'];

    switch (type) {
      case _constants.SOURCE_FSA:
        return new _source.Morphy_Source_Fsa(this.common_fsa);
      default:
        throw new Error(`Unknown source type given '${type}'`);
    }
  }

  repairOldOptions(options = {}) {
    const defaults = {
      predict_by_suffix: false,
      predict_by_db: false
    };

    return Object.assign(defaults, options);
  }

  repairSourceOptions(options = {}) {
    const defaults = {
      type: _constants.SOURCE_FSA,
      opts: null
    };

    return Object.assign(defaults, options);
  }

  repairOptions(options = {}) {
    const defaults = {
      graminfo_as_text: true,
      storage: _constants.STORAGE_MEM,
      common_source: this.repairSourceOptions(options.common_source || null),
      predict_by_suffix: true,
      predict_by_db: true,
      use_ancodes_cache: false,
      resolve_ancodes: _constants.RESOLVE_ANCODES_AS_TEXT
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
    this.___predict_by_db_morphier = !_lodash2.default.isUndefined(value) ? value : null;
  }

  get __predict_by_suf_morphier() {
    if (!this.___predict_by_suf_morphier) {
      this.___predict_by_suf_morphier = this.createPredictBySuffixMorphier(this.common_fsa, this.helper);
    }

    return this.___predict_by_suf_morphier;
  }
  set __predict_by_suf_morphier(value) {
    this.___predict_by_suf_morphier = !_lodash2.default.isUndefined(value) ? value : null;
  }

  get __bulk_morphier() {
    if (!this.___bulk_morphier) {
      this.___bulk_morphier = this.createBulkMorphier(this.common_fsa, this.helper);
    }

    return this.___bulk_morphier;
  }
  set __bulk_morphier(value) {
    this.___bulk_morphier = !_lodash2.default.isUndefined(value) ? value : null;
  }

  get __common_morphier() {
    if (!this.___common_morphier) {
      this.___common_morphier = this.createCommonMorphier(this.common_fsa, this.helper);
    }

    return this.___common_morphier;
  }
  set __common_morphier(value) {
    this.___common_morphier = !_lodash2.default.isUndefined(value) ? value : null;
  }

  get __word_descriptor_serializer() {
    if (!this.___word_descriptor_serializer) {
      this.___word_descriptor_serializer = this.createWordDescriptorSerializer();
    }

    return this.___word_descriptor_serializer;
  }
  set __word_descriptor_serializer(value) {
    this.___word_descriptor_serializer = !_lodash2.default.isUndefined(value) ? value : null;
  }

  get __grammems_provider() {
    if (!this.___grammems_provider) {
      this.___grammems_provider = this.createGrammemsProvider();
    }

    return this.___grammems_provider;
  }
  set __grammems_provider(value) {
    this.___grammems_provider = !_lodash2.default.isUndefined(value) ? value : null;
  }

  ////////////////////
  // factory methods
  ////////////////////
  createGrammemsProvider() {
    return _common.Morphy_GrammemsProvider_Factory.create(this);
  }

  createWordDescriptorSerializer() {
    return new Morphy_WordDescriptor_Collection_Serializer();
  }

  createFilesBundle(dir, lang) {
    return new Morphy_FilesBundle(dir, lang);
  }

  createStorageFactory() {
    return new _storage.Morphy_Storage_Factory();
  }

  /**
   * @param {Morphy_Storage} storage
   * @param {boolean} lazy
   * @returns {*}
   */
  createFsa(storage, lazy) {
    return _fsa.Morphy_Fsa.create(storage, lazy);
  }

  /**
   * @param {Morphy_Storage} graminfoFile
   * @param {Morphy_FilesBundle} bundle
   */
  createGramInfo(graminfoFile, bundle) {
    const result = new _graminfo.Morphy_GramInfo_RuntimeCaching(new _graminfo.Morphy_GramInfo_Proxy_WithHeader(graminfoFile, bundle.getGramInfoHeaderCacheFile()));

    if (this.options['use_ancodes_cache']) {
      return new _graminfo.Morphy_GramInfo_AncodeCache(result, this.storage_factory.open(this.options['storage'], bundle.getGramInfoAncodesCacheFile(), true));
    }

    return result;
  }

  /**
   * @param {Morphy_Storage} storage
   * @returns {Morphy_GramTab_Proxy}
   */
  createGramTab(storage) {
    return new _gramtab.Morphy_GramTab_Proxy(storage);
  }

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_FilesBundle} bundle
   */
  createAncodesResolverInternal(gramtab, bundle) {
    switch (this.options['resolve_ancodes']) {
      case _constants.RESOLVE_ANCODES_AS_TEXT:
        return ['Morphy_AncodesResolver_ToText', [gramtab]];
      case _constants.RESOLVE_ANCODES_AS_INT:
        return ['Morphy_AncodesResolver_AsIs', []];
      case _constants.RESOLVE_ANCODES_AS_DIALING:
        return ['Morphy_AncodesResolver_ToDialingAncodes', [this.storage_factory.open(this.options['storage'], bundle.getAncodesMapFile(), true)]];
      default:
        throw new Error('Invalid resolve_ancodes option, valid values are RESOLVE_ANCODES_AS_DIALING, RESOLVE_ANCODES_AS_INT, RESOLVE_ANCODES_AS_TEXT');
    }
  }

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_FilesBundle} bundle
   * @param {boolean} lazy
   */
  createAncodesResolver(gramtab, bundle, lazy) {
    var _createAncodesResolve = this.createAncodesResolverInternal(gramtab, bundle),
        _createAncodesResolve2 = _slicedToArray(_createAncodesResolve, 2);

    const className = _createAncodesResolve2[0],
          args = _createAncodesResolve2[1];


    if (!!lazy) {
      return new _morphiers.Morphy_AncodesResolver_Proxy(className, args);
    }

    return _morphiers.Morphy_AncodesResolver_Proxy.instantinate(className, args);
  }

  /**
   * @param {Morphy_GramInfo_Interface} graminfo
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {boolean} graminfoAsText
   * @param {Morphy_FilesBundle} bundle
   */
  createMorphierHelper(graminfo, gramtab, graminfoAsText, bundle) {

    return new _morphiers.Morphy_Morphier_Helper(graminfo, gramtab, this.createAncodesResolver(gramtab, bundle, true), graminfoAsText);
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createCommonMorphier(fsa, helper) {
    return new _morphiers.Morphy_Morphier_Common(fsa, helper);
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createBulkMorphier(fsa, helper) {
    return new _morphiers.Morphy_Morphier_Bulk(fsa, helper);
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createPredictByDbMorphier(fsa, helper) {
    if (this.options['predict_by_db']) {
      return new _morphiers.Morphy_Morphier_Predict_Database(fsa, helper);
    }

    return new _morphiers.Morphy_Morphier_Empty();
  }

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  createPredictBySuffixMorphier(fsa, helper) {
    if (this.options['predict_by_suffix']) {
      return new _morphiers.Morphy_Morphier_Predict_Suffix(fsa, helper);
    }

    return new _morphiers.Morphy_Morphier_Empty();
  }

}

exports.default = phpMorphy;
exports.STORAGE_FILE = _constants.STORAGE_FILE;
exports.STORAGE_MEM = _constants.STORAGE_MEM;
exports.SOURCE_FSA = _constants.SOURCE_FSA;
exports.RESOLVE_ANCODES_AS_TEXT = _constants.RESOLVE_ANCODES_AS_TEXT;
exports.RESOLVE_ANCODES_AS_DIALING = _constants.RESOLVE_ANCODES_AS_DIALING;
exports.RESOLVE_ANCODES_AS_INT = _constants.RESOLVE_ANCODES_AS_INT;
exports.NORMAL = _constants.NORMAL;
exports.IGNORE_PREDICT = _constants.IGNORE_PREDICT;
exports.ONLY_PREDICT = _constants.ONLY_PREDICT;
exports.PREDICT_BY_NONE = _constants.PREDICT_BY_NONE;
exports.PREDICT_BY_SUFFIX = _constants.PREDICT_BY_SUFFIX;
exports.PREDICT_BY_DB = _constants.PREDICT_BY_DB;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_State = exports.Morphy_Link_Annot = exports.Morphy_Link = exports.Morphy_Link_Base = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Morphy_Link_Base {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param trans
   * @param rawTrans
   */
  constructor(fsa, trans, rawTrans) {
    this.fsa = fsa;
    this.trans = trans;
    this.raw_trans = rawTrans;
  }

  isAnnotation() {}

  getTrans() {
    return this.trans;
  }

  getFsa() {
    return this.fsa;
  }

  getRawTrans() {
    return this.raw_trans;
  }

}

/**
 * This class represent "normal" link i.e. link that points to automat state
 */
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

class Morphy_Link extends Morphy_Link_Base {

  constructor(...args) {
    super(...args);
  }

  isAnnotation() {
    return false;
  }

  getDest() {
    return this.trans['dest'];
  }

  getAttr() {
    return this.trans['attr'];
  }

  getTargetState() {
    return this.createState(this.trans['dest']);
  }

  createState(index) {
    return new Morphy_State(this.fsa, index);
  }

}

class Morphy_Link_Annot extends Morphy_Link_Base {

  constructor(...args) {
    super(...args);
  }

  isAnnotation() {
    return true;
  }

  getAnnotation() {
    return this.fsa.getAnnot(this.raw_trans);
  }

}

class Morphy_State {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param index
   */
  constructor(fsa, index) {
    this.fsa = fsa;
    this.raw_transes = fsa.readState(index);
    this.transes = fsa.unpackTranses(this.raw_transes);
  }

  getLinks() {
    let trans;
    const result = [];

    for (let i = 0, c = this.transes.length; i < c; i++) {
      trans = this.transes[i];

      if (!trans['term']) {
        result.push(this.createNormalLink(trans, this.raw_transes[i]));
      } else {
        result.push(this.createAnnotLink(trans, this.raw_transes[i]));
      }
    }

    return result;
  }

  getSize() {
    return _lodash2.default.size(this.transes);
  }

  createNormalLink(trans, raw) {
    return new Morphy_Link(this.fsa, trans, raw);
  }

  createAnnotLink(trans, raw) {
    return new Morphy_Link_Annot(this.fsa, trans, raw);
  }

}

exports.Morphy_Link_Base = Morphy_Link_Base;
exports.Morphy_Link = Morphy_Link;
exports.Morphy_Link_Annot = Morphy_Link_Annot;
exports.Morphy_State = Morphy_State;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_GramTab = exports.Morphy_GramTab_Proxy = exports.Morphy_GramTab_Empty = exports.Morphy_GramTab_Interface = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Morphy_GramTab_Interface {

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

class Morphy_GramTab_Empty extends Morphy_GramTab_Interface {

  getGrammems(ancodeId) {
    return [];
  }

  getPartOfSpeech(ancodeId) {
    return 0;
  }

  resolveGrammemIds(ids) {
    return _utils.php.var.is_array(ids) ? {} : '';
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

class Morphy_GramTab_Proxy extends Morphy_GramTab_Interface {

  /**
   * @param {Morphy_Storage} storage
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
      this.___obj = Morphy_GramTab.create(this.storage);
      delete this.storage;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

class Morphy_GramTab extends Morphy_GramTab_Interface {

  /**
   * @param {Morphy_Storage} $storage
   * @returns {Morphy_GramTab}
   */
  static create($storage) {
    return new Morphy_GramTab($storage);
  }

  /**
   * @param {Morphy_Storage} storage
   */
  constructor(storage) {
    super();

    this.data = _utils.php.var.unserialize(storage.read(0, storage.getFileSize()).toString());
    if (this.data == false) {
      throw new Error('Broken gramtab data');
    }

    this.grammems = this.data['grammems'];
    this.poses = this.data['poses'];
    this.ancodes = this.data['ancodes'];
    this.___ancodes_map = null;
  }

  getGrammems(ancodeId) {
    if (!_utils.php.var.isset(this.ancodes[ancodeId])) {
      throw new Error(`Invalid ancode id '${ancodeId}'`);
    }

    return this.ancodes[ancodeId]['grammem_ids'];
  }

  getPartOfSpeech(ancodeId) {
    if (!_utils.php.var.isset(this.ancodes[ancodeId])) {
      throw new Error(`Invalid ancode id '${ancodeId} '`);
    }

    return this.ancodes[ancodeId].pos_id;
  }

  resolveGrammemIds(ids) {
    if (_utils.php.var.is_array(ids)) {
      const result = [];

      _lodash2.default.forEach(ids, id => {
        if (!_utils.php.var.isset(this.grammems[id])) {
          throw new Error(`Invalid grammem id '${id}'`);
        }

        result.push(this.grammems[id]['name']);
      });

      return result;
    }

    if (!_utils.php.var.isset(this.grammems[ids])) {
      throw new Error(`Invalid grammem id '${ids}'`);
    }

    return this.grammems[ids]['name'];
  }

  resolvePartOfSpeechId(id) {
    if (!_utils.php.var.isset(this.poses[id])) {
      throw new Error(`Invalid part of speech id '${id}'`);
    }

    return this.poses[id]['name'];
  }

  includeConsts() {
    /** todo: вот те самые константы */
    return __webpack_require__(21);
  }

  ancodeToString(ancodeId, commonAncode) {
    commonAncode = !_lodash2.default.isUndefined(commonAncode) ? commonAncode : null;

    if (_utils.php.var.isset(commonAncode)) {
      commonAncode = this.getGrammems(commonAncode).join(',') + ',';
    }

    return [this.getPartOfSpeech(ancodeId), ' ', commonAncode ? commonAncode : '', this.getGrammems(ancodeId).join(',')].join('');
  }

  findAncode(partOfSpeech, grammems) {}

  stringToAncode(string) {
    if (!_utils.php.var.isset(string)) {
      return null;
    }

    if (!_utils.php.var.isset(this.__ancodes_map[string])) {
      throw new Error(`Ancode with '${string}' graminfo not found`);
    }

    return this.__ancodes_map[string];
  }

  /**
   * @param partOfSpeechId
   * @param grammemIds
   * @returns {string}
   */
  toString(partOfSpeechId, grammemIds) {
    return partOfSpeechId + ' ' + _utils.php.strings.implode(',', grammemIds);
  }

  buildAncodesMap() {
    const result = {};

    _lodash2.default.forEach(this.ancodes, (data, ancode_id) => {
      const key = this.toString(data['pos_id'], data['grammem_ids']);

      result[key] = ancode_id;
    });

    return result;
  }

  get __ancodes_map() {
    if (!this.___ancodes_map) {
      this.___ancodes_map = this.buildAncodesMap();
    }

    return this.___ancodes_map;
  }

  set __ancodes_map(value) {
    this.___ancodes_map = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

exports.Morphy_GramTab_Interface = Morphy_GramTab_Interface;
exports.Morphy_GramTab_Empty = Morphy_GramTab_Empty;
exports.Morphy_GramTab_Proxy = Morphy_GramTab_Proxy;
exports.Morphy_GramTab = Morphy_GramTab;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// This file is autogenerated at Mon, 31 Aug 2009 04:56:59 +0400, don`t change it!

// parts of speech
const PMY_RP_NOUN = exports.PMY_RP_NOUN = 0;
const PMY_RP_ADJ_FULL = exports.PMY_RP_ADJ_FULL = 1;
const PMY_RP_VERB = exports.PMY_RP_VERB = 2;
const PMY_RP_PRONOUN = exports.PMY_RP_PRONOUN = 3;
const PMY_RP_PRONOUN_P = exports.PMY_RP_PRONOUN_P = 4;
const PMY_RP_PRONOUN_PREDK = exports.PMY_RP_PRONOUN_PREDK = 5;
const PMY_RP_NUMERAL = exports.PMY_RP_NUMERAL = 6;
const PMY_RP_NUMERAL_P = exports.PMY_RP_NUMERAL_P = 7;
const PMY_RP_ADV = exports.PMY_RP_ADV = 8;
const PMY_RP_PREDK = exports.PMY_RP_PREDK = 9;
const PMY_RP_PREP = exports.PMY_RP_PREP = 10;
const PMY_RP_POSL = exports.PMY_RP_POSL = 11;
const PMY_RP_CONJ = exports.PMY_RP_CONJ = 12;
const PMY_RP_INTERJ = exports.PMY_RP_INTERJ = 13;
const PMY_RP_INP = exports.PMY_RP_INP = 14;
const PMY_RP_PHRASE = exports.PMY_RP_PHRASE = 15;
const PMY_RP_PARTICLE = exports.PMY_RP_PARTICLE = 16;
const PMY_RP_ADJ_SHORT = exports.PMY_RP_ADJ_SHORT = 17;
const PMY_RP_PARTICIPLE = exports.PMY_RP_PARTICIPLE = 18;
const PMY_RP_ADVERB_PARTICIPLE = exports.PMY_RP_ADVERB_PARTICIPLE = 19;
const PMY_RP_PARTICIPLE_SHORT = exports.PMY_RP_PARTICIPLE_SHORT = 20;
const PMY_RP_INFINITIVE = exports.PMY_RP_INFINITIVE = 21;
const PMY_RP_EMPTY = exports.PMY_RP_EMPTY = 22;

// grammems
const PMY_RG_PLURAL = exports.PMY_RG_PLURAL = 0;
const PMY_RG_SINGULAR = exports.PMY_RG_SINGULAR = 1;
const PMY_RG_NOMINATIV = exports.PMY_RG_NOMINATIV = 2;
const PMY_RG_GENITIV = exports.PMY_RG_GENITIV = 3;
const PMY_RG_DATIV = exports.PMY_RG_DATIV = 4;
const PMY_RG_ACCUSATIV = exports.PMY_RG_ACCUSATIV = 5;
const PMY_RG_INSTRUMENTALIS = exports.PMY_RG_INSTRUMENTALIS = 6;
const PMY_RG_LOCATIV = exports.PMY_RG_LOCATIV = 7;
const PMY_RG_VOCATIV = exports.PMY_RG_VOCATIV = 8;
const PMY_RG_MASCULINUM = exports.PMY_RG_MASCULINUM = 9;
const PMY_RG_FEMINUM = exports.PMY_RG_FEMINUM = 10;
const PMY_RG_NEUTRUM = exports.PMY_RG_NEUTRUM = 11;
const PMY_RG_MASC_FEM = exports.PMY_RG_MASC_FEM = 12;
const PMY_RG_PRESENT_TENSE = exports.PMY_RG_PRESENT_TENSE = 13;
const PMY_RG_FUTURE_TENSE = exports.PMY_RG_FUTURE_TENSE = 14;
const PMY_RG_PAST_TENSE = exports.PMY_RG_PAST_TENSE = 15;
const PMY_RG_FIRST_PERSON = exports.PMY_RG_FIRST_PERSON = 16;
const PMY_RG_SECOND_PERSON = exports.PMY_RG_SECOND_PERSON = 17;
const PMY_RG_THIRD_PERSON = exports.PMY_RG_THIRD_PERSON = 18;
const PMY_RG_IMPERATIVE = exports.PMY_RG_IMPERATIVE = 19;
const PMY_RG_ANIMATIVE = exports.PMY_RG_ANIMATIVE = 20;
const PMY_RG_NON_ANIMATIVE = exports.PMY_RG_NON_ANIMATIVE = 21;
const PMY_RG_COMPARATIVE = exports.PMY_RG_COMPARATIVE = 22;
const PMY_RG_PERFECTIVE = exports.PMY_RG_PERFECTIVE = 23;
const PMY_RG_NON_PERFECTIVE = exports.PMY_RG_NON_PERFECTIVE = 24;
const PMY_RG_NON_TRANSITIVE = exports.PMY_RG_NON_TRANSITIVE = 25;
const PMY_RG_TRANSITIVE = exports.PMY_RG_TRANSITIVE = 26;
const PMY_RG_ACTIVE_VOICE = exports.PMY_RG_ACTIVE_VOICE = 27;
const PMY_RG_PASSIVE_VOICE = exports.PMY_RG_PASSIVE_VOICE = 28;
const PMY_RG_INDECLINABLE = exports.PMY_RG_INDECLINABLE = 29;
const PMY_RG_INITIALISM = exports.PMY_RG_INITIALISM = 30;
const PMY_RG_PATRONYMIC = exports.PMY_RG_PATRONYMIC = 31;
const PMY_RG_TOPONYM = exports.PMY_RG_TOPONYM = 32;
const PMY_RG_ORGANISATION = exports.PMY_RG_ORGANISATION = 33;
const PMY_RG_QUALITATIVE = exports.PMY_RG_QUALITATIVE = 34;
const PMY_RG_DE_FACTO_SING_TANTUM = exports.PMY_RG_DE_FACTO_SING_TANTUM = 35;
const PMY_RG_INTERROGATIVE = exports.PMY_RG_INTERROGATIVE = 36;
const PMY_RG_DEMONSTRATIVE = exports.PMY_RG_DEMONSTRATIVE = 37;
const PMY_RG_NAME = exports.PMY_RG_NAME = 38;
const PMY_RG_SUR_NAME = exports.PMY_RG_SUR_NAME = 39;
const PMY_RG_IMPERSONAL = exports.PMY_RG_IMPERSONAL = 40;
const PMY_RG_SLANG = exports.PMY_RG_SLANG = 41;
const PMY_RG_MISPRINT = exports.PMY_RG_MISPRINT = 42;
const PMY_RG_COLLOQUIAL = exports.PMY_RG_COLLOQUIAL = 43;
const PMY_RG_POSSESSIVE = exports.PMY_RG_POSSESSIVE = 44;
const PMY_RG_ARCHAISM = exports.PMY_RG_ARCHAISM = 45;
const PMY_RG_SECOND_CASE = exports.PMY_RG_SECOND_CASE = 46;
const PMY_RG_POETRY = exports.PMY_RG_POETRY = 47;
const PMY_RG_PROFESSION = exports.PMY_RG_PROFESSION = 48;
const PMY_RG_SUPERLATIVE = exports.PMY_RG_SUPERLATIVE = 49;
const PMY_RG_POSITIVE = exports.PMY_RG_POSITIVE = 50;
const PMY_RG_SHORT = exports.PMY_RG_SHORT = 51;
const PMY_RG_INFO = exports.PMY_RG_INFO = 52;
const PMY_RG_DEEPR = exports.PMY_RG_DEEPR = 53;
const PMY_RG_PR = exports.PMY_RG_PR = 54;
// -------------------------------------------------------------------------------

// parts of speech
const PMY_EP_NOUN = exports.PMY_EP_NOUN = 0;
const PMY_EP_ADJ = exports.PMY_EP_ADJ = 1;
const PMY_EP_VERB = exports.PMY_EP_VERB = 2;
const PMY_EP_VBE = exports.PMY_EP_VBE = 3;
const PMY_EP_MOD = exports.PMY_EP_MOD = 4;
const PMY_EP_NUMERAL = exports.PMY_EP_NUMERAL = 5;
const PMY_EP_CONJ = exports.PMY_EP_CONJ = 6;
const PMY_EP_INTERJ = exports.PMY_EP_INTERJ = 7;
const PMY_EP_PREP = exports.PMY_EP_PREP = 8;
const PMY_EP_PARTICLE = exports.PMY_EP_PARTICLE = 9;
const PMY_EP_ART = exports.PMY_EP_ART = 10;
const PMY_EP_ADV = exports.PMY_EP_ADV = 11;
const PMY_EP_PN = exports.PMY_EP_PN = 12;
const PMY_EP_ORDNUM = exports.PMY_EP_ORDNUM = 13;
const PMY_EP_PRON = exports.PMY_EP_PRON = 14;
const PMY_EP_POSS = exports.PMY_EP_POSS = 15;
const PMY_EP_PN_ADJ = exports.PMY_EP_PN_ADJ = 16;
const PMY_EP_EMPTY = exports.PMY_EP_EMPTY = 17;

// grammems
const PMY_EG_SINGULAR = exports.PMY_EG_SINGULAR = 0;
const PMY_EG_PLURAL = exports.PMY_EG_PLURAL = 1;
const PMY_EG_MASCULINUM = exports.PMY_EG_MASCULINUM = 2;
const PMY_EG_FEMINUM = exports.PMY_EG_FEMINUM = 3;
const PMY_EG_ANIMATIVE = exports.PMY_EG_ANIMATIVE = 4;
const PMY_EG_PERFECTIVE = exports.PMY_EG_PERFECTIVE = 5;
const PMY_EG_NOMINATIVE = exports.PMY_EG_NOMINATIVE = 6;
const PMY_EG_OBJECT_CASE = exports.PMY_EG_OBJECT_CASE = 7;
const PMY_EG_NARRATIVE = exports.PMY_EG_NARRATIVE = 8;
const PMY_EG_GEOGRAPHICS = exports.PMY_EG_GEOGRAPHICS = 9;
const PMY_EG_PROPER = exports.PMY_EG_PROPER = 10;
const PMY_EG_PERSONAL_PRONOUN = exports.PMY_EG_PERSONAL_PRONOUN = 11;
const PMY_EG_POSSESSIVE = exports.PMY_EG_POSSESSIVE = 12;
const PMY_EG_PREDICATIVE = exports.PMY_EG_PREDICATIVE = 13;
const PMY_EG_UNCOUNTABLE = exports.PMY_EG_UNCOUNTABLE = 14;
const PMY_EG_REFLEXIVE_PRONOUN = exports.PMY_EG_REFLEXIVE_PRONOUN = 15;
const PMY_EG_DEMONSTRATIVE_PRONOUN = exports.PMY_EG_DEMONSTRATIVE_PRONOUN = 16;
const PMY_EG_MASS = exports.PMY_EG_MASS = 17;
const PMY_EG_COMPARATIV = exports.PMY_EG_COMPARATIV = 18;
const PMY_EG_SUPREMUM = exports.PMY_EG_SUPREMUM = 19;
const PMY_EG_FIRST_PERSON = exports.PMY_EG_FIRST_PERSON = 20;
const PMY_EG_SECOND_PERSON = exports.PMY_EG_SECOND_PERSON = 21;
const PMY_EG_THIRD_PERSON = exports.PMY_EG_THIRD_PERSON = 22;
const PMY_EG_PRESENT_INDEF = exports.PMY_EG_PRESENT_INDEF = 23;
const PMY_EG_INFINITIVE = exports.PMY_EG_INFINITIVE = 24;
const PMY_EG_PAST_INDEF = exports.PMY_EG_PAST_INDEF = 25;
const PMY_EG_PAST_PARTICIPLE = exports.PMY_EG_PAST_PARTICIPLE = 26;
const PMY_EG_GERUND = exports.PMY_EG_GERUND = 27;
const PMY_EG_FUTURUM = exports.PMY_EG_FUTURUM = 28;
const PMY_EG_CONDITIONAL = exports.PMY_EG_CONDITIONAL = 29;
const PMY_EG_APOSTROPHE_S = exports.PMY_EG_APOSTROPHE_S = 30;
const PMY_EG_APOSTROPHE = exports.PMY_EG_APOSTROPHE = 31;
const PMY_EG_NAMES = exports.PMY_EG_NAMES = 32;
const PMY_EG_ORGANISATION = exports.PMY_EG_ORGANISATION = 33;
// -------------------------------------------------------------------------------

// parts of speech
const PMY_GP_ART = exports.PMY_GP_ART = 0;
const PMY_GP_ADJ = exports.PMY_GP_ADJ = 1;
const PMY_GP_ADV = exports.PMY_GP_ADV = 2;
const PMY_GP_EIG = exports.PMY_GP_EIG = 3;
const PMY_GP_SUB = exports.PMY_GP_SUB = 4;
const PMY_GP_VER = exports.PMY_GP_VER = 5;
const PMY_GP_P_A1 = exports.PMY_GP_P_A1 = 6;
const PMY_GP_P_A2 = exports.PMY_GP_P_A2 = 7;
const PMY_GP_PRONOMEN = exports.PMY_GP_PRONOMEN = 8;
const PMY_GP_PRP = exports.PMY_GP_PRP = 9;
const PMY_GP_KON = exports.PMY_GP_KON = 10;
const PMY_GP_NEG = exports.PMY_GP_NEG = 11;
const PMY_GP_INJ = exports.PMY_GP_INJ = 12;
const PMY_GP_ZAL = exports.PMY_GP_ZAL = 13;
const PMY_GP_ZUS = exports.PMY_GP_ZUS = 14;
const PMY_GP_PRO_BEG = exports.PMY_GP_PRO_BEG = 15;
const PMY_GP_ZU_INFINITIV = exports.PMY_GP_ZU_INFINITIV = 16;
const PMY_GP_EMPTY = exports.PMY_GP_EMPTY = 17;

// grammems
const PMY_GG_NOA_UNK = exports.PMY_GG_NOA_UNK = 0;
const PMY_GG_PREDIK_BENUTZ = exports.PMY_GG_PREDIK_BENUTZ = 1;
const PMY_GG_PRO_UNK = exports.PMY_GG_PRO_UNK = 2;
const PMY_GG_TMP_UNK = exports.PMY_GG_TMP_UNK = 3;
const PMY_GG_NAC = exports.PMY_GG_NAC = 4;
const PMY_GG_MOU = exports.PMY_GG_MOU = 5;
const PMY_GG_COU = exports.PMY_GG_COU = 6;
const PMY_GG_GEO = exports.PMY_GG_GEO = 7;
const PMY_GG_WASSER = exports.PMY_GG_WASSER = 8;
const PMY_GG_GEB = exports.PMY_GG_GEB = 9;
const PMY_GG_STD = exports.PMY_GG_STD = 10;
const PMY_GG_LOK = exports.PMY_GG_LOK = 11;
const PMY_GG_VOR = exports.PMY_GG_VOR = 12;
const PMY_GG_SICH_ACC = exports.PMY_GG_SICH_ACC = 13;
const PMY_GG_SICH_DAT = exports.PMY_GG_SICH_DAT = 14;
const PMY_GG_SCHWACH = exports.PMY_GG_SCHWACH = 15;
const PMY_GG_NICHT_SCHWACH = exports.PMY_GG_NICHT_SCHWACH = 16;
const PMY_GG_MODAL = exports.PMY_GG_MODAL = 17;
const PMY_GG_AUXILIAR = exports.PMY_GG_AUXILIAR = 18;
const PMY_GG_KONJ1 = exports.PMY_GG_KONJ1 = 19;
const PMY_GG_KONJ2 = exports.PMY_GG_KONJ2 = 20;
const PMY_GG_PARTIZIP1 = exports.PMY_GG_PARTIZIP1 = 21;
const PMY_GG_PARTIZIP2 = exports.PMY_GG_PARTIZIP2 = 22;
const PMY_GG_ZU_VERB_FORM = exports.PMY_GG_ZU_VERB_FORM = 23;
const PMY_GG_IMPERATIV = exports.PMY_GG_IMPERATIV = 24;
const PMY_GG_PRAETERITUM = exports.PMY_GG_PRAETERITUM = 25;
const PMY_GG_PRASENS = exports.PMY_GG_PRASENS = 26;
const PMY_GG_GRUNDFORM = exports.PMY_GG_GRUNDFORM = 27;
const PMY_GG_KOMPARATIV = exports.PMY_GG_KOMPARATIV = 28;
const PMY_GG_SUPERLATIV = exports.PMY_GG_SUPERLATIV = 29;
const PMY_GG_PROPORTIONAL_KONJUNKTION = exports.PMY_GG_PROPORTIONAL_KONJUNKTION = 30;
const PMY_GG_INFINITIV = exports.PMY_GG_INFINITIV = 31;
const PMY_GG_VERGLEICHS_KONJUNKTION = exports.PMY_GG_VERGLEICHS_KONJUNKTION = 32;
const PMY_GG_NEBENORDNENDE = exports.PMY_GG_NEBENORDNENDE = 33;
const PMY_GG_UNTERORDNENDE = exports.PMY_GG_UNTERORDNENDE = 34;
const PMY_GG_PERSONAL = exports.PMY_GG_PERSONAL = 35;
const PMY_GG_DEMONSTRATIV = exports.PMY_GG_DEMONSTRATIV = 36;
const PMY_GG_INTERROGATIV = exports.PMY_GG_INTERROGATIV = 37;
const PMY_GG_POSSESSIV = exports.PMY_GG_POSSESSIV = 38;
const PMY_GG_REFLEXIV = exports.PMY_GG_REFLEXIV = 39;
const PMY_GG_RIN_PRONOMEN = exports.PMY_GG_RIN_PRONOMEN = 40;
const PMY_GG_ALG_PRONOMEN = exports.PMY_GG_ALG_PRONOMEN = 41;
const PMY_GG_ADJEKTIVE_OHNE_ARTIKEL = exports.PMY_GG_ADJEKTIVE_OHNE_ARTIKEL = 42;
const PMY_GG_ADJEKTIVE_MIT_UNBESTIMMTE = exports.PMY_GG_ADJEKTIVE_MIT_UNBESTIMMTE = 43;
const PMY_GG_ADJEKTIVE_MIT_BESTIMMTE = exports.PMY_GG_ADJEKTIVE_MIT_BESTIMMTE = 44;
const PMY_GG_ERSTE_PERSON = exports.PMY_GG_ERSTE_PERSON = 45;
const PMY_GG_ZWEITE_PERSON = exports.PMY_GG_ZWEITE_PERSON = 46;
const PMY_GG_DRITTE_PERSON = exports.PMY_GG_DRITTE_PERSON = 47;
const PMY_GG_FEMININ = exports.PMY_GG_FEMININ = 48;
const PMY_GG_MASKULIN = exports.PMY_GG_MASKULIN = 49;
const PMY_GG_NEUTRUM = exports.PMY_GG_NEUTRUM = 50;
const PMY_GG_PLURAL = exports.PMY_GG_PLURAL = 51;
const PMY_GG_SINGULAR = exports.PMY_GG_SINGULAR = 52;
const PMY_GG_NOMINATIV = exports.PMY_GG_NOMINATIV = 53;
const PMY_GG_GENITIV = exports.PMY_GG_GENITIV = 54;
const PMY_GG_DATIV = exports.PMY_GG_DATIV = 55;
const PMY_GG_AKKUSATIV = exports.PMY_GG_AKKUSATIV = 56;
const PMY_GG_ABBREVIATION = exports.PMY_GG_ABBREVIATION = 57;
const PMY_GG_EINWOHNER = exports.PMY_GG_EINWOHNER = 58;
const PMY_GG_TRANSITIV = exports.PMY_GG_TRANSITIV = 59;
const PMY_GG_INTRANSITIV = exports.PMY_GG_INTRANSITIV = 60;
const PMY_GG_IMPERSONAL = exports.PMY_GG_IMPERSONAL = 61;
// -------------------------------------------------------------------------------

// parts of speech
const PMY_UP_UNKNOWN = exports.PMY_UP_UNKNOWN = 0;

// grammems
const PMY_UG_UNKNOWN = exports.PMY_UG_UNKNOWN = 0;
// -------------------------------------------------------------------------------

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
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

class Morphy_Source_Interface {

  getValue(key) {}

}

class Morphy_Source_Fsa extends Morphy_Source_Interface {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   */
  constructor(fsa) {
    this.fsa = fsa;
    this.root = fsa.getRootTrans();
  }

  getFsa() {
    return this.fsa;
  }

  getValue(key) {
    const result = this.fsa.walk(this.root, key, true);
    if (result === false || !result['annot']) {
      return false;
    }

    return result['annot'];
  }

}

exports.Morphy_Source_Interface = Morphy_Source_Interface;
exports.Morphy_Source_Fsa = Morphy_Source_Fsa;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_Storage_Factory = exports.Morphy_Storage_Mem = exports.Morphy_Storage_File = exports.Morphy_Storage_Proxy = exports.Morphy_Storage = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = __webpack_require__(3);

var _fs2 = _interopRequireDefault(_fs);

var _utils = __webpack_require__(1);

var _constants = __webpack_require__(7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Morphy_Storage {

  constructor(fileName = '') {
    if (fileName) {
      this.file_name = fileName;
      this.resource = this.open(fileName);
    }
  }

  getFileName() {
    return this.file_name;
  }

  getResource() {
    return this.resource;
  }

  getTypeAsString() {
    return this.getType();
  }

  /**
   * @param {number} offset
   * @param {number} len
   * @param {boolean} [exactLength=true]
   * @returns {*}
   */
  read(offset, len, exactLength = true) {
    if (offset >= this.getFileSize()) {
      throw new Error(`Can't read ${len} bytes beyond end of '${this.getFileName()}' file, offset = ${offset}, file_size = ${this.getFileSize()}`);
    }

    let result;
    try {
      result = this.readUnsafe(offset, len);
    } catch (e) {
      throw new Error(`Can't read ${len} bytes at ${offset} offset, from '${this.getFileName()}' file: ${e.message}`);
    }

    if (exactLength && result.length < len) {
      throw new Error(`Can't read ${len} bytes at ${offset} offset, from '${this.getFileName()}' file`);
    }

    return result;
  }

  readUnsafe(offset, len) {}

  getFileSize() {}

  getType() {}

  open(fileName) {}

}

class Morphy_Storage_Proxy extends Morphy_Storage {

  constructor(type, fileName, factory) {
    super();
    this.file_name = fileName;
    this.type = type;
    this.factory = factory;
    this.___obj = null;
  }

  getFileName() {
    return this.__obj.getFileName();
  }

  getResource() {
    return this.__obj.getResource();
  }

  getFileSize() {
    return this.__obj.getFileSize();
  }

  getType() {
    return this.__obj.getType();
  }

  readUnsafe(offset, len) {
    return this.__obj.readUnsafe(offset, len);
  }

  open(fileName) {
    return this.__obj.open(fileName);
  }

  get __obj() {
    if (!this.___obj) {
      this.___obj = this.factory.open(this.type, this.file_name, false);

      delete this.file_name;
      delete this.type;
      delete this.factory;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_lodash2.default.isUndefined(value) ? value : null;
  }

}

class Morphy_Storage_File extends Morphy_Storage {

  constructor() {
    super(...arguments);
  }

  getType() {
    return _constants.STORAGE_FILE;
  }

  getFileSize() {
    const stat = _fs2.default.fstatSync(this.resource);
    if (stat === false) {
      throw new Error(`Can't invoke fs.fstatSync for '${this.file_name}' file`);
    }

    return stat['size'];
  }

  readUnsafe(offset, len) {
    const buf = Buffer.alloc(len);
    _fs2.default.readSync(this.resource, buf, 0, len, offset);

    return buf;
  }

  open(fileName) {
    const fh = _fs2.default.openSync(fileName, 'r');
    if (fh === false) {
      throw new Error(`Can't open '${this.file_name}' file`);
    }

    return fh;
  }

}

class Morphy_Storage_Mem extends Morphy_Storage {

  constructor() {
    super(...arguments);
  }

  getType() {
    return _constants.STORAGE_MEM;
  }

  getFileSize() {
    return this.resource.length;
  }

  readUnsafe(offset, len) {
    return _utils.php.strings.substr(this.resource, offset, len);
    //return this.resource.slice(offset, offset + len - 1);
  }

  open(fileName) {
    const buffer = _fs2.default.readFileSync(fileName);
    if (buffer === false) {
      throw new Error(`Can't read '${fileName}' file`);
    }

    return buffer;
  }

}

class Morphy_Storage_Factory {

  static get storages() {
    return {
      Morphy_Storage_File,
      Morphy_Storage_Mem
    };
  }

  open(type, fileName, lazy) {
    switch (type) {
      case _constants.STORAGE_FILE:
      // downfall
      case _constants.STORAGE_MEM:
        break;
      default:
        throw new Error(`Invalid storage type '${type}' specified`);
    }

    if (lazy) {
      return new Morphy_Storage_Proxy(type, fileName, this);
    }

    const className = 'Morphy_Storage_' + _utils.php.strings.ucfirst(type.toLowerCase());

    return new Morphy_Storage_Factory.storages[className](fileName);
  }

}

exports.Morphy_Storage = Morphy_Storage;
exports.Morphy_Storage_Proxy = Morphy_Storage_Proxy;
exports.Morphy_Storage_File = Morphy_Storage_File;
exports.Morphy_Storage_Mem = Morphy_Storage_Mem;
exports.Morphy_Storage_Factory = Morphy_Storage_Factory;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Morphy_UnicodeHelper_ucs_4be = exports.Morphy_UnicodeHelper_ucs_4le = exports.Morphy_UnicodeHelper_ucs_2be = exports.Morphy_UnicodeHelper_ucs_2le = exports.Morphy_UnicodeHelper_utf_32be = exports.Morphy_UnicodeHelper_utf_32le = exports.Morphy_UnicodeHelper_utf_32_Base = exports.Morphy_UnicodeHelper_utf_16be = exports.Morphy_UnicodeHelper_utf_16le = exports.Morphy_UnicodeHelper_utf_16_Base = exports.Morphy_UnicodeHelper_utf_8 = exports.Morphy_UnicodeHelper_singlebyte = exports.Morphy_UnicodeHelper_MultiByteFixed = exports.Morphy_UnicodeHelper_Base = exports.Morphy_UnicodeHelper = undefined;

var _lodash = __webpack_require__(0);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const Morphy_UnicodeHelper_cache = {};
const Morphy_UnicodeHelper_unicodeHelpers = {};

class Morphy_UnicodeHelper {

  static get cache() {
    return Morphy_UnicodeHelper_cache;
  }

  static get unicodeHelpers() {
    return Morphy_UnicodeHelper_unicodeHelpers;
  }

  static create(encoding) {
    const cache = Morphy_UnicodeHelper.cache,
          doCreate = Morphy_UnicodeHelper.doCreate;


    encoding = encoding.toLowerCase();
    if (_utils.php.var.isset(cache[encoding])) {
      return cache[encoding];
    }

    const result = doCreate(encoding);
    cache[encoding] = result;

    return result;
  }

  static doCreate(encoding) {
    let matches = encoding.match(/^(utf|ucs)(-)?([0-9]+)(-)?(le|be)?$/);
    if (matches) {
      let tmp;
      let encoding_name;
      let className;

      let utf_type = matches[1];
      let utf_base = parseInt(matches[3], 10);
      let endiannes = '';

      switch (utf_type) {
        case 'utf':
          if ([8, 16, 32].indexOf(utf_base) < 0) {
            // if (!php.array.in_array(utf_base, [8, 16, 32])) {
            throw new Error('Invalid utf base');
          }

          break;
        case 'ucs':
          if ([2, 4].indexOf(utf_base) < 0) {
            // if (!php.array.in_array(utf_base, [2, 4])) {
            throw new Error('Invalid ucs base');
          }

          break;
        default:
          throw new Error('Internal error');
      }

      if (utf_base > 8 || 'ucs' === utf_type) {
        if (_utils.php.var.isset(matches[5])) {
          endiannes = matches[5] == 'be' ? 'be' : 'le';
        } else {
          tmp = _utils.php.misc.pack('L', 1);
          endiannes = _utils.php.strings.ord(tmp) == 0 ? 'be' : 'le';
        }
      }

      if (utf_type == 'ucs' || utf_base > 8) {
        encoding_name = utf_type + '-' + utf_base + endiannes;
      } else {
        encoding_name = utf_type + '-' + utf_base;
      }

      className = `Morphy_UnicodeHelper_${_utils.php.strings.str_replace('-', '_', encoding_name)}`;

      return new Morphy_UnicodeHelper.unicodeHelpers[className](encoding_name);
    } else {
      return new Morphy_UnicodeHelper_singlebyte(encoding);
    }
  }

  firstCharSize(str) {}

  strrev(str) {}

  strlen(str) {}

  fixTrailing(str) {}

}

class Morphy_UnicodeHelper_Base extends Morphy_UnicodeHelper {

  constructor(encoding) {
    super(...arguments);
    this.encoding = encoding;
  }

  strlen(str) {
    return (0, _utils.buffer2str)(str).length;
  }

  php_strlen(str) {
    return (0, _utils.buffer2str)(str).length;
  }

}

class Morphy_UnicodeHelper_MultiByteFixed extends Morphy_UnicodeHelper_Base {

  constructor(encoding, size) {
    super(...arguments);
    this.size = size;
  }

  firstCharSize(str) {
    return this.size;
  }

  strrev(str) {
    return _utils.php.strings.implode('', _utils.php.array.array_reverse(_utils.php.strings.str_split(str, this.size)));
  }

  php_strlen(str) {
    return _utils.php.strings.strlen(str) / this.size;
  }

  fixTrailing(str) {
    const len = _utils.php.strings.strlen(str);

    if (len % this.size > 0) {
      return _utils.php.strings.substr(str, 0, Math.floor(len / this.size) * this.size);
    }

    return str;
  }

}

// single byte encoding
class Morphy_UnicodeHelper_singlebyte extends Morphy_UnicodeHelper_Base {

  constructor(encoding, size) {
    super(...arguments);
    this.size = size;
  }

  firstCharSize(str) {
    return 1;
  }

  strrev(str) {
    return (0, _utils.toBuffer)((0, _utils.buffer2str)(str).split('').reverse().join(''));
  }

  strlen(str) {
    return (0, _utils.buffer2str)(str).length;
  }

  fixTrailing(str) {
    return str;
  }

  php_strlen(str) {
    return (0, _utils.buffer2str)(str).length;
  }

}

// utf8
class Morphy_UnicodeHelper_utf_8 extends Morphy_UnicodeHelper_Base {

  constructor(encoding) {
    super(...arguments);

    this.tails_length = this.getTailsLength();
  }

  firstCharSize(str) {
    return 1 + this.tails_length[_utils.php.strings.ord(str)];
  }

  strrev(str) {
    return (0, _utils.toBuffer)((0, _utils.buffer2str)(str).split('').reverse().join(''));
  }

  fixTrailing(str) {
    str = (0, _utils.toBuffer)(str);

    const strlen = str.length;

    if (!strlen) {
      return '';
    }

    let ord = str[strlen - 1];
    let diff;
    let seq_len;
    let miss;

    if ((ord & 0x80) == 0) {
      return str;
    }

    for (let i = strlen - 1; i >= 0; i--) {
      ord = str[i];

      if ((ord & 0xC0) == 0xC0) {
        diff = strlen - i;
        seq_len = this.tails_length[ord] + 1;

        miss = seq_len - diff;

        if (miss) {
          return str.slice(0, -(seq_len - miss));
        } else {
          return str;
        }
      }
    }

    return '';
  }

  php_strlen(str) {
    return (0, _utils.buffer2str)(str).length;
  }

  getTailsLength() {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 0, 0];
  }

}

// utf16
class Morphy_UnicodeHelper_utf_16_Base extends Morphy_UnicodeHelper_Base {

  constructor(encoding, isBigEndian) {
    super(...arguments);

    this.is_be = !!isBigEndian;
    this.char_fmt = isBigEndian ? 'n' : 'v';
  }

  firstCharSize(str) {
    const ord = _utils.php.unpack(this.char_fmt, str)[1];

    return ord >= 0xD800 && ord <= 0xDFFF ? 4 : 2;
  }

  strrev(str) {
    const count = _utils.php.strings.strlen(str);
    const fmt = this.char_fmt + count;
    const words = _utils.php.array.array_reverse(_utils.php.unpack(fmt, str));

    let ord;
    let t;

    for (let i = 0; i < count; i++) {
      ord = words[i];

      if (ord >= 0xD800 && ord <= 0xDFFF) {
        // swap surrogates
        t = words[i];
        words[i] = words[i + 1];

        i++;
        words[i] = t;
      }
    }

    _utils.php.array.array_unshift(words, fmt);

    return _utils.php.misc.pack(...words);
  }

  fixTrailing(str) {
    let strlen = _utils.php.strings.strlen(str);

    if (strlen & 1) {
      strlen--;
      str = _utils.php.strings.substr(str, 0, strlen);
    }

    if (strlen < 2) {
      return '';
    }

    let ord = _utils.php.unpack(this.char_fmt, _utils.php.strings.substr(str, -2, 2))[1];

    if (this.isSurrogate(ord)) {
      if (strlen < 4) {
        return '';
      }

      ord = _utils.php.unpack(this.char_fmt, _utils.php.strings.substr(str, -4, 2))[1];

      if (this.isSurrogate(ord)) {
        // full surrogate pair
        return str;
      } else {
        return _utils.php.strings.substr(str, 0, -2);
      }
    }

    return str;
  }

  php_strlen(str) {
    let count = _utils.php.strings.strlen(str) / 2;
    const fmt = this.char_fmt + count;

    _lodash2.default.forEach(_utils.php.unpack(fmt, str), ord => {
      if (ord >= 0xD800 && ord <= 0xDFFF) {
        count--;
      }
    });

    return count;
  }

  isSurrogate(ord) {
    return ord >= 0xD800 && ord <= 0xDFFF;
  }

}

class Morphy_UnicodeHelper_utf_16le extends Morphy_UnicodeHelper_utf_16_Base {

  constructor(encoding) {
    super(encoding, false);
  }

}

class Morphy_UnicodeHelper_utf_16be extends Morphy_UnicodeHelper_utf_16_Base {

  constructor(encoding) {
    super(encoding, true);
  }

}

// utf32
class Morphy_UnicodeHelper_utf_32_Base extends Morphy_UnicodeHelper_MultiByteFixed {

  constructor(encoding) {
    super(encoding, 4);
  }

}

class Morphy_UnicodeHelper_utf_32le extends Morphy_UnicodeHelper_utf_32_Base {

  constructor() {
    super(...arguments);
  }

}

class Morphy_UnicodeHelper_utf_32be extends Morphy_UnicodeHelper_utf_32_Base {

  constructor() {
    super(...arguments);
  }

}

// ucs2, ucs4
class Morphy_UnicodeHelper_ucs_2le extends Morphy_UnicodeHelper_MultiByteFixed {

  constructor(encoding) {
    super(encoding, 2);
  }

}

class Morphy_UnicodeHelper_ucs_2be extends Morphy_UnicodeHelper_MultiByteFixed {

  constructor(encoding) {
    super(encoding, 2);
  }

}

class Morphy_UnicodeHelper_ucs_4le extends Morphy_UnicodeHelper_MultiByteFixed {

  constructor(encoding) {
    super(encoding, 4);
  }

}

class Morphy_UnicodeHelper_ucs_4be extends Morphy_UnicodeHelper_MultiByteFixed {

  constructor(encoding) {
    super(encoding, 4);
  }

}

Object.assign(Morphy_UnicodeHelper_unicodeHelpers, {
  Morphy_UnicodeHelper_MultiByteFixed,
  Morphy_UnicodeHelper_singlebyte,
  Morphy_UnicodeHelper_utf_8,
  Morphy_UnicodeHelper_utf_16_Base,
  Morphy_UnicodeHelper_utf_16le,
  Morphy_UnicodeHelper_utf_16be,
  Morphy_UnicodeHelper_utf_32_Base,
  Morphy_UnicodeHelper_utf_32le,
  Morphy_UnicodeHelper_utf_32be,
  Morphy_UnicodeHelper_ucs_2le,
  Morphy_UnicodeHelper_ucs_2be,
  Morphy_UnicodeHelper_ucs_4le,
  Morphy_UnicodeHelper_ucs_4be
});

exports.Morphy_UnicodeHelper = Morphy_UnicodeHelper;
exports.Morphy_UnicodeHelper_Base = Morphy_UnicodeHelper_Base;
exports.Morphy_UnicodeHelper_MultiByteFixed = Morphy_UnicodeHelper_MultiByteFixed;
exports.Morphy_UnicodeHelper_singlebyte = Morphy_UnicodeHelper_singlebyte;
exports.Morphy_UnicodeHelper_utf_8 = Morphy_UnicodeHelper_utf_8;
exports.Morphy_UnicodeHelper_utf_16_Base = Morphy_UnicodeHelper_utf_16_Base;
exports.Morphy_UnicodeHelper_utf_16le = Morphy_UnicodeHelper_utf_16le;
exports.Morphy_UnicodeHelper_utf_16be = Morphy_UnicodeHelper_utf_16be;
exports.Morphy_UnicodeHelper_utf_32_Base = Morphy_UnicodeHelper_utf_32_Base;
exports.Morphy_UnicodeHelper_utf_32le = Morphy_UnicodeHelper_utf_32le;
exports.Morphy_UnicodeHelper_utf_32be = Morphy_UnicodeHelper_utf_32be;
exports.Morphy_UnicodeHelper_ucs_2le = Morphy_UnicodeHelper_ucs_2le;
exports.Morphy_UnicodeHelper_ucs_2be = Morphy_UnicodeHelper_ucs_2be;
exports.Morphy_UnicodeHelper_ucs_4le = Morphy_UnicodeHelper_ucs_4le;
exports.Morphy_UnicodeHelper_ucs_4be = Morphy_UnicodeHelper_ucs_4be;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

var map = {
	"./fsa_sparse_file": 8,
	"./fsa_sparse_file.js": 8,
	"./fsa_sparse_mem": 9,
	"./fsa_sparse_mem.js": 9,
	"./fsa_tree_file": 10,
	"./fsa_tree_file.js": 10,
	"./fsa_tree_mem": 11,
	"./fsa_tree_mem.js": 11
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 25;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

var map = {
	"./graminfo_file": 12,
	"./graminfo_file.js": 12,
	"./graminfo_mem": 13,
	"./graminfo_mem.js": 13
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 26;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

var map = {
	"./common": 4,
	"./common.js": 4,
	"./ru_ru": 14,
	"./ru_ru.js": 14
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 27;


/***/ },
/* 28 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.array.from");

/***/ },
/* 29 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.function.name");

/***/ },
/* 30 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.map");

/***/ },
/* 31 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.promise");

/***/ },
/* 32 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.set");

/***/ },
/* 33 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.symbol");

/***/ },
/* 34 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.array-buffer");

/***/ },
/* 35 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.float32-array");

/***/ },
/* 36 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.float64-array");

/***/ },
/* 37 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.int16-array");

/***/ },
/* 38 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.int32-array");

/***/ },
/* 39 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.int8-array");

/***/ },
/* 40 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.uint16-array");

/***/ },
/* 41 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.uint32-array");

/***/ },
/* 42 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.uint8-array");

/***/ },
/* 43 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.typed.uint8-clamped-array");

/***/ },
/* 44 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.weak-map");

/***/ },
/* 45 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es6.weak-set");

/***/ },
/* 46 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es7.object.entries");

/***/ },
/* 47 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es7.object.get-own-property-descriptors");

/***/ },
/* 48 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es7.object.values");

/***/ },
/* 49 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es7.string.pad-end");

/***/ },
/* 50 */
/***/ function(module, exports) {

module.exports = require("core-js/modules/es7.string.pad-start");

/***/ },
/* 51 */
/***/ function(module, exports) {

module.exports = require("locutus/php");

/***/ },
/* 52 */
/***/ function(module, exports) {

module.exports = require("phpunserialize");

/***/ },
/* 53 */
/***/ function(module, exports) {

module.exports = require("util");

/***/ },
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(17);


/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map