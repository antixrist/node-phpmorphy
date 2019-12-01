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
import { php, toBuffer, castArray, isStringifyedNumber } from '~/utils';
import { UnicodeHelper } from './unicode';
import { FsaWordsCollector } from './fsa/fsa';

// ----------------------------
// Morphier interface
// ----------------------------
class MorphierInterface {
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

class MorphierEmpty extends MorphierInterface {
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
class AnnotDecoderInterface {
  decode(annotsRaw, withBase) {}
}

class AnnotDecoderBase extends AnnotDecoderInterface {
  static get INVALID_ANCODE_ID() {
    return 0xffff;
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
    if (php.var.empty(annotRawBuf)) {
      throw new Error('Empty annot given');
    }

    const annotRaw = annotRawBuf.toString();
    const blockSize = this.block_size;
    const unpackStr = this.unpack_str;
    let result = php.unpack(`Vcount/${unpackStr}`, annotRawBuf);
    let res;
    let items;
    let start;

    if (result === false) {
      throw new Error(`Invalid annot string '${annotRaw}'`);
    }

    if (result.common_ancode === AnnotDecoderBase.INVALID_ANCODE_ID) {
      result.common_ancode = null;
    }

    const { count } = result;
    result = [result];

    if (count > 1) {
      for (let i = 0; i < count - 1; i++) {
        start = 4 + (i + 1) * blockSize;
        res = php.unpack(unpackStr, annotRawBuf.slice(start, start + blockSize));

        if (res.common_ancode === AnnotDecoderBase.INVALID_ANCODE_ID) {
          res.common_ancode = null;
        }

        result.push(res);
      }
    }

    if (withBase) {
      start = 4 + count * blockSize;
      items = annotRawBuf
        .slice(start)
        .toString()
        .split(this.ends.toString());
      for (let i = 0; i < count; i++) {
        result[i].base_prefix = items[i * 2];
        result[i].base_suffix = items[i * 2 + 1];
      }
    }

    return result;
  }
}

class AnnotDecoderCommon extends AnnotDecoderBase {
  getUnpackString() {
    return [
      'Voffset',
      'vcplen',
      'vplen',
      'vflen',
      'vcommon_ancode',
      'vforms_count',
      'vpacked_forms_count',
      'vaffixes_size',
      'vform_no',
      'vpos_id',
    ].join('/');
  }

  getUnpackBlockSize() {
    return 22;
  }
}

class AnnotDecoderPredict extends AnnotDecoderCommon {
  getUnpackString() {
    return [super.getUnpackString(), 'vfreq'].join('/');
  }

  getUnpackBlockSize() {
    return super.getUnpackBlockSize() + 2;
  }
}

const AnnotDecoderFactoryInstances = {};
class AnnotDecoderFactory {
  static get instances() {
    return AnnotDecoderFactoryInstances;
  }

  static get AnnotDecoders() {
    return {
      AnnotDecoderCommon,
      AnnotDecoderPredict,
    };
  }

  static create(eos) {
    const { instances } = AnnotDecoderFactory;
    if (!php.var.isset(instances[eos])) {
      instances[eos] = new AnnotDecoderFactory(eos);
    }

    return instances[eos];
  }

  constructor(eos) {
    this.eos = eos;
  }

  getCommonDecoder() {
    if (!php.var.isset(this.cache_common)) {
      this.cache_common = this.instantinate('common');
    }

    return this.cache_common;
  }

  getPredictDecoder() {
    if (!php.var.isset(this.cache_predict)) {
      this.cache_predict = this.instantinate('predict');
    }

    return this.cache_predict;
  }

  instantinate(type) {
    const className = `AnnotDecoder${_.upperFirst(type.toLowerCase())}`;

    return new AnnotDecoderFactory.AnnotDecoders[className](this.eos);
  }
}

class AncodesResolverInterface {
  resolve(ancodeId) {}

  unresolve(ancode) {}
}

class AncodesResolverToText extends AncodesResolverInterface {
  /**
   * @param {GramTabInterface} gramtab
   * @private
   */
  constructor(gramtab) {
    super();
    this.gramtab = gramtab;
  }

  resolve(ancodeId) {
    if (!php.var.isset(ancodeId)) {
      return null;
    }

    return this.gramtab.ancodeToString(ancodeId);
  }

  unresolve(ancode) {
    return this.gramtab.stringToAncode(ancode);
  }
}

class AncodesResolverToDialingAncodes extends AncodesResolverInterface {
  /**
   * @param {Storage} ancodesMap
   */
  constructor(ancodesMap) {
    super();
    this.ancodes_map = php.var.unserialize(ancodesMap.read(0, ancodesMap.getFileSize()).toString());
    if (this.ancodes_map === false) {
      throw new Error('Can`t open phpMorphy => Dialing ancodes map');
    }

    this.reverse_map = php.array.array_flip(this.ancodes_map);
  }

