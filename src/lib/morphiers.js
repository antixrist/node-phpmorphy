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
import { php, toBuffer, castArray, inspect, isStringifyedNumber } from '../utils';
import { Morphy_UnicodeHelper } from './unicode';
import { Morphy_Fsa_WordsCollector } from './fsa/fsa';

// ----------------------------
// Morphier interface
// ----------------------------
class Morphy_Morphier_Interface {

  getAnnot (word) {}

  getBaseForm (word) {}

  getAllForms (word) {}

  getPseudoRoot (word) {}

  getPartOfSpeech (word) {}

  getWordDescriptor (word) {}

  getAllFormsWithAncodes (word) {}
  
  getAncode (word) {}

  getGrammarInfoMergeForms (word) {}

  getGrammarInfo (word) {}

}

class Morphy_Morphier_Empty extends Morphy_Morphier_Interface {

  getAnnot (word) {
    return false;
  }

  getBaseForm (word) {
    return false;
  }

  getAllForms (word) {
    return false;
  }

  getAllFormsWithGramInfo (word) {
    return false;
  }

  getPseudoRoot (word) {
    return false;
  }

  getPartOfSpeech (word) {
    return false;
  }

  getWordDescriptor (word) {
    return false;
  }

  getAllFormsWithAncodes (word) {
    return false;
  }

  getAncode (word) {
    return false;
  }

  getGrammarInfoMergeForms (word) {
    return false;
  }

  getGrammarInfo (word) {
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
  castFormByGramInfo (word, partOfSpeech, grammems, returnWords, callback) {
    return false;
  }

}

// ----------------------------
// Annot decoder
// ----------------------------
class Morphy_AnnotDecoder_Interface {

  decode (annotsRaw, withBase) {}

}

class Morphy_AnnotDecoder_Base extends Morphy_AnnotDecoder_Interface {
  static get INVALID_ANCODE_ID () {
    return 0xFFFF;
  }

  constructor (ends) {
    super();
    this.ends = ends;

    this.unpack_str = this.getUnpackString();
    this.block_size = this.getUnpackBlockSize();
  }

  getUnpackString () {}

  getUnpackBlockSize () {}

