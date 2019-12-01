import _ from 'lodash';
import { php, toBuffer, buffer2str } from '~/utils';

const UnicodeHelperCache = {};
const UnicodeHelperHelpersMap = {};

class UnicodeHelper {
  static get cache() {
    return UnicodeHelperCache;
  }

  static get unicodeHelpers() {
    return UnicodeHelperHelpersMap;
  }

  static create(encoding) {
    const { cache, doCreate } = UnicodeHelper;

    encoding = encoding.toLowerCase();
    if (php.var.isset(cache[encoding])) {
      return cache[encoding];
    }

    const result = doCreate(encoding);
    cache[encoding] = result;

    return result;
  }

  static doCreate(encoding) {
    const matches = encoding.match(/^(utf|ucs)(-)?(\d+)(-)?(le|be)?$/);
    if (matches) {
      let tmp;
      let encodingName;

      const utfType = matches[1];
      const utfBase = parseInt(matches[3], 10);
      let endiannes = '';

      switch (utfType) {
        case 'utf':
          if (![8, 16, 32].includes(utfBase)) {
            // if (!php.array.in_array(utfBase, [8, 16, 32])) {
            throw new Error('Invalid utf base');
          }

          break;
        case 'ucs':
          if (![2, 4].includes(utfBase)) {
            // if (!php.array.in_array(utfBase, [2, 4])) {
            throw new Error('Invalid ucs base');
          }

          break;
        default:
          throw new Error('Internal error');
      }

      if (utfBase > 8 || utfType === 'ucs') {
        if (php.var.isset(matches[5])) {
          endiannes = matches[5] === 'be' ? 'be' : 'le';
        } else {
          tmp = php.misc.pack('L', 1);
          endiannes = php.strings.ord(tmp) === 0 ? 'be' : 'le';
        }
      }

      if (utfType === 'ucs' || utfBase > 8) {
        encodingName = `${utfType}-${utfBase}${endiannes}`;
      } else {
        encodingName = `${utfType}-${utfBase}`;
      }

      const className = `UnicodeHelper${_.upperFirst(_.camelCase(encodingName))}`;

      return new UnicodeHelper.unicodeHelpers[className](encodingName);
    }

    return new UnicodeHelperSinglebyte(encoding);
  }

  firstCharSize(str) {}

  strrev(str) {}

  strlen(str) {}

  fixTrailing(str) {}
}

class UnicodeHelperBase extends UnicodeHelper {
  constructor(encoding) {
    super();
    this.encoding = encoding;
  }

  strlen(str) {
    return buffer2str(str).length;
  }

  php_strlen(str) {
    return buffer2str(str).length;
  }
}

class UnicodeHelperMultiByteFixed extends UnicodeHelperBase {
  constructor(encoding, size) {
    super(encoding);
    this.size = size;
  }

  firstCharSize(str) {
    return this.size;
  }

  strrev(str) {
    return php.strings.implode('', php.array.array_reverse(php.strings.str_split(str, this.size)));
  }

  php_strlen(str) {
    return php.strings.strlen(str) / this.size;
  }

  fixTrailing(str) {
    const len = php.strings.strlen(str);

    if (len % this.size > 0) {
      return php.strings.substr(str, 0, Math.floor(len / this.size) * this.size);
    }

    return str;
  }
}

// single byte encoding
class UnicodeHelperSinglebyte extends UnicodeHelperBase {
  constructor(encoding, size) {
    super(encoding);
    this.size = size;
  }

  firstCharSize(str) {
    return 1;
  }

  strrev(str) {
    return toBuffer(
      buffer2str(str)
        .split('')
        .reverse()
        .join(''),
    );
  }

  strlen(str) {
    return buffer2str(str).length;
  }

  fixTrailing(str) {
    return str;
  }

  php_strlen(str) {
    return buffer2str(str).length;
  }
}

// utf8
class UnicodeHelperUtf8 extends UnicodeHelperBase {
  constructor(encoding) {
    super(encoding);

    this.tails_length = this.getTailsLength();
  }

  firstCharSize(str) {
    return 1 + this.tails_length[php.strings.ord(str)];
  }

  strrev(str) {
    return toBuffer(
      buffer2str(str)
        .split('')
        .reverse()
        .join(''),
    );
  }

  fixTrailing(str) {
    str = toBuffer(str);

    const strlen = str.length;

    if (!strlen) {
      return '';
    }

    let ord = str[strlen - 1];
    let diff;
    let seqLen;
    let miss;

    if ((ord & 0x80) === 0) {
      return str;
    }

    for (let i = strlen - 1; i >= 0; i--) {
      ord = str[i];

      if ((ord & 0xc0) === 0xc0) {
        diff = strlen - i;
        seqLen = this.tails_length[ord] + 1;

        miss = seqLen - diff;

        if (miss) {
          return str.slice(0, -(seqLen - miss));
        }
        return str;
      }
    }

    return '';
  }

