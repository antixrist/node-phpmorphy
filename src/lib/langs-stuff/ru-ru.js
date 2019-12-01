import _ from 'lodash';
import { GrammemsProviderForFactory } from './common';

const GrammemsProviderRuRuInstances = new WeakMap();

class GrammemsProviderRuRu extends GrammemsProviderForFactory {
  static get selfEncoding() {
    return 'utf-8';
  }

  static get grammemsMap() {
    return {
      род: ['МР', 'ЖР', 'СР'],
      одушевленность: ['ОД', 'НО'],
      число: ['ЕД', 'МН'],
      падеж: ['ИМ', 'РД', 'ДТ', 'ВН', 'ТВ', 'ПР', 'ЗВ', '2'],
      залог: ['ДСТ', 'СТР'],
      время: ['НСТ', 'ПРШ', 'БУД'],
      'повелительная форма': ['ПВЛ'],
      лицо: ['1Л', '2Л', '3Л'],
      краткость: ['КР'],
      'сравнительная форма': ['СРАВН'],
      'превосходная степень': ['ПРЕВ'],
      вид: ['СВ', 'НС'],
      переходность: ['ПЕ', 'НП'],
      'безличный глагол': ['БЕЗЛ'],
    };
  }

  /**
   * @param {PhpMorphy} morphy
   * @returns {*}
   */
  static instance(morphy) {
    const key = morphy.getEncoding();
    if (!GrammemsProviderRuRuInstances.has(morphy)) {
      GrammemsProviderRuRuInstances.set(morphy, {});
    }

    const instances = GrammemsProviderRuRuInstances.get(morphy);

    if (_.isUndefined(instances[key])) {
      instances[key] = new GrammemsProviderRuRu(key);
    }

    return instances[key];
  }

  getSelfEncoding() {
    return 'utf-8';
  }

  getGrammemsMap() {
    return GrammemsProviderRuRu.grammemsMap;
  }
}

export { GrammemsProviderRuRu };