  decode (annotRawBuf, withBase) {
    if (php.var.empty(annotRawBuf)) {
      throw new Error("Empty annot given");
    }
  
    const annotRaw = annotRawBuf.toString();
    const unpack_size = this.block_size;
    const unpack_str = this.unpack_str;
    let result = php.unpack('Vcount/' + unpack_str, annotRawBuf);
    let res;
    let count;
    let items;
    let start;

    if (result === false) {
      throw new Error(`Invalid annot string '${ annotRaw }'`);
    }

    if (result['common_ancode'] == Morphy_AnnotDecoder_Base.INVALID_ANCODE_ID) {
      result['common_ancode'] = null;
    }

    count = result['count'];
    result = [result];

    if (count > 1) {
      for (let i = 0; i < count - 1; i++) {
        start = 4 + (i + 1) * unpack_size;
        res = php.unpack(unpack_str, annotRawBuf.slice(start, start + unpack_size));

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

  constructor () {
    super(...arguments);
  }

  getUnpackString () {
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
      'vpos_id'
    ].join('/');
  }

  getUnpackBlockSize () {
    return 22;
  }

}

class Morphy_AnnotDecoder_Predict extends Morphy_AnnotDecoder_Common {

  constructor () {
    super(...arguments);
  }

  getUnpackString () {
    return [super.getUnpackString(), 'vfreq'].join('/');
  }

  getUnpackBlockSize () {
    return super.getUnpackBlockSize() + 2;
  }

}

const Morphy_AnnotDecoder_Factory_instances = {};
class Morphy_AnnotDecoder_Factory {
  
  static get instances () {
    return Morphy_AnnotDecoder_Factory_instances;
  }
  
  static get AnnotDecoders () {
    return {
      Morphy_AnnotDecoder_Common,
      Morphy_AnnotDecoder_Predict
    };
  }

  static create (eos) {
    const { instances } = Morphy_AnnotDecoder_Factory;
    if (!php.var.isset(instances[eos])) {
      instances[eos] = new Morphy_AnnotDecoder_Factory(eos);
    }

    return instances[eos];
  }

  constructor (eos) {
    this.eos = eos;
  }

  getCommonDecoder () {
    if (!php.var.isset(this.cache_common)) {
      this.cache_common = this.instantinate('common');
    }

    return this.cache_common;
  }

  getPredictDecoder () {
    if (!php.var.isset(this.cache_predict)) {
      this.cache_predict = this.instantinate('predict');
    }

    return this.cache_predict;
  }

  instantinate (type) {
    const className = 'Morphy_AnnotDecoder_'+ php.strings.ucfirst(type.toLowerCase());

    return new Morphy_AnnotDecoder_Factory.AnnotDecoders[className](this.eos);
  }

}

class Morphy_AncodesResolver_Interface {

  resolve (ancodeId) {}

  unresolve (ancode) {}

}

class Morphy_AncodesResolver_ToText extends Morphy_AncodesResolver_Interface {

  /**
   * @param {Morphy_GramTab_Interface} gramtab
   * @private
   */
  constructor (gramtab) {
    super();
    this.gramtab = gramtab;
  }

  resolve (ancodeId) {
    if (!php.var.isset(ancodeId)) {
      return null;
    }

    return this.gramtab.ancodeToString(ancodeId);
  }

  unresolve (ancode) {
    return this.gramtab.stringToAncode(ancode);
  }

}

class Morphy_AncodesResolver_ToDialingAncodes extends Morphy_AncodesResolver_Interface {

  /**
   * @param {Morphy_Storage} ancodesMap
   */
  constructor (ancodesMap) {
    super();
    this.ancodes_map = php.var.unserialize(ancodesMap.read(0, ancodesMap.getFileSize()).toString());
    if (this.ancodes_map === false) {
      throw new Error("Can`t open phpMorphy => Dialing ancodes map");
    }

    this.reverse_map = php.array.array_flip(this.ancodes_map);
  }

  unresolve (ancode) {
    if (!php.var.isset(ancode)) {
      return null;
    }

    if (!php.var.isset(this.reverse_map[ancode])) {
      throw new Error(`Unknown ancode found '${ ancode }'`);
    }

    return this.reverse_map[ancode];
  }

  resolve (ancodeId) {
    if (!php.var.isset(ancodeId)) {
      return null;
    }

    if (!php.var.isset(this.ancodes_map[ancodeId])) {
      throw new Error(`Unknown ancode id found '${ ancodeId }'`);
    }

    return this.ancodes_map[ancodeId];
  }

}

class Morphy_AncodesResolver_AsIs extends Morphy_AncodesResolver_Interface {

  constructor () {
    super();
  }
  
  resolve (ancodeId) {
    return ancodeId;
  }

  unresolve (ancode) {
    return ancode;
  }

}

class Morphy_AncodesResolver_Proxy extends Morphy_AncodesResolver_Interface {
  static get AncodesResolvers () {
    return {
      Morphy_AncodesResolver_ToText,
      Morphy_AncodesResolver_ToDialingAncodes,
      Morphy_AncodesResolver_AsIs
    }
  }
  
  static instantinate (className, args) {
    const { AncodesResolvers } = Morphy_AncodesResolver_Proxy;

    return new AncodesResolvers[className](...args);
    // return new (Function.prototype.bind.apply(AncodesResolvers[className], args));
  }

  constructor (className, ctorArgs) {
    super();
    this.className = className;
    this.args      = ctorArgs;
    this.___obj    = null;
  }

  unresolve (ancode) {
    return this.__obj.unresolve(ancode);
  }

  resolve (ancodeId) {
    return this.__obj.resolve(ancodeId);
  }

  get __obj () {
    if (!this.___obj) {
      this.___obj = Morphy_AncodesResolver_Proxy.instantinate(this.className, this.args);

      delete this.args;
      delete this.className;
    }

    return this.___obj;
  }
  
  set __obj (value) {
    this.___obj = (!_.isUndefined(value)) ? value : null;
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
  static get [Symbol.species]() { return Array; }
  
  /**
   * @param {*} word
   * @param {*} annots
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (word, annots, helper) {
    super();

    this.word = (word || '') + '';
    this.annots = false === annots ? false : helper.decodeAnnot(annots, true);
    this.helper = helper;

    if (this.annots !== false) {
      _.forEach(this.annots, annot => this.push(this.createDescriptor(word, annot, helper)));
    }
  }

  /**
   * @param {*} word
   * @param {*} annot
   * @param {Morphy_Morphier_Helper} helper
   */
  createDescriptor (word, annot, helper) {
    return new Morphy_WordDescriptor(word, annot, helper);
  }

  getByPartOfSpeech (poses) {
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
class Morphy_Morphier_Helper {

  /**
   * @param {Morphy_GramInfo_Interface} graminfo
   * @param {Morphy_GramTab_Interface} gramtab
   * @param {Morphy_AncodesResolver_Interface} ancodesResolver
   * @param {*} resolvePartOfSpeech
   */
  constructor (graminfo, gramtab, ancodesResolver, resolvePartOfSpeech) {
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
  setAnnotDecoder (annotDecoder) {
    this.annot_decoder = annotDecoder;
  }

  // getters
  getEndOfString () {
    return this.ends;
  }

  getCharSize () {
    return this.char_size;
  }

  hasAnnotDecoder () {
    return php.var.isset(this.annot_decoder);
  }

  getAnnotDecoder () {
    return this.annot_decoder;
  }

  getAncodesResolver () {
    return this.ancodes_resolver;
  }

  getGramInfo () {
    return this.graminfo;
  }

  getGramTab () {
    return this.gramtab;
  }

  isResolvePartOfSpeech () {
    return this.resolve_pos;
  }

  // other
  resolvePartOfSpeech (posId) {
    return this.gramtab.resolvePartOfSpeechId(posId);
  }

  getGrammems (ancodeId) {
    return this.gramtab.getGrammems(ancodeId);
  }

  getGrammemsAndPartOfSpeech (ancodeId) {
    return [
      this.gramtab.getPartOfSpeech(ancodeId),
      this.gramtab.getGrammems(ancodeId)
    ];
  }

  extractPartOfSpeech (annot) {
    if (this.resolve_pos) {
      return this.resolvePartOfSpeech(annot['pos_id']);
    }

    return annot['pos_id'];
  }

  includeGramTabConsts () {
    if (this.isResolvePartOfSpeech()) {
      this.gramtab.includeConsts();
    }

    this.gramtab_consts_included = true;
  }

  // getters
  getWordDescriptor (word, annots) {
    if (!this.gramtab_consts_included) {
      this.includeGramTabConsts();
    }

    return new Morphy_WordDescriptor_Collection(word, annots, this);
  }

  getBaseAndPrefix (word, cplen, plen, flen) {
    const wordBuf = Buffer.from(word);
    let base;
    let prefix;

    if (flen) {
      base = php.strings.substr(wordBuf, cplen + plen, -flen);
    } else {
      if (cplen || plen) {
        base = php.strings.substr(wordBuf, cplen + plen);
      } else {
        base = wordBuf;
      }
    }

    prefix = cplen ? php.strings.substr(wordBuf, 0, cplen) : '';
    base = base.toString();
    prefix = prefix.toString();

    return [base, prefix];
  }

  getPartOfSpeech (word, annots) {
    if (annots === false) {
      return false;
    }

    let result = {};
    _.forEach(this.decodeAnnot(annots, false), annot => result[this.extractPartOfSpeech(annot)] = 1);
    result = _.keys(result);
    result = this.resolve_pos ? result : result.map(_.toInteger);
  
    return result;
  }

  getBaseForm (word, annots) {
    if (annots === false) {
      return false;
    }

    annots = this.decodeAnnot(annots, true);

    return this.composeBaseForms(word, annots);
  }

  getPseudoRoot (word, annots) {
    if (annots == false) {
      return false;
    }
  
    const result = {};
    annots = this.decodeAnnot(annots, false);
    _.forEach(annots, annot => {
      const base = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen'])[0];

      result[base] = 1;
    });

    return php.array.array_keys(result);
  }

  getAllForms (word, annots) {
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
  castFormByGramInfo (word, annots, partOfSpeech, grammems, returnWords = false, callback = null) {
    if (annots === false) {
      return false;
    }
    
    /**
     * @todo: вот сюда данные приходят правильные (как в php),
     * а выходят не правильные (не как в php)
     */
    
    grammems = _.toArray(grammems);
    partOfSpeech = php.var.isset(partOfSpeech) ? partOfSpeech + '' : null;
  
    /**
     * Проверено:
     * grammems
     * partOfSpeech
     * this.decodeAnnot(annots, false)
     */
    const result = (!!returnWords) ? {} : [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const flexias = this.graminfo.readFlexiaData(annot);
      const common_ancode = annot['common_ancode'];
      const common_grammems = php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];
      const [ base, prefix ] = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
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
  
      _.forEach(all_ancodes, form_ancodes => {
        _.forEach(form_ancodes, ancode => {
          const form_pos = this.gramtab.getPartOfSpeech(ancode);
          const form_grammems = php.array.array_merge(this.gramtab.getGrammems(ancode), common_grammems);
          const form = [
            prefix,
            flexias[i],
            base,
            flexias[i + 1]
          ].join('');

          if (_.isFunction(callback)) {
            if (!callback(form, form_pos, form_grammems, form_no)) {
              form_no++;
              return;
            }
          } else {
            if (php.var.isset(partOfSpeech) && form_pos !== partOfSpeech) {
              form_no++;
              return;
            }

            if (_.size(php.array.array_diff(grammems, form_grammems)) > 0) {
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

    return returnWords ? php.array.array_keys(result) : result;
  }

  getAncode (annots) {
    if (annots === false) {
      return false;
    }

    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);

      result.push({
        common: this.ancodes_resolver.resolve(annot['common_ancode']),
        all: php.array.array_map([this.ancodes_resolver, 'resolve'], all_ancodes[annot['form_no']])
      });
    });
    
    return _.uniqWith(result, _.isEqual);
  }

  getGrammarInfoMergeForms (annots) {
    if (annots === false) {
      return false;
    }

    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const common_ancode = annot['common_ancode'];
      const form_no = annot['form_no'];
      let grammems = php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];
      let forms_count = 0;

      let ancodeId;
      _.forEach(all_ancodes[form_no], ancode => {
        ancodeId = ancode;
        
        grammems = php.array.array_merge(grammems, this.gramtab.getGrammems(ancode));
        forms_count++;
      });

      grammems = _.sortedUniq(_.sortBy(grammems, this.resolve_pos ? JSON.stringify : _.toInteger));

      result.push({
        // todo: незарезолвенный ancodeId
        // part of speech identical across all joined forms
        pos: this.gramtab.getPartOfSpeech(ancodeId),
        grammems,
        forms_count,
        form_no_low: form_no,
        form_no_high: form_no + forms_count,
      });
    });

    return _.uniqWith(result, _.isEqual);
  }

  getGrammarInfo (annots) {
    if (annots == false) {
      return false;
    }
    
    const result = [];
    _.forEach(this.decodeAnnot(annots, false), annot => {
      const all_ancodes = this.graminfo.readAncodes(annot);
      const common_ancode = annot['common_ancode'];
      const common_grammems = php.var.isset(common_ancode) ? this.gramtab.getGrammems(common_ancode) : [];
      const info = [];
      const form_no = annot['form_no'];
      
      _.forEach(all_ancodes[form_no], ancode => {
        let grammems = php.array.array_merge(common_grammems, this.gramtab.getGrammems(ancode));
        grammems = _.sortBy(grammems, this.resolve_pos ? JSON.stringify : _.toInteger);
  
        let info_item = {
          pos: this.gramtab.getPartOfSpeech(ancode),
          grammems,
          form_no
        };

        info.push(info_item);
      });
  
      let unique_info = _.sortedUniq(_.sortBy(info, JSON.stringify));
  
      result.push(unique_info);
    });

    return _.uniqWith(result, _.isEqual);
  }

  /**
   * @param word
   * @param annots
   * @param {string} [resolveType='no_resolve']
   * @returns {boolean}
   */
  getAllFormsWithResolvedAncodes (word, annots, resolveType = 'no_resolve') {
    if (annots == false) {
      return false;
    }
  
    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithResolvedAncodes(word, annots);
  }

  getAllFormsWithAncodes (word, annots, foundFormNo) {
    if (annots === false) {
      return false;
    }

    annots = this.decodeAnnot(annots, false);

    return this.composeFormsWithAncodes(word, annots);
  }

  getAllAncodes (word, annots) {
    if (annots === false) {
      return false;
    }

    const result = [];

    _.forEach(annots, annot => result.push(this.graminfo.readAncodes(annot)));

    return result;
  }

  composeBaseForms (word, annots) {
    const result = {};

    _.forEach(annots, annot => {
      if (annot['form_no'] > 0) {
        const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
        const base = baseAndPrefix[0];
        const prefix = baseAndPrefix[1];
        const form = [
          prefix,
          annot['base_prefix'],
          base,
          annot['base_suffix']
        ].join('');

        result[form] = 1;
      } else {
        result[word] = 1;
      }
    });
    
    return php.array.array_keys(result);
  }

  composeForms (word, annots) {
    const result = {};

    _.forEach(annots, annot => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
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

  composeFormsWithResolvedAncodes (word, annots) {
    const result = [];
    
    _.forEach(annots, (annot, annotIdx) => {
      const words = [];
      const ancodes = [];
      const common_ancode = annot['common_ancode'];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const all_ancodes = this.graminfo.readAncodes(annot);
      const baseAndPrefix = this.getBaseAndPrefix(
        word,
        annot['cplen'],
        annot['plen'],
        annot['flen']
      );
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
  
      let form;
      let current_ancodes;
  
      for (let i = 0, c = _.size(flexias); i < c; i += 2) {
        form = [prefix, flexias[i], base, flexias[i + 1]].join('');
        current_ancodes = all_ancodes[i / 2];

        _.forEach(current_ancodes, ancode => {
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

  composeFormsWithAncodes (word, annots, foundFormNo) {
    const result = [];

    _.forEach(annots, (annot, annotIdx) => {
      const baseAndPrefix = this.getBaseAndPrefix(word, annot['cplen'], annot['plen'], annot['flen']);
      const base = baseAndPrefix[0];
      const prefix = baseAndPrefix[1];
      // read flexia
      const flexias = this.graminfo.readFlexiaData(annot);
      const ancodes = this.graminfo.readAncodes(annot);
      const found_form_no = annot['form_no'];
  
      let count;
      let form_no;

      foundFormNo = (!_.isArray(foundFormNo)) ? [] : foundFormNo;

      for (let i = 0, c = _.size(flexias); i < c; i += 2) {
        form_no = i / 2;
        word = [prefix, flexias[i], base, flexias[i + 1]].join('');

        if (found_form_no == form_no) {
          foundFormNo[annotIdx] = _.isPlainObject(foundFormNo[annotIdx]) ? foundFormNo[annotIdx] : {};
          count = _.size(result);
          foundFormNo[annotIdx]['low'] = count;
          foundFormNo[annotIdx]['high'] = count + _.size(ancodes[form_no]) - 1;
        }

        _.forEach(ancodes[form_no], ancode => result.push([word, ancode]));
      }
    });

    return {
      foundFormNo,
      forms: result
    };
  }

  decodeAnnot (annotsRaw, withBase) {
    if (php.var.is_array(annotsRaw)) {
      return annotsRaw;
    }

    return this.annot_decoder.decode(annotsRaw, withBase);
  }

}

class Morphy_WordForm {

  static compareGrammems (a, b) {
    return _.size(a) == _.size(b) && _.size(php.array.array_diff(a, b)) == 0;
  }

  constructor (word, form_no, pos_id, grammems) {
    grammems = _.values(grammems);

    this.word = word + '';
    this.form_no = parseInt(form_no, 10);
    this.pos_id = pos_id;
    this.grammems = grammems.length
      ? _.sortBy(grammems, _.isNumber(grammems[0]) ? _.toInteger : JSON.stringify)
      : grammems
    ;
  }

  getPartOfSpeech () {
    return this.pos_id;
  }

  getGrammems () {
    return this.grammems;
  }

  hasGrammems (grammems) {
    grammems = (!_.isArray(grammems)) ? [grammems] : grammems;
    const grammes_count = _.size(grammems);

    return grammes_count && _.size(php.array.array_intersect(grammems, this.grammems)) == grammes_count;
  }

  getWord () {
    return this.word;
  }

  getFormNo () {
    return this.form_no;
  }

}

class Morphy_WordDescriptor extends Array {

  // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Classes#Species
  static get [Symbol.species]() { return Array; }

  /**
   * @param word
   * @param annot
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (word, annot, helper) {
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

  getPseudoRoot () {
    if (!php.var.isset(this.cached_pseudo_root)) {
      this.cached_pseudo_root = this.helper.getPseudoRoot(this.word, this.annot)[0];
    }

    return this.cached_pseudo_root;
  }

  getBaseForm () {
    if (!php.var.isset(this.cached_base)) {
      this.cached_base = this.helper.getBaseForm(this.word, this.annot)[0];
    }

    return this.cached_base;
  }

  getAllForms () {
    if (!php.var.isset(this.cached_forms)) {
      this.cached_forms = this.helper.getAllForms(this.word, this.annot);
    }

    return this.cached_forms;
  }

  getWordForm (index) {
    this.readAllForms();

    return this.slice(index, index + 1)[0];
  }

  createWordForm (word, form_no, ancode) {
    let common_ancode;
    let grammemsAndPartOfSpeech;
    let pos_id;
    let all_grammems;

    if (!php.var.isset(this.common_ancode_grammems)) {
      common_ancode = this.annot[0]['common_ancode'];

      this.common_ancode_grammems = php.var.isset(common_ancode)
        ? this.helper.getGrammems(common_ancode)
        : {};
    }

    grammemsAndPartOfSpeech = this.helper.getGrammemsAndPartOfSpeech(ancode);
    pos_id = grammemsAndPartOfSpeech[0];
    all_grammems = grammemsAndPartOfSpeech[1];

    return new Morphy_WordForm(word, form_no, pos_id, php.array.array_merge(this.common_ancode_grammems, all_grammems));
  }

  readAllForms () {
    const forms = [];
    let form_no = 0;
    let formsWithAncodes;

    if (!this.all_forms_readed) {
      formsWithAncodes = this.helper.getAllFormsWithAncodes(this.word, this.annot);

      _.forEach(formsWithAncodes.forms, form => {
        forms.push(this.createWordForm(form[0], form_no, form[1]));
        form_no++;
      });

      this.found_form_no = formsWithAncodes.foundFormNo[0];

      this.splice(0, this.length);
      _.forEach(forms, form => this.push(form));

      this.all_forms_readed = true;
    }

    return this;
  }

  getFoundFormNoLow () {
    this.readAllForms();

    return this.found_form_no['low'];
  }

  getFoundFormNoHigh () {
    this.readAllForms();

    return this.found_form_no['high'];
  }

  getFoundWordForm () {
    const result = [];
    for (let i = this.getFoundFormNoLow(), c = this.getFoundFormNoHigh() + 1; i < c; i++) {
      result.push(this.getWordForm(i));
    }

    return result;
  }

  hasGrammems (grammems) {
    grammems = castArray(grammems);

    return _.some(this, wf => wf.hasGrammems(grammems));
  }

  getWordFormsByGrammems (grammems) {
    grammems = castArray(grammems);
    const result = [];

    _.forEach(this, wf => {
      if (wf.hasGrammems(grammems)) {
        result.push(wf);
      }
    });

    return result;
    //return count(result) ? result : false;
  }

  hasPartOfSpeech (poses) {
    poses = castArray(poses);

    return _.some(this, wf => {
      return poses.indexOf(wf.getPartOfSpeech()) >= 0;
      // return poses.includes(wf.getPartOfSpeech());
    });
  }

  getWordFormsByPartOfSpeech (poses) {
    poses = castArray(poses);
    const result = [];

    _.forEach(this, wf => {
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

  findWord (word) {}

  decodeAnnot (raw, withBase) {}

  getAnnotDecoder () {}

}

class Morphy_Morphier_Finder_Base extends Morphy_Morphier_Finder_Interface {

  /**
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor (annotDecoder) {
    super();
    this.annot_decoder = annotDecoder;
    this.prev_word = null;
    this.prev_result = false;
  }

  findWord (word) {
    if (this.prev_word === word) {
      return this.prev_result;
    }

    const result = this.doFindWord(word);

    this.prev_word = word;
    this.prev_result = result;

    return result;
  }

  getAnnotDecoder () {
    return this.annot_decoder;
  }

  decodeAnnot (raw, withBase) {
    return this.annot_decoder.decode(raw, withBase);
  }

  doFindWord (word) {}

}

class Morphy_Morphier_Finder_Common extends Morphy_Morphier_Finder_Base {
  
  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor (fsa, annotDecoder) {
    super(annotDecoder);

    this.fsa = fsa;
    this.root = this.fsa.getRootTrans();
  }

  getFsa () {
    return this.fsa;
  }

  doFindWord (word) {
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
  constructor (fsa, annotDecoder, encoding, minimalSuffixLength = 4) {
    super(fsa, annotDecoder);

    this.min_suf_len = minimalSuffixLength;
    this.unicode = Morphy_UnicodeHelper.create(encoding);
  }

  doFindWord (word) {
    const word_len = this.unicode.strlen(word);
    let result;

    if (!word_len) {
      return false;
    }
  
    let i = 1;
    let c = word_len - this.min_suf_len;
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

  fixAnnots (annots, len) {
    _.forEach(annots, annot => annot['cplen'] = len);

    return annots;
  }

}

class Morphy_Morphier_PredictCollector extends Morphy_Fsa_WordsCollector {

  /**
   * @param {*} limit
   * @param {Morphy_AnnotDecoder_Interface} annotDecoder
   */
  constructor (limit, annotDecoder) {
    super(limit);
  
    this.collected = 0;
    this.used_poses = {};
    this.annot_decoder = annotDecoder;
  }

  collect (path, annotRaw) {
    if (this.collected > this.limit) {
      return false;
    }

    const annots = this.decodeAnnot(annotRaw);
    let pos_id;
    let result_idx;
    let nextItemsIndex;
    let itemsSize;

    _.forEach(annots, annot => {
      annot['cplen'] = annot['plen'] = 0;
      pos_id = annot['pos_id'];

      if (php.var.isset(this.used_poses[pos_id])) {
        result_idx = this.used_poses[pos_id];

        if (annot['freq'] > this.items[result_idx]['freq']) {
          this.items[result_idx] = annot;
        }
      } else {
        itemsSize = _.size(this.items);
        this.used_poses[pos_id] = itemsSize;
        // оригинал:
        // $this->items[] = annot;
        nextItemsIndex = (itemsSize) ? _.max(_.keys(this.items)) : -1;

        this.items[parseInt(nextItemsIndex, 10) + 1] = annot;
      }
    });

    this.collected++;

    return true;
  }

  clear () {
    super.clear();
    this.collected = 0;
    this.used_poses = {};
  }

  decodeAnnot (annotRaw) {
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
  constructor (fsa, annotDecoder, encoding, graminfo, minPostfixMatch = 2, collectLimit = 32) {
    super(fsa, annotDecoder);

    this.graminfo = graminfo;
    this.min_postfix_match = minPostfixMatch;
    this.collector = this.createCollector(collectLimit, this.getAnnotDecoder());
    this.unicode = Morphy_UnicodeHelper.create(encoding);
  }

  createAnnotDecoder () {
    // todo: какая-то херня
    //return phpmorphy_annot_decoder_new('predict');
    return Morphy_AnnotDecoder_Factory.create('predict');
  }

  doFindWord (word) {
    word = toBuffer(word);

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

    if (!php.var.is_array(annots)) {
      annots = this.collector.decodeAnnot(annots);
    }

    return this.fixAnnots(word, annots);
  }

  determineAnnots (trans, matchLen) {
    let annots = this.fsa.getAnnot(trans);
    if (annots == null && matchLen >= this.min_postfix_match) {
      this.collector.clear();
      this.fsa.collect(trans, this.collector.getCallback());
      annots = this.collector.getItems();
    }

    return annots;
  }

  fixAnnots (word, annots) {
    word = toBuffer(word);

    const result = [];
    let flexias;
    let prefix;
    let suffix;
    let plen;
    let slen;

    // remove all prefixes?
    _.forEach(annots, annot => {
      annot['cplen'] = annot['plen'] = 0;
      flexias = this.graminfo.readFlexiaData(annot, false);
      prefix = Buffer.from(flexias[annot['form_no'] * 2]);
      suffix = Buffer.from(flexias[annot['form_no'] * 2 + 1]);

      plen = prefix.length;
      slen = suffix.length;
      
      const partOfWordInPlaceOfPrefix = php.strings.substr(word, 0, plen);
      const partOfWordInPlaceOfSuffix = php.strings.substr(word,   -slen);
      
      if (
        (!plen || (partOfWordInPlaceOfPrefix && partOfWordInPlaceOfPrefix.equals(prefix))) &&
        (!slen || (partOfWordInPlaceOfSuffix && partOfWordInPlaceOfSuffix.equals(suffix)))
      ) {
        result.push(annot);
      }
    });

    return _.size(result) ? result : false;
  }

  createCollector (limit) {
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
  constructor (finder, helper) {
    super();
    this.finder = finder;
    this.helper = _.cloneDeep(helper);
    this.helper.setAnnotDecoder(finder.getAnnotDecoder());
  }

  /**
   * @return Morphy_Morphier_Finder_Interface
   */
  getFinder () {
    return this.finder;
  }

  /**
   * @return Morphy_Morphier_Helper
   */
  getHelper () {
    return this.helper;
  }

  getAnnot (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.decodeAnnot(annots, true);
  }

  getWordDescriptor (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getWordDescriptor(word, annots);
  }

  getAllFormsWithAncodes (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }
    
    return this.helper.getAllFormsWithResolvedAncodes(word, annots);
  }

  getPartOfSpeech (word) {
    const annots = this.finder.findWord(word);
    if (annots == false) {
      return false;
    }

    return this.helper.getPartOfSpeech(word, annots);
  }

  getBaseForm (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getBaseForm(word, annots);
  }

  getPseudoRoot (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getPseudoRoot(word, annots);
  }

  getAllForms (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getAllForms(word, annots);
  }

  getAncode (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getAncode(annots);
  }

  getGrammarInfo (word) {
    const annots = this.finder.findWord(word);
    if (annots === false) {
      return false;
    }

    return this.helper.getGrammarInfo(annots);
  }

  getGrammarInfoMergeForms (word) {
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
  castFormByGramInfo (word, partOfSpeech, grammems, returnOnlyWord = false, callback = null) {
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
  castFormByPattern (word, patternWord, returnOnlyWord = false, callback = null) {
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
  static createAnnotDecoder (helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }
  
  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (fsa, helper) {
    super(new Morphy_Morphier_Finder_Common(fsa, Morphy_Morphier_Common.createAnnotDecoder(helper)), helper);
  }

}

class Morphy_Morphier_Predict_Suffix extends Morphy_Morphier_Base {
  
  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {Morphy_AnnotDecoder_Interface}
   */
  static createAnnotDecoder (helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getCommonDecoder();
  }
  
  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (fsa, helper) {
    super(
      new Morphy_Morphier_Finder_Predict_Suffix(
        fsa,
        Morphy_Morphier_Predict_Suffix.createAnnotDecoder(helper),
        helper.getGramInfo().getEncoding(),
        4
      ),
      helper
    );
  }

}

class Morphy_Morphier_Predict_Database extends Morphy_Morphier_Base {
  
  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {Morphy_AnnotDecoder_Interface}
   */
  static createAnnotDecoder (helper) {
    return Morphy_AnnotDecoder_Factory.create(helper.getGramInfo().getEnds()).getPredictDecoder();
  }
  
  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (fsa, helper) {
    super(
      new Morphy_Morphier_Finder_Predict_Database(
        fsa,
        Morphy_Morphier_Predict_Database.createAnnotDecoder(helper),
        helper.getGramInfo().getEncoding(),
        helper.getGramInfo(),
        2,
        32
      ),
      helper
    );
  }

}

class Morphy_Morphier_Bulk extends Morphy_Morphier_Interface {

  /**
   * @param {Morphy_Fsa_Interface} fsa
   * @param {Morphy_Morphier_Helper} helper
   */
  constructor (fsa, helper) {
    super();
    
    this.fsa = fsa;
    this.root_trans = fsa.getRootTrans();
    this.helper = _.cloneDeep(helper);
    this.helper.setAnnotDecoder(this.createAnnotDecoder(helper));
    this.graminfo = helper.getGramInfo();
    this.notfound = [];
  }

  getFsa () {
    return this.fsa;
  }

  getHelper () {
    return this.helper;
  }

  getGraminfo () {
    return this.graminfo;
  }

  getNotFoundWords () {
    return this.notfound;
  }

  /**
   * @param {Morphy_Morphier_Helper} helper
   * @returns {*}
   */
  createAnnotDecoder (helper) {
    return new Morphy_AnnotDecoder_Common(helper.getGramInfo().getEnds());
  }

  getAnnot (word) {
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

  getBaseForm (words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, true, false, false);
  }

  getAllForms (words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, false, false);
  }

  getPseudoRoot (words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, true, false);
  }

  getPartOfSpeech (words) {
    const annots = this.findWord(words);

    return this.composeForms(annots, false, false, true);
  }

  /**
   * @param words
   * @param method
   * @param {boolean} [callWithWord=false]
   * @returns {*}
   */
  processAnnotsWithHelper (words, method, callWithWord = false) {
    const result = {};
    let annot_raw;
    let result_for_annot;

    _.forEach(this.findWord(words), item => {
      words = item.data;
      annot_raw = item.annots;

      if (annot_raw.length == 0) {
        return;
      }

      if (callWithWord) {
        _.forEach(words, word => result[word] = this.helper[method](word, annot_raw));
      } else {
        result_for_annot = this.helper[method](annot_raw);
        _.forEach(words, word => result[word] = result_for_annot);
      }
    });

    return result;
  }

  getAncode (words) {
    return this.processAnnotsWithHelper(words, 'getAncode');
  }

  getGrammarInfoMergeForms (words) {
    return this.processAnnotsWithHelper(words, 'getGrammarInfoMergeForms');
  }

  getGrammarInfo (words) {
    return this.processAnnotsWithHelper(words, 'getGrammarInfo');
  }

  getAllFormsWithAncodes (words) {
    return this.processAnnotsWithHelper(words, 'getAllFormsWithResolvedAncodes', true);
  }

  getWordDescriptor (words) {
    return this.processAnnotsWithHelper(words, 'getWordDescriptor', true);
  }

  findWord (words) {
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
        if (trans !== false && php.var.isset(result['annot'])) {
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
        _.forEach(dests[n], dest => {
          stack_idx += 3;
          stack[stack_idx] = dest;
          stack[stack_idx + 1] = path;
          stack[stack_idx + 2] = trans;
        });
      }
    }

    return annots;
  }

  composeForms (annotsRaw, onlyBase, pseudoRoot, partOfSpeech) {
    const result = {};
    let key;
    let annot_raw;
    let words;

    // process found annotations
    _.forEach(annotsRaw, item => {
      words = item.data;
      annot_raw = item.annots;

      if (annot_raw.length == 0) {
        return;
      }

      _.forEach(this.helper.decodeAnnot(annot_raw, onlyBase), annot => {
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

        _.forEach(words, word => {
          let base;
          let prefix;
          let form;

          if (flen) {
            base = php.strings.substr(word, cplen + plen, -flen);
          } else {
            if (cplen || plen) {
              base = php.strings.substr(word, cplen + plen);
            } else {
              base = word;
            }
          }

          prefix = cplen ? php.strings.substr(word, 0, cplen) : '';
          result[word] = result[word] || {};

          if (pseudoRoot) {
            result[word][base] = 1;
          } else
          if (onlyBase) {
            form = [
              prefix,
              annot['base_prefix'],
              base,
              annot['base_suffix']
            ].join('');

            result[word][form] = 1;
          } else
          if (partOfSpeech) {
            result[word][pos_id] = 1;
          } else {
            for (let i = 0, c = _.size(flexias); i < c; i += 2) {
              form = [
                prefix,
                flexias[i],
                base,
                flexias[i + 1]
              ].join('');

              result[word][form] = 1;
            }
          }
        });
      });
    });
  
    _.keys(result).forEach(key => {
      result[key] = _.keys(result[key]);
      
      if (result[key].length && isStringifyedNumber(result[key][0])) {
        result[key] = result[key].map(_.toInteger);
      }
    });
    
    return result;
  }

  buildPatriciaTrie (words) {
    if (!php.var.is_array(words)) {
      throw new Error('Words must be array');
    }

    //words = php.array.sort(words);
    words = (words.length && Buffer.isBuffer(words[0])) ? words.sort(Buffer.compare) : words.sort();

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

    _.forEach(words, word => {
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
        new_state_id = _.size(state_labels);
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
          node = stack[_.size(stack) - 1];
        } else
        if (lcp > prev_lcp) {
          if (lcp == prev_word_len) {
            need_split = false;
          } else {
            need_split = true;
            trim_size = lcp - prev_lcp;
          }

          stack.push(node);
        } else {
          trim_size = prev_wordBuf.length - lcp;
  
          let stack_size = _.size(stack) - 1;
          for (;; --stack_size) {
            trim_size -= state_labels[node].length;

            if (trim_size <= 0) {
              break;
            }

            if (_.size(stack) < 1) {
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
          new_node_id_1 = _.size(state_labels);
          new_node_id_2 = new_node_id_1 + 1;

          // new_node_1
          state_labels.push(php.strings.substr(node_key_buf, trim_size));
          state_finals.push(state_finals[node]);
          state_dests.push(state_dests[node]);

          // adjust old node
          state_labels[node] = php.strings.substr(node_key_buf, 0, trim_size);
          state_finals[node] = 0;
          state_dests[node] = [new_node_id_1];

          // append new node, new_node_2
          state_labels.push(php.strings.substr(wordBuf, lcp));
          state_finals.push(1);
          state_dests.push(false);

          state_dests[node].push(new_node_id_2);

          node = new_node_id_2;
        } else {
          new_node_id = _.size(state_labels);

          state_labels.push(php.strings.substr(wordBuf, lcp));
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

export {
  Morphy_Morphier_Interface,
  Morphy_Morphier_Empty,
  Morphy_AnnotDecoder_Interface,
  Morphy_AnnotDecoder_Base,
  Morphy_AnnotDecoder_Common,
  Morphy_AnnotDecoder_Predict,
  Morphy_AnnotDecoder_Factory,
  Morphy_AncodesResolver_Interface,
  Morphy_AncodesResolver_ToText,
  Morphy_AncodesResolver_ToDialingAncodes,
  Morphy_AncodesResolver_AsIs,
  Morphy_AncodesResolver_Proxy,
  Morphy_WordDescriptor_Collection,
  Morphy_Morphier_Helper,
  Morphy_WordForm,
  Morphy_WordDescriptor,
  Morphy_Morphier_Finder_Interface,
  Morphy_Morphier_Finder_Base,
  Morphy_Morphier_Finder_Common,
  Morphy_Morphier_Finder_Predict_Suffix,
  Morphy_Morphier_PredictCollector,
  Morphy_Morphier_Finder_Predict_Database,
  Morphy_Morphier_Base,
  Morphy_Morphier_Common,
  Morphy_Morphier_Predict_Suffix,
  Morphy_Morphier_Predict_Database,
  Morphy_Morphier_Bulk,
};
