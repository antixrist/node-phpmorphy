import _ from 'lodash';
import { php, castArray } from '~/utils';
import { Fsa } from '~/lib/fsa/fsa';

class FsaSparseMem extends Fsa {
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
    const c = wordBuf.length;
    for (; i < c; i++) {
      prev_trans = trans;
      char = php.strings.ord(wordBuf, i);

      // ///////////////////////////////
      // find char in state begin
      // sparse version
      result = true;
      buf = php.strings.substr(mem, fsa_start + ((((trans >> 10) & 0x3fffff) + char + 1) << 2), 4);
      trans = php.unpack('V', buf)[0];

      if (trans & 0x0200 || (trans & 0xff) != char) {
        result = false;
      }
      // find char in state end
      // ///////////////////////////////

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
        buf = php.strings.substr(mem, fsa_start + (((trans >> 10) & 0x3fffff) << 2), 4);
        trans = php.unpack('V', buf)[0];

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
      word_trans: prev_trans,
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

    state = this.readState((startNode >> 10) & 0x3fffff);

    do {
      let i = start_idx;
      const c = _.size(state);
      for (; i < c; i++) {
        trans = state[i];

        if (trans & 0x0100) {
          total++;

          if (readAnnot) {
            annot = this.getAnnot(trans);
          } else {
            annot = trans;
          }

          // if (!php.funchand.call_user_func(callback, path, annot)) {
          if (!php.funchand.call_user_func(callback, null, annot)) {
            return total;
          }
        } else {
          // path += php.strings.chr((trans & 0xFF));
          stack.push(state);
          stack_idx.push(i + 1);
          state = this.readState((trans >> 10) & 0x3fffff);
          start_idx = 0;

          break;
        }
      }

      if (i >= c) {
        state = stack.pop();
        start_idx = stack_idx.pop();
        // path      = php.strings.substr(Buffer.from(path), 0, -1).toString();
      }
    } while (stack.length);

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
    buf = php.strings.substr(mem, start_offset, 4);
    trans = php.unpack('V', buf)[0];

    if (trans & 0x0100) {
      result.push(trans);
    }

    // read rest
    start_offset += 4;
    _.forEach(this.getAlphabetNum(), char => {
      buf = php.strings.substr(mem, start_offset + (char << 2), 4);
      trans = php.unpack('V', buf)[0];

      // if(!(trans & 0x0200) && (trans & 0xFF) == char) {
      // TODO: check term and empty flags at once i.e. trans & 0x0300
      if (!(trans & 0x0200 || trans & 0x0100) && (trans & 0xff) == char) {
        result.push(trans);
      }
    });

    return result;
  }

  unpackTranses(rawTranses) {
    rawTranses = castArray(rawTranses);
    const result = [];

    _.forEach(rawTranses, rawTrans => {
      result.push({
        term: !!(rawTrans & 0x0100),
        empty: !!(rawTrans & 0x0200),
        attr: rawTrans & 0xff,
        dest: (rawTrans >> 10) & 0x3fffff,
      });
    });

    return result;
  }

  readRootTrans() {
    const mem = this.resource;
    const fsa_start = this.fsa_start;

    let buf;
    let trans;

    buf = php.strings.substr(mem, fsa_start + 4, 4);
    trans = php.unpack('V', buf)[0];

    return trans;
  }

  readAlphabet() {
    const mem = this.resource;
    const buf = php.strings.substr(mem, this.header.alphabet_offset, this.header.alphabet_size);

    return buf.toString();
  }

  getAnnot(trans) {
    if (!(trans & 0x0100)) {
      return null;
    }

    const mem = this.resource;
    const offset = this.header.annot_offset + (((trans & 0xff) << 22) | ((trans >> 10) & 0x3fffff));

    let annot;
    let buf = php.strings.substr(mem, offset, 1);
    const len = php.strings.ord(buf);

    if (len) {
      buf = php.strings.substr(mem, offset + 1, len);
      annot = buf;
    } else {
      annot = null;
    }

    return annot;
  }

  getAlphabetNum() {
    if (!php.var.isset(this.alphabet_num)) {
      this.alphabet_num = php.array.array_map(php.strings.ord, this.getAlphabet());
    }

    return this.alphabet_num;
  }
}

export { FsaSparseMem };
