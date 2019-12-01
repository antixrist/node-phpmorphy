import _ from 'lodash';
import * as php from 'locutus/php';

// php.info.ini_set('unicode.semantics', 'on');
// php.info.ini_set('locutus.objectsAsArrays', false);

/**
 * @param {string} format
 * @param {Buffer} buffer
 * @returns {Object|Object[]}
 */
php.unpack = function unpack(format, buffer) {
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
    a: 'Строка (string) с NULL-заполнением',
    A: 'Строка (string) со SPACE-заполнением',
    h: 'Hex-строка (Hex string), с нижнего разряда',
    H: 'Hex-строка (Hex string), с верхнего разряда',
    c: 'знаковый символ (char)',
    C: 'беззнаковый символ (char)',
    s: 'знаковый short (всегда 16 бит, машинный байтовый порядок)',
    S: 'беззнаковый short (всегда 16 бит, машинный байтовый порядок)',
    n: 'беззнаковый short (всегда 16 бит, порядок big endian)',
    v: 'беззнаковый short (всегда 16 бит, порядок little endian)',
    i: 'знаковый integer (машинно-зависимый размер и порядок)',
    I: 'беззнаковый integer (машинно-зависимый размер и порядок)',
    l: 'знаковый long (всегда 32 бит, машинный порядок)',
    L: 'беззнаковый long (всегда 32 бит, машинный порядок)',
    N: 'беззнаковый long (всегда 32 бит, порядок big endian)',
    V: 'беззнаковый long (всегда 32 бит, порядок little endian)',
    f: 'float (машинно-зависимые размер и прдставление)',
    d: 'double (машинно-зависимые размер и прдставление)',
    x: 'NUL байт',
    X: 'Резервирование одного байта',
    '@': 'NUL-заполнение до абсолютной позиции',
  };
  const parts = format.split('/');
  let offset = 0;
  let mod;
  let lenStr;
  let len;
  if (parts.length > 1) {
    const result = {};
    for (const part of parts) {
      mod = part[0];
      if (mod in codes) {
        switch (mod) {
          case 'V':
            result[part.slice(1)] = buffer.readUInt32LE(offset);
            offset += 4;
            break;
          case 'v':
            result[part.slice(1)] = buffer.readUInt16LE(offset);
            offset += 2;
            break;
          case 'a':
            lenStr = /\d+/g.exec(part)[0];
            len = parseInt(lenStr, 10);
            result[part.slice(1 + lenStr.length)] = buffer.toString('ascii', offset, len);
            offset += len;
            break;
          default:
            util.puts(`${part} ${offset}`);
            break;
        }
      }
    }

    return result;
  }
  const result = [];
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
          util.puts(format);
          break;
      }
    }
    result.push(obj);
  } while (offset < buffer.length);

  return result;
};

php.strings.ord = function ord(str, idx) {
  if (!Buffer.isBuffer(str)) {
    str = Buffer.from(str);
  }

  idx = !_.isUndefined(idx) && _.isNumber(idx) && idx < str.length ? idx : 0;

  return str[idx];
};

php.strings._substr = php.strings.substr; // safe
/**
 * @param {String|Buffer} str
 * @param {Number} start
 * @param {Number} [len]
 * @returns {string|Buffer|boolean}
 */
php.strings.substr = function php$substr(str, start, len) {
  let end;

  if (Buffer.isBuffer(str)) {
    end = str.length;
    start = start < 0 ? start + end : start;
    end = typeof len === 'undefined' ? end : len < 0 ? len + end : len + start;

    return start >= str.length || start < 0 || start > end ? false : str.slice(start, end);
  }

  return php.strings._substr.apply(php.strings._substr, arguments);
};

export default php;