  unresolve(ancode) {
    if (!php.var.isset(ancode)) {
      return null;
    }

    if (!php.var.isset(this.reverse_map[ancode])) {
      throw new Error(`Unknown ancode found '${ancode}'`);
    }

    return this.reverse_map[ancode];
  }

  resolve(ancodeId) {
    if (!php.var.isset(ancodeId)) {
      return null;
    }

    if (!php.var.isset(this.ancodes_map[ancodeId])) {
      throw new Error(`Unknown ancode id found '${ancodeId}'`);
    }

    return this.ancodes_map[ancodeId];
  }
}

class AncodesResolverAsIs extends AncodesResolverInterface {
  resolve(ancodeId) {
    return ancodeId;
  }

  unresolve(ancode) {
    return ancode;
  }
}

class AncodesResolverProxy extends AncodesResolverInterface {
  static get AncodesResolvers() {
    return {
      AncodesResolverToText,
      AncodesResolverToDialingAncodes,
      AncodesResolverAsIs,
    };
  }

  static instantinate(className, args) {
    const { AncodesResolvers } = AncodesResolverProxy;

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
      this.___obj = AncodesResolverProxy.instantinate(this.className, this.args);

      delete this.args;
      delete this.className;
    }

    return this.___obj;
  }

  set __obj(value) {
    this.___obj = !_.isUndefined(value) ? value : null;
  }
}

// ----------------------------
// WordDescriptor
// ----------------------------

/**
 * @class
 * @augments Array
 */
class WordDescriptorCollection extends Array {
  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes#Species
  static get [Symbol.species]() {
    return Array;
  }

  /**
   * @param {*} word
   * @param {*} annots
   * @param {MorphierHelper} helper
   */
  constructor(word, annots, helper) {
    super();

    this.word = `${word || ''}`;
    this.annots = annots === false ? false : helper.decodeAnnot(annots, true);
    this.helper = helper;

    if (this.annots !== false) {
      _.forEach(this.annots, annot => this.push(this.createDescriptor(word, annot, helper)));
    }
  }

  /**
   * @param {*} word
   * @param {*} annot
   * @param {MorphierHelper} helper
   */
  createDescriptor(word, annot, helper) {
    return new WordDescriptor(word, annot, helper);
  }

  getByPartOfSpeech(poses) {
    poses = castArray(poses);
    const result = [];

    _.forEach(this, desc => {
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
class MorphierHelper {
  /**
   * @param {GramInfoInterface} graminfo
   * @param {GramTabInterface} gramtab
   * @param {AncodesResolverInterface} ancodesResolver
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
   * @param {AnnotDecoderInterface} annotDecoder
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
    return php.var.isset(this.annot_decoder);
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
      return this.resolvePartOfSpeech(annot.pos_id);
    }

    return annot.pos_id;
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

    return new WordDescriptorCollection(word, annots, this);
  }

  getBaseAndPrefix(word, cplen, plen, flen) {
    const wordBuf = Buffer.from(word);
    let base;
    let prefix;

    if (flen) {
      base = php.strings.substr(wordBuf, cplen + plen, -flen);
    } else if (cplen || plen) {
      base = php.strings.substr(wordBuf, cplen + plen);
    } else {
      base = wordBuf;
    }

    prefix = cplen ? php.strings.substr(wordBuf, 0, cplen) : '';
    base = base.toString();
    prefix = prefix.toString();

    return [base, prefix];
  }

  getPartOfSpeech(word, annots) {
    if (annots === false) return false;

    let result = {};
    _.forEach(this.decodeAnnot(annots, false), annot => (result[this.extractPartOfSpeech(annot)] = 1));
    result = _.keys(result);
    result = this.resolve_pos ? result : result.map(_.toInteger);

    return result;
  }

  getBaseForm(word, annots) {
    if (annots === false) return false;

    annots = this.decodeAnnot(annots, true);

    return this.composeBaseForms(word, annots);
  }

  getPseudoRoot(word, annots) {
    if (annots === false) return false;

    const result = {};
    annots = this.decodeAnnot(annots, false);
    _.forEach(annots, annot => {
      const base = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen)[0];

      result[base] = 1;
    });

    return php.array.array_keys(result);
  }

  getAllForms(word, annots) {
    if (annots === false) return false;

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
    if (annots === false) return false;

    /**
     * @todo: вот сюда данные приходят правильные (как в php),
     * а выходят не правильные (не как в php)
     */

    grammems = _.toArray(grammems);
    partOfSpeech = php.var.isset(partOfSpeech) ? `${partOfSpeech}` : null;

    /**
     * Проверено:
     * grammems
     * partOfSpeech
     * this.decodeAnnot(annots, false)
     */
    const result = returnWords ? {} : [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const allAncodes = this.graminfo.readAncodes(annot);
      const flexias = this.graminfo.readFlexiaData(annot);
      const commonAncode = annot.common_ancode;
      const commonGrammems = php.var.isset(commonAncode) ? this.gramtab.getGrammems(commonAncode) : [];
      const [base, prefix] = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen);
      let formNo = 0;
      let i = 0;

      /**
       * Проверено:
       * allAncodes
       * flexias
       * commonAncode
       * commonGrammems
       * base
       * prefix
       */

      _.forEach(allAncodes, formAncodes => {
        _.forEach(formAncodes, ancode => {
          const formPos = this.gramtab.getPartOfSpeech(ancode);
          const formGrammems = php.array.array_merge(this.gramtab.getGrammems(ancode), commonGrammems);
          const form = [prefix, flexias[i], base, flexias[i + 1]].join('');

          if (_.isFunction(callback)) {
            if (!callback(form, formPos, formGrammems, formNo)) {
              formNo += 1;
              return;
            }
          } else {
            if (php.var.isset(partOfSpeech) && formPos !== partOfSpeech) {
              formNo += 1;
              return;
            }

            if (_.size(php.array.array_diff(grammems, formGrammems)) > 0) {
              formNo += 1;
              return;
            }
          }

          if (returnWords) {
            result[form] = 1;
          } else {
            result.push({
              form,
              form_no: formNo,
              pos: formPos,
              grammems: formGrammems,
            });
          }

          formNo += 1;
        });

        i += 2;
      });
    });

    return returnWords ? php.array.array_keys(result) : result;
  }

  getAncode(annots) {
    if (annots === false) return false;

    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const allAncodes = this.graminfo.readAncodes(annot);

      result.push({
        common: this.ancodes_resolver.resolve(annot.common_ancode),
        all: php.array.array_map([this.ancodes_resolver, 'resolve'], allAncodes[annot.form_no]),
      });
    });