  php_strlen(str) {
    return buffer2str(str).length;
  }

  getTailsLength() {
    return [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      3,
      4,
      4,
      4,
      4,
      5,
      5,
      0,
      0,
    ];
  }
}

// utf16
class UnicodeHelperUtf16Base extends UnicodeHelperBase {
  constructor(encoding, isBigEndian) {
    super(encoding);
    this.is_be = !!isBigEndian;
    this.char_fmt = isBigEndian ? 'n' : 'v';
  }

  firstCharSize(str) {
    const ord = php.unpack(this.char_fmt, str)[1];

    return ord >= 0xd800 && ord <= 0xdfff ? 4 : 2;
  }

  strrev(str) {
    const count = php.strings.strlen(str);
    const fmt = this.char_fmt + count;
    const words = php.array.array_reverse(php.unpack(fmt, str));

    let ord;
    let t;

    for (let i = 0; i < count; i++) {
      ord = words[i];

      if (ord >= 0xd800 && ord <= 0xdfff) {
        // swap surrogates
        t = words[i];
        words[i] = words[i + 1];

        i += 1;
        words[i] = t;
      }
    }

    php.array.array_unshift(words, fmt);

    return php.misc.pack(...words);
  }

  fixTrailing(str) {
    let strlen = php.strings.strlen(str);

    if (strlen & 1) {
      strlen -= 1;
      str = php.strings.substr(str, 0, strlen);
    }

    if (strlen < 2) {
      return '';
    }

    let ord = php.unpack(this.char_fmt, php.strings.substr(str, -2, 2))[1];

    if (this.isSurrogate(ord)) {
      if (strlen < 4) {
        return '';
      }

      ord = php.unpack(this.char_fmt, php.strings.substr(str, -4, 2))[1];

      if (this.isSurrogate(ord)) {
        // full surrogate pair
        return str;
      }
      return php.strings.substr(str, 0, -2);
    }

    return str;
  }

  php_strlen(str) {
    let count = php.strings.strlen(str) / 2;
    const fmt = this.char_fmt + count;

    _.forEach(php.unpack(fmt, str), ord => {
      if (ord >= 0xd800 && ord <= 0xdfff) {
        count -= 1;
      }
    });

    return count;
  }

  isSurrogate(ord) {
    return ord >= 0xd800 && ord <= 0xdfff;
  }
}

class UnicodeHelperUtf16Le extends UnicodeHelperUtf16Base {
  constructor(encoding) {
    super(encoding, false);
  }
}

class UnicodeHelperUtf16Be extends UnicodeHelperUtf16Base {
  constructor(encoding) {
    super(encoding, true);
  }
}

// utf32
class UnicodeHelperUtf32Base extends UnicodeHelperMultiByteFixed {
  constructor(encoding) {
    super(encoding, 4);
  }
}

class UnicodeHelperUtf32Le extends UnicodeHelperUtf32Base {}

class UnicodeHelperUtf32Be extends UnicodeHelperUtf32Base {}

// ucs2, ucs4
class UnicodeHelperUcs2Le extends UnicodeHelperMultiByteFixed {
  constructor(encoding) {
    super(encoding, 2);
  }
}

class UnicodeHelperUcs2Be extends UnicodeHelperMultiByteFixed {
  constructor(encoding) {
    super(encoding, 2);
  }
}

class UnicodeHelperUcs4Le extends UnicodeHelperMultiByteFixed {
  constructor(encoding) {
    super(encoding, 4);
  }
}

class UnicodeHelperUcs4Be extends UnicodeHelperMultiByteFixed {
  constructor(encoding) {
    super(encoding, 4);
  }
}

Object.assign(UnicodeHelperHelpersMap, {
  UnicodeHelperMultiByteFixed,
  UnicodeHelperSinglebyte,
  UnicodeHelperUtf8,
  UnicodeHelperUtf16Base,
  UnicodeHelperUtf16Le,
  UnicodeHelperUtf16Be,
  UnicodeHelperUtf32Base,
  UnicodeHelperUtf32Le,
  UnicodeHelperUtf32Be,
  UnicodeHelperUcs2Le,
  UnicodeHelperUcs2Be,
  UnicodeHelperUcs4Le,
  UnicodeHelperUcs4Be,
});

export { UnicodeHelper };
