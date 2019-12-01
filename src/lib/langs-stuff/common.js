import _ from 'lodash';
import encoding from 'encoding';
import { php } from '~/utils';

class GrammemsProviderInterface {
  getGrammems(partOfSpeech) {}
}

class GrammemsProviderDecorator extends GrammemsProviderInterface {
  /**
   * @param {GrammemsProviderInterface} inner
   */
  constructor(inner) {
    super();
    this.inner = inner;
  }

  getGrammems(partOfSpeech) {
    return this.inner.getGrammems(partOfSpeech);
  }
}

class GrammemsProviderBase extends GrammemsProviderInterface {
  static flatizeArray(array) {
    return _.flatten(_.values(array));
  }

  constructor() {
    super();
    this.grammems = {};
    this.all_grammems = GrammemsProviderBase.flatizeArray(this.getAllGrammemsGrouped());
  }

  getAllGrammemsGrouped() {}

  includeGroups(partOfSpeech, names) {
    const grammems = this.getAllGrammemsGrouped();
    names = !_.isArray(names) ? [names] : names;
    names = php.array.array_flip(names);

    _.forEach(php.array.array_keys(grammems), key => {
      if (!php.var.isset(names[key])) {
        delete grammems[key];
      }
    });

    this.grammems[partOfSpeech] = GrammemsProviderBase.flatizeArray(grammems);

    return this;
  }

  excludeGroups(partOfSpeech, names) {
    const grammems = this.getAllGrammemsGrouped();
    names = !_.isArray(names) ? [names] : names;

    _.forEach(names, key => delete grammems[key]);

    this.grammems[partOfSpeech] = GrammemsProviderBase.flatizeArray(grammems);

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
    if (php.var.isset(this.grammems[partOfSpeech])) {
      return this.grammems[partOfSpeech];
    }

    return this.all_grammems;
  }
}

class GrammemsProviderEmpty extends GrammemsProviderBase {
  getAllGrammemsGrouped() {
    return {};
  }

  getGrammems(partOfSpeech) {
    return false;
  }
}

class GrammemsProviderForFactory extends GrammemsProviderBase {
  constructor(enc) {
    super();
    this.encoded_grammems = this.encodeGrammems(this.getGrammemsMap(), enc);

    // а как по-другому?
    // кроме как копипастой кода родительского конструктора
    // и чтобы аккуратно - никак
    this.grammems = {};
    this.all_grammems = GrammemsProviderBase.flatizeArray(this.getAllGrammemsGrouped());
  }

  getGrammemsMap() {}

  getAllGrammemsGrouped() {
    return this.encoded_grammems;
  }

  encodeGrammems(grammems, enc) {
    const fromEnc = this.getSelfEncoding();
    const result = {};

    if (fromEnc === enc) {
      return grammems;
    }

    _.forEach(grammems, (ary, key) => {
      const keyBuffer = Buffer.from(key);
      const keyBufferConverted = encoding.convert(keyBuffer, enc, fromEnc);
      const newKey = keyBufferConverted.toString();
      const newValue = [];

      _.forEach(ary, value => {
        const valueBuffer = Buffer.from(value);
        const valueBufferConverted = encoding.convert(valueBuffer, enc, fromEnc);

        newValue.push(valueBufferConverted.toString());
      });

      result[newKey] = newValue;
    });

    return result;
  }
}

const GrammemsProviderFactoryIncluded = new Map();

class GrammemsProviderFactory {
  /**
   * @param {PhpMorphy} morphy
   * @returns {*}
   */
  static create(morphy) {
    const locale = morphy.getLocale().toLowerCase();

    if (!GrammemsProviderFactoryIncluded.has(morphy)) {
      GrammemsProviderFactoryIncluded.set(morphy, {});
    }

    const included = GrammemsProviderFactoryIncluded.get(morphy);

    if (_.isUndefined(included[locale])) {
      const className = `GrammemsProvider${_.upperFirst(_.camelCase(locale))}`;
      let grammemsProviders = {};

      try {
        grammemsProviders = require(`./${_.kebabCase(locale)}`);
      } catch (error) {
        included[locale] = new GrammemsProviderEmpty(morphy);
        return included[locale];
      }

      if (_.isFunction(grammemsProviders[className])) {
        included[locale] = grammemsProviders[className].instance(morphy);
      } else {
        throw new TypeError(`Class '${className}' not found`);
      }
    }

    return included[locale];
  }
}

export {
  GrammemsProviderInterface,
  GrammemsProviderDecorator,
  GrammemsProviderBase,
  GrammemsProviderEmpty,
  GrammemsProviderForFactory,
  GrammemsProviderFactory,
};