    return _.uniqWith(result, _.isEqual);
  }

  getGrammarInfoMergeForms(annots) {
    if (annots === false) return false;

    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const allAncodes = this.graminfo.readAncodes(annot);
      const commonAncode = annot.common_ancode;
      const formNo = annot.form_no;
      let grammems = php.var.isset(commonAncode) ? this.gramtab.getGrammems(commonAncode) : [];
      let formsCount = 0;

      let ancodeId;
      _.forEach(allAncodes[formNo], ancode => {
        ancodeId = ancode;

        grammems = php.array.array_merge(grammems, this.gramtab.getGrammems(ancode));
        formsCount += 1;
      });

      grammems = _.sortedUniq(_.sortBy(grammems, this.resolve_pos ? JSON.stringify : _.toInteger));

      result.push({
        // todo: незарезолвенный ancodeId
        // part of speech identical across all joined forms
        pos: this.gramtab.getPartOfSpeech(ancodeId),
        grammems,
        forms_count: formsCount,
        form_no_low: formNo,
        form_no_high: formNo + formsCount,
      });
    });

    return _.uniqWith(result, _.isEqual);
  }

  getGrammarInfo(annots) {
    if (annots === false) return false;

    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const allAncodes = this.graminfo.readAncodes(annot);
      const commonAncode = annot.common_ancode;
      const commonGrammems = php.var.isset(commonAncode) ? this.gramtab.getGrammems(commonAncode) : [];
      const info = [];
      const formNo = annot.form_no;

      _.forEach(allAncodes[formNo], ancode => {
        let grammems = php.array.array_merge(commonGrammems, this.gramtab.getGrammems(ancode));
        grammems = _.sortBy(grammems, this.resolve_pos ? JSON.stringify : _.toInteger);

        const infoItem = {
          pos: this.gramtab.getPartOfSpeech(ancode),
          grammems,
          form_no: formNo,
        };

        info.push(infoItem);
      });

      const uniqueInfo = _.sortedUniq(_.sortBy(info, JSON.stringify));

      result.push(uniqueInfo);
    });

    return _.uniqWith(result, _.isEqual);
  }

  /**
   * @param word
   * @param annots
   * @param {string} [resolveType='no_resolve']
   * @returns {boolean}
   */
  getAllFormsWithResolvedAncodes(word, annots, resolveType = 'no_resolve') {
    if (annots === false) return false;

    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithResolvedAncodes(word, annots);
  }

  getAllFormsWithAncodes(word, annots, foundFormNo) {
    if (annots === false) return false;

    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithAncodes(word, annots);
  }

  getAllAncodes(word, annots) {
    if (annots === false) return false;

    const result = [];

    _.forEach(annots, annot => result.push(this.graminfo.readAncodes(annot)));

    return result;
  }

  composeBaseForms(word, annots) {
    const result = {};

    _.forEach(annots, annot => {
      if (annot.form_no > 0) {
        const baseAndPrefix = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen);
        const base = baseAndPrefix[0];
        const prefix = baseAndPrefix[1];
        const form = [prefix, annot.base_prefix, base, annot.base_suffix].join('');

        result[form] = 1;
      } else {
        result[word] = 1;
      }
    });

    return php.array.array_keys(result);
  }

  composeForms(word, annots) {
    const result = {};

    _.forEach(annots, annot => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);

      let form;
      for (let i = 0, c = _.size(flexias); i < c; i += 2) {
        form = [prefix, flexias[i], base, flexias[i + 1]].join('');
        result[form] = 1;
      }
    });

    return php.array.array_keys(result);
  }

  composeFormsWithResolvedAncodes(word, annots) {
    const result = [];

    _.forEach(annots, (annot, annotIdx) => {
      const words = [];
      const ancodes = [];
      const commonAncode = annot.common_ancode;
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const allAncodes = this.graminfo.readAncodes(annot);
      const baseAndPrefix = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];

      let form;
      let currentAncodes;

      for (let i = 0, c = _.size(flexias); i < c; i += 2) {
        form = [prefix, flexias[i], base, flexias[i + 1]].join('');
        currentAncodes = allAncodes[i / 2];

        _.forEach(currentAncodes, ancode => {
          words.push(form);
          ancodes.push(this.ancodes_resolver.resolve(ancode));
        });
      }

      result.push({
        all: ancodes,
        forms: words,
        common: this.ancodes_resolver.resolve(commonAncode),
      });
    });

    return result;
  }

  composeFormsWithAncodes(word, annots, foundFormNo) {
    const result = [];

    _.forEach(annots, (annot, annotIdx) => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot.cplen, annot.plen, annot.flen);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const ancodes = this.graminfo.readAncodes(annot);
      const annotFormNo = annot.form_no;

      let count;
      let formNo;

      foundFormNo = !_.isArray(foundFormNo) ? [] : [...foundFormNo];

      for (let i = 0, c = _.size(flexias); i < c; i += 2) {
        formNo = i / 2;
        word = [prefix, flexias[i], base, flexias[i + 1]].join('');

        if (annotFormNo === formNo) {
          foundFormNo[annotIdx] = _.isPlainObject(foundFormNo[annotIdx]) ? foundFormNo[annotIdx] : {};
          count = _.size(result);
          foundFormNo[annotIdx].low = count;
          foundFormNo[annotIdx].high = count + _.size(ancodes[formNo]) - 1;
        }

        _.forEach(ancodes[formNo], ancode => result.push([word, ancode]));
      }
    });

    return {
      foundFormNo,
      forms: result,
    };
  }

  decodeAnnot(annotsRaw, withBase) {
    if (php.var.is_array(annotsRaw)) {
      return annotsRaw;
    }

    return this.annot_decoder.decode(annotsRaw, withBase);
  }
}

class WordForm {
  static compareGrammems(a, b) {
    return _.size(a) === _.size(b) && _.size(php.array.array_diff(a, b)) === 0;
  }

  constructor(word, formNo, posId, grammems) {
    grammems = _.values(grammems);

    this.word = `${word}`;
    this.form_no = parseInt(formNo, 10);
    this.pos_id = posId;
    this.grammems =
      grammems.length > 0 ? _.sortBy(grammems, _.isNumber(grammems[0]) ? _.toInteger : JSON.stringify) : grammems;
  }

  getPartOfSpeech() {
    return this.pos_id;
  }

  getGrammems() {
    return this.grammems;
  }

  hasGrammems(grammems) {
    grammems = !_.isArray(grammems) ? [grammems] : grammems;
    const grammesCount = _.size(grammems);

    return grammesCount && _.size(php.array.array_intersect(grammems, this.grammems)) === grammesCount;
  }

  getWord() {
    return this.word;
  }

  getFormNo() {
    return this.form_no;
  }
}

class WordDescriptor extends Array {
  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes#Species
  static get [Symbol.species]() {
    return Array;
  }

  /**
   * @param word
   * @param annot
   * @param {MorphierHelper} helper
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
    if (!php.var.isset(this.cached_pseudo_root)) {
      this.cached_pseudo_root = this.helper.getPseudoRoot(this.word, this.annot)[0];
    }

    return this.cached_pseudo_root;
  }

  getBaseForm() {
    if (!php.var.isset(this.cached_base)) {
      this.cached_base = this.helper.getBaseForm(this.word, this.annot)[0];
    }

    return this.cached_base;
  }

  getAllForms() {
    if (!php.var.isset(this.cached_forms)) {
      this.cached_forms = this.helper.getAllForms(this.word, this.annot);
    }

    return this.cached_forms;
  }

  getWordForm(index) {
    this.readAllForms();

    return this.slice(index, index + 1)[0];
  }

  createWordForm(word, formNo, ancode) {
    if (!php.var.isset(this.common_ancode_grammems)) {
      const { common_ancode } = this.annot[0];

      this.common_ancode_grammems = php.var.isset(common_ancode) ? this.helper.getGrammems(common_ancode) : {};
    }

    const grammemsAndPartOfSpeech = this.helper.getGrammemsAndPartOfSpeech(ancode);
    const posId = grammemsAndPartOfSpeech[0];
    const allGrammems = grammemsAndPartOfSpeech[1];

    return new WordForm(word, formNo, posId, php.array.array_merge(this.common_ancode_grammems, allGrammems));
  }

  readAllForms() {
    const forms = [];
    let formNo = 0;
    let formsWithAncodes;

    if (!this.all_forms_readed) {
      formsWithAncodes = this.helper.getAllFormsWithAncodes(this.word, this.annot);

      _.forEach(formsWithAncodes.forms, form => {
        forms.push(this.createWordForm(form[0], formNo, form[1]));
        formNo += 1;
      });

      this.found_form_no = formsWithAncodes.foundFormNo[0];

      this.splice(0, this.length);
      _.forEach(forms, form => this.push(form));

      this.all_forms_readed = true;
    }

    return this;
  }

  getFoundFormNoLow() {
    this.readAllForms();

    return this.found_form_no.low;
  }

  getFoundFormNoHigh() {
    this.readAllForms();

    return this.found_form_no.high;
  }

  getFoundWordForm() {
    const result = [];
    for (let i = this.getFoundFormNoLow(), c = this.getFoundFormNoHigh() + 1; i < c; i++) {
      result.push(this.getWordForm(i));
    }

    return result;
  }

  hasGrammems(grammems) {
    grammems = castArray(grammems);

    return _.some(this, wf => wf.hasGrammems(grammems));
  }

  getWordFormsByGrammems(grammems) {
    grammems = castArray(grammems);
    const result = [];

    _.forEach(this, wf => {
      if (wf.hasGrammems(grammems)) {
        result.push(wf);
      }
    });

    return result;
    // return count(result) ? result : false;
  }

  hasPartOfSpeech(poses) {
    poses = castArray(poses);

    return _.some(this, wf => {
      return poses.includes(wf.getPartOfSpeech());
      // return poses.includes(wf.getPartOfSpeech());
    });
  }

  getWordFormsByPartOfSpeech(poses) {
    poses = castArray(poses);
    const result = [];

    _.forEach(this, wf => {
      if (poses.includes(wf.getPartOfSpeech())) {
        // if (poses.includes(wf.getPartOfSpeech())) {
        result.push(wf);
      }
    });

    return result;
    // return count(result) ? result : false;
  }
}

// ----------------------------
// Finders
// ----------------------------
class MorphierFinderInterface {
  findWord(word) {}

  decodeAnnot(raw, withBase) {}

  getAnnotDecoder() {}
}

class MorphierFinderBase extends MorphierFinderInterface {
  /**
   * @param {AnnotDecoderInterface} annotDecoder
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

class MorphierFinderCommon extends MorphierFinderBase {
  /**
   * @param {FsaInterface} fsa
   * @param {AnnotDecoderInterface} annotDecoder
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

    if (!result.result || result.annot === null) {
      return false;
    }

    return result.annot;
  }
}

class MorphierFinderPredictSuffix extends MorphierFinderCommon {
  /**
   * @param {FsaInterface} fsa
   * @param {AnnotDecoderInterface} annotDecoder
   * @param {string} encoding
   * @param {number} [minimalSuffixLength=4]
   */
  constructor(fsa, annotDecoder, encoding, minimalSuffixLength = 4) {
    super(fsa, annotDecoder);

    this.min_suf_len = minimalSuffixLength;
    this.unicode = UnicodeHelper.create(encoding);
  }

  doFindWord(word) {
    const wordLen = this.unicode.strlen(word);
    let result;

    if (!wordLen) {
      return false;
    }

    let i = 1;
    const c = wordLen - this.min_suf_len;
    for (; i < c; i++) {
      word = php.strings.substr(word, this.unicode.firstCharSize(word));
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
    _.forEach(annots, annot => (annot.cplen = len));

    return annots;
  }
}

class MorphierPredictCollector extends FsaWordsCollector {
  /**
   * @param {*} limit
   * @param {AnnotDecoderInterface} annotDecoder
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
    let posId;
    let resultIdx;
    let nextItemsIndex;
    let itemsSize;

    _.forEach(annots, annot => {
      annot.cplen = annot.plen = 0;
      posId = annot.pos_id;

      if (php.var.isset(this.used_poses[posId])) {
        resultIdx = this.used_poses[posId];

        if (annot.freq > this.items[resultIdx].freq) {
          this.items[resultIdx] = annot;
        }
      } else {
        itemsSize = _.size(this.items);
        this.used_poses[posId] = itemsSize;
        // оригинал:
        // $this->items[] = annot;
        nextItemsIndex = itemsSize ? _.max(_.keys(this.items)) : -1;

        this.items[parseInt(nextItemsIndex, 10) + 1] = annot;
      }
    });

    this.collected += 1;

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

class MorphierFinderPredictDatabase extends MorphierFinderCommon {
  /**
   * @param {FsaInterface} fsa
   * @param {AnnotDecoderInterface} annotDecoder
   * @param {string} encoding
   * @param {GramInfoInterface} graminfo
   * @param {number} [minPostfixMatch=2]
   * @param {number} [collectLimit=32]
   */
  constructor(fsa, annotDecoder, encoding, graminfo, minPostfixMatch = 2, collectLimit = 32) {
    super(fsa, annotDecoder);

    this.graminfo = graminfo;
    this.min_postfix_match = minPostfixMatch;
    this.collector = this.createCollector(collectLimit, this.getAnnotDecoder());
    this.unicode = UnicodeHelper.create(encoding);
  }

  createAnnotDecoder() {
    // todo: какая-то херня
    // return phpmorphy_annot_decoder_new('predict');
    return AnnotDecoderFactory.create('predict');
  }

  doFindWord(word) {
    word = toBuffer(word);

    const revWord = this.unicode.strrev(word);
    const result = this.fsa.walk(this.root, revWord);
    let annots;
    let matchLen;

    if (result.result && result.annot !== null) {
      annots = result.annot;
    } else {
      matchLen = this.unicode.strlen(this.unicode.fixTrailing(revWord.slice(0, result.walked)));
      annots = this.determineAnnots(result.last_trans, matchLen);

      if (annots === null) {
        return false;
      }
    }

    if (!php.var.is_array(annots)) {
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
    word = toBuffer(word);

    const result = [];
    let flexias;
    let prefix;
    let suffix;
    let plen;
    let slen;

    // remove all prefixes?
    _.forEach(annots, annot => {
      annot.cplen = annot.plen = 0;
      flexias = this.graminfo.readFlexiaData(annot, false);
      prefix = Buffer.from(flexias[annot.form_no * 2]);
      suffix = Buffer.from(flexias[annot.form_no * 2 + 1]);

      plen = prefix.length;
      slen = suffix.length;

      const partOfWordInPlaceOfPrefix = php.strings.substr(word, 0, plen);
      const partOfWordInPlaceOfSuffix = php.strings.substr(word, -slen);

      if (
        (!plen || (partOfWordInPlaceOfPrefix && partOfWordInPlaceOfPrefix.equals(prefix))) &&
        (!slen || (partOfWordInPlaceOfSuffix && partOfWordInPlaceOfSuffix.equals(suffix)))
      ) {
        result.push(annot);
      }
    });

    return _.size(result) ? result : false;
  }

  createCollector(limit) {
    return new MorphierPredictCollector(limit, this.getAnnotDecoder());
  }
}

// ----------------------------
// Morphiers
// ----------------------------
class MorphierBase extends MorphierInterface {
  /**
   * @param {MorphierFinderInterface} finder
   * @param {MorphierHelper} helper
   */
  constructor(finder, helper) {
    super();
    this.finder = finder;
    this.helper = _.cloneDeep(helper);
    this.helper.setAnnotDecoder(finder.getAnnotDecoder());
  }

  /**
   * @return MorphierFinderInterface
   */
  getFinder() {
    return this.finder;
  }

  /**
   * @return MorphierHelper
   */
  getHelper() {
    return this.helper;
  }

  getAnnot(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.decodeAnnot(annots, true);
  }

  getWordDescriptor(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getWordDescriptor(word, annots);
  }

  getAllFormsWithAncodes(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getAllFormsWithResolvedAncodes(word, annots);
  }

  getPartOfSpeech(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getPartOfSpeech(word, annots);
  }

  getBaseForm(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

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
    if (!annots) return false;

    return this.helper.getAllForms(word, annots);
  }

  getAncode(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getAncode(annots);
  }

  getGrammarInfo(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getGrammarInfo(annots);
  }

  getGrammarInfoMergeForms(word) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.getGrammarInfoMergeForms(annots);
  }

  /**
   * @param word
   * @param partOfSpeech
   * @param grammems
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @returns {array|boolean}
   */
  castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null) {
    const annots = this.finder.findWord(word);
    if (!annots) return false;

    return this.helper.castFormByGramInfo(word, annots);
  }

  /**
   * @param word
   * @param patternWord
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @returns {array|boolean}
   */
  castFormByPattern(word, patternWord, returnOnlyWord = false, callback = null) {
    const origAnnots = this.finder.findWord(word);
    if (!origAnnots) return false;

    const patternAnnots = this.finder.findWord(patternWord);
    if (!patternAnnots) return false;

    return this.helper.castFormByPattern(word, origAnnots, patternWord, patternAnnots, returnOnlyWord, callback);
  }
}

class MorphierCommon extends MorphierBase {
  /**
   * @param {MorphierHelper} helper
   * @returns {AnnotDecoderInterface}
   */
  static createAnnotDecoder(helper) {
    return AnnotDecoderFactory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  constructor(fsa, helper) {
    super(new MorphierFinderCommon(fsa, MorphierCommon.createAnnotDecoder(helper)), helper);
  }
}

class MorphierPredictSuffix extends MorphierBase {
  /**
   * @param {MorphierHelper} helper
   * @returns {AnnotDecoderInterface}
   */
  static createAnnotDecoder(helper) {
    return AnnotDecoderFactory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  constructor(fsa, helper) {
    super(
      new MorphierFinderPredictSuffix(
        fsa,
        MorphierPredictSuffix.createAnnotDecoder(helper),
        helper.getGramInfo().getEncoding(),
        4,
      ),
      helper,
    );
  }
}

class MorphierPredictDatabase extends MorphierBase {
  /**
   * @param {MorphierHelper} helper
   * @returns {AnnotDecoderInterface}
   */
  static createAnnotDecoder(helper) {
    return AnnotDecoderFactory.create(helper.getGramInfo().getEnds()).getPredictDecoder();
  }

  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  constructor(fsa, helper) {
    super(
      new MorphierFinderPredictDatabase(
        fsa,
        MorphierPredictDatabase.createAnnotDecoder(helper),
        helper.getGramInfo().getEncoding(),
        helper.getGramInfo(),
        2,
        32,
      ),
      helper,
    );
  }
}

class MorphierBulk extends MorphierInterface {
  /**
   * @param {FsaInterface} fsa
   * @param {MorphierHelper} helper
   */
  constructor(fsa, helper) {
    super();

    this.fsa = fsa;
    this.root_trans = fsa.getRootTrans();
    this.helper = _.cloneDeep(helper);
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
   * @param {MorphierHelper} helper
   * @returns {*}
   */
  createAnnotDecoder(helper) {
    return new AnnotDecoderCommon(helper.getGramInfo().getEnds());
  }

  getAnnot(word) {
    const result = {};

    _.forEach(this.findWord(word), item => {
      const words = item.data;
      let annot = item.annots;
      annot = this.helper.decodeAnnot(annot, true);

      _.forEach(words, word => {
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

    _.forEach(this.findWord(words), item => {
      words = item.data;
      const annotRaw = item.annots;

      if (annotRaw.length === 0) return;

      if (callWithWord) {
        _.forEach(words, word => (result[word] = this.helper[method](word, annotRaw)));
      } else {
        const resultForAnnot = this.helper[method](annotRaw);
        _.forEach(words, word => (result[word] = resultForAnnot));
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
    let isFinal;
    let stackIdx = 0;

    // TODO: Improve this
    while (stackIdx >= 0) {
      n = stack[stackIdx];
      path = Buffer.concat([Buffer.from(stack[stackIdx + 1]), labels[n]]);
      trans = stack[stackIdx + 2];
      stackIdx -= 3; // TODO: Remove items from stack? (performance!!!)

      isFinal = finals[n] > 0;
      // isFinal = dests[n] === false;

      result = false;
      if (trans !== false && n > 0) {
        label = labels[n];
        result = fsa.walk(trans, label, isFinal);

        if (label.length === result.walked) {
          trans = result.word_trans;
        } else {
          trans = false;
        }
      }

      if (isFinal) {
        if (trans !== false && php.var.isset(result.annot)) {
          annots[result.annot] = annots[result.annot] || {
            annots: result.annot,
            data: [],
          };
          annots[result.annot].data.push(path);
        } else {
          this.notfound.push(path);
        }
      }

      if (dests[n] !== false) {
        _.forEach(dests[n], dest => {
          stackIdx += 3;
          stack[stackIdx] = dest;
          stack[stackIdx + 1] = path;
          stack[stackIdx + 2] = trans;
        });
      }
    }

    return annots;
  }

  composeForms(annotsRaw, onlyBase, pseudoRoot, partOfSpeech) {
    const result = {};
    let annotRaw;

    // process found annotations
    _.forEach(annotsRaw, item => {
      const words = item.data;
      annotRaw = item.annots;

      if (annotRaw.length === 0) return;

      _.forEach(this.helper.decodeAnnot(annotRaw, onlyBase), annot => {
        let flexias;
        let posId;

        if (!(onlyBase || pseudoRoot)) {
          flexias = this.graminfo.readFlexiaData(annot);
        }

        const cplen = annot.cplen;
        const plen = annot.plen;
        const flen = annot.flen;

        if (partOfSpeech) {
          posId = this.helper.extractPartOfSpeech(annot);
        }

        _.forEach(words, word => {
          let base;
          let form;

          if (flen) {
            base = php.strings.substr(word, cplen + plen, -flen);
          } else if (cplen || plen) {
            base = php.strings.substr(word, cplen + plen);
          } else {
            base = word;
          }

          const prefix = cplen ? php.strings.substr(word, 0, cplen) : '';
          result[word] = result[word] || {};

          if (pseudoRoot) {
            result[word][base] = 1;
          } else if (onlyBase) {
            form = [prefix, annot.base_prefix, base, annot.base_suffix].join('');
            result[word][form] = 1;
          } else if (partOfSpeech) {
            result[word][posId] = 1;
          } else {
            for (let i = 0, c = _.size(flexias); i < c; i += 2) {
              form = [prefix, flexias[i], base, flexias[i + 1]].join('');
              result[word][form] = 1;
            }
          }
        });
      });
    });

    _.keys(result).forEach(key => {
      result[key] = _.keys(result[key]);

      if (result[key].length > 0 && isStringifyedNumber(result[key][0])) {
        result[key] = result[key].map(_.toInteger);
      }
    });

    return result;
  }

  buildPatriciaTrie(words) {
    if (!php.var.is_array(words)) {
      throw new Error('Words must be array');
    }

    // words = php.array.sort(words);
    words = words.length > 0 && Buffer.isBuffer(words[0]) ? words.sort(Buffer.compare) : words.sort();

    let stack = [];
    let prevWordBuf = Buffer.alloc(0);
    let prevWordLen = 0;
    let prevLcp = 0;
    let node = 0;

    const stateLabels = [];
    const stateDests = [];
    const stateFinals = [0];

    stateLabels.push(Buffer.from(''));
    stateDests.push([]);

    _.forEach(words, word => {
      const wordBuf = Buffer.from(word, 'utf8');

      if (wordBuf.equals(prevWordBuf)) {
        return;
      }

      const wordLen = wordBuf.length;
      let newStateId;
      let needSplit;
      let trimSize;
      let nodeKey;
      let newNodeId1;
      let newNodeId2;
      let newNodeId;

      // find longest common prefix
      let lcp = 0;
      const c = Math.min(prevWordLen, wordLen);
      // for (; lcp < c && wordBuf[lcp] == prevWordBuf[lcp]; lcp++) {}
      while (lcp < c && wordBuf[lcp] === prevWordBuf[lcp]) {
        lcp += 1;
      }

      if (lcp === 0) {
        stack = [];
        newStateId = _.size(stateLabels);
        stateLabels.push(wordBuf);
        stateFinals.push(1);
        stateDests.push(false);
        stateDests[0].push(newStateId);
        node = newStateId;
      } else {
        needSplit = true;
        trimSize = 0; // for split

        if (lcp === prevLcp) {
          needSplit = false;
          node = stack[_.size(stack) - 1];
        } else if (lcp > prevLcp) {
          if (lcp === prevWordLen) {
            needSplit = false;
          } else {
            needSplit = true;
            trimSize = lcp - prevLcp;
          }

          stack.push(node);
        } else {
          trimSize = prevWordBuf.length - lcp;

          let stackSize = _.size(stack) - 1;
          for (; ; --stackSize) {
            trimSize -= stateLabels[node].length;

            if (trimSize <= 0) {
              break;
            }

            if (_.size(stack) < 1) {
              throw new Error('Infinite loop possible');
            }

            node = stack.pop();
          }

          needSplit = trimSize < 0;
          trimSize = Math.abs(trimSize);

          if (needSplit) {
            stack.push(node);
          } else {
            node = stack[stackSize];
          }
        }

        let nodeKeyBuf;

        if (needSplit) {
          nodeKey = stateLabels[node];
          nodeKeyBuf = Buffer.from(nodeKey);

          // split
          newNodeId1 = _.size(stateLabels);
          newNodeId2 = newNodeId1 + 1;

          // new_node_1
          stateLabels.push(php.strings.substr(nodeKeyBuf, trimSize));
          stateFinals.push(stateFinals[node]);
          stateDests.push(stateDests[node]);

          // adjust old node
          stateLabels[node] = php.strings.substr(nodeKeyBuf, 0, trimSize);
          stateFinals[node] = 0;
          stateDests[node] = [newNodeId1];

          // append new node, new_node_2
          stateLabels.push(php.strings.substr(wordBuf, lcp));
          stateFinals.push(1);
          stateDests.push(false);

          stateDests[node].push(newNodeId2);

          node = newNodeId2;
        } else {
          newNodeId = _.size(stateLabels);

          stateLabels.push(php.strings.substr(wordBuf, lcp));
          stateFinals.push(1);
          stateDests.push(false);

          if (stateDests[node] !== false) {
            stateDests[node].push(newNodeId);
          } else {
            stateDests[node] = [newNodeId];
          }

          node = newNodeId;
        }
      }

      prevWordLen = wordLen;
      prevWordBuf = wordBuf;
      prevLcp = lcp;
    });

    return [stateLabels, stateFinals.join(''), stateDests];
  }
}

export {
  MorphierInterface,
  MorphierEmpty,
  AnnotDecoderInterface,
  AnnotDecoderBase,
  AnnotDecoderCommon,
  AnnotDecoderPredict,
  AnnotDecoderFactory,
  AncodesResolverInterface,
  AncodesResolverToText,
  AncodesResolverToDialingAncodes,
  AncodesResolverAsIs,
  AncodesResolverProxy,
  WordDescriptorCollection,
  MorphierHelper,
  WordForm,
  WordDescriptor,
  MorphierFinderInterface,
  MorphierFinderBase,
  MorphierFinderCommon,
  MorphierFinderPredictSuffix,
  MorphierPredictCollector,
  MorphierFinderPredictDatabase,
  MorphierBase,
  MorphierCommon,
  MorphierPredictSuffix,
  MorphierPredictDatabase,
  MorphierBulk,
};
