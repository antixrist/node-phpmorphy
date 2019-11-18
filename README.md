Полнофункциональный порт [phpMorphy](http://phpmorphy.sourceforge.net/) на Node.JS.

Ниже представлена оригинальная документация к phpMorphy, с поправкой на javascript-синтаксис и реализованные возможности.

Последнюю версию библиотеки и исходный код можно взять с [гитхаба](https://github.com/antixrist/node-phpmorphy).

## Возможности

Библиотека позволяет решать следующие задачи:

- Лемматизация (получение нормальной формы слова);
- Получение всех форм слова;
- Получение грамматической информации для слова (часть речи, падеж, спряжение и т.д.);
- Изменение формы слова в соответствии с заданными грамматическими характеристиками;
- Изменение формы слова по заданному образцу.

## Требования
Для работы библиотеки необходимы node@6 или выше, npm@3 или выше.

## Установка
С помощью `npm`
```
npm install phpmorphy --save
```

С помощью `yarn`
```
yarn add phpmorphy
```

## Разработка
Для устновки всех packages 
```
npm install
```

Затем 

```
npm run build
```



## Подключение
ES2015:
```javascript
import Morphy from 'phpmorphy';
```

CommonJS:
```javascript
const Morphy = require('phpmorphy').default;
```

## Использование
Весь код библиотеки работает **синхронно**. Асинхронных аналогов методов **нет и не будет**, потому что:

1. при установке опции `storage` в значение `Morphy.STORAGE_MEM` асинхронная работа просто не нужна - словари **синхронно** загружаются с диска в память единожды - при вызове `new Morphy(...)`. Это означает, что создавать экземпляры Morpher'а для всех необходимых словарей лучше при старте приложения. Вся дальнейшая работа внутри библиотеки будет происходить без каких-либо задержек *(словно вы работаете с обычными переменными или массивами)*.
2. Асинхронность нужна только при установке опции `storage` в значение `Morphy.STORAGE_FILE`, потому что в этом режиме при вызове любого метода происходит чтение с диска, что помедленней.
Вся работа с файловой системой внутри библиотеки происходит синхронно. Для работы с ФС асинхронными методами пришлось бы переписывать большую часть логики кода phpMorphy.

Просто используйте `Morphy.STORAGE_MEM` и не инициализируйте библиотеку в циклах.

Синхронный код также означает, что все брошенные библиотекой исключения вы можете спокойной ловить `try/catch`ем.

### Инициализация
```javascript
const morphy = new Morphy('ru', {
//  nojo:                false,
  storage:             Morphy.STORAGE_MEM,
  predict_by_suffix:   true,
  predict_by_db:       true,
  graminfo_as_text:    true,
  use_ancodes_cache:   false,
  resolve_ancodes:     Morphy.RESOLVE_ANCODES_AS_TEXT
});
```
Поддерживаемые языки:
* на основе [`AOT`](http://aot.ru/) словарей:
    * Русский (`ru` или `ru_ru`);
    * Английский (`en` или `en_en`);
    * Немецкий (`de` или `de_de`);
* на основе `myspell` словарей:
    * Украинский (`ua` или `uk_ua`);
    * Эстонский (`ee` или `et_ee`).

В `myspell` словарях отсутствует грамматическая информация, потому часть функций для этих языков будет недоступна.

#### Опции

##### `@property {Boolean} [nojo=false]`
Используется только при инициализации русского языка. При установке значения в `true`, будет подключён словарь, в котором все буквы `ё` заменены на `е`.

@todo: *ещё не поддерживается. используются словари с буквой `ё`*

##### `@property {String} [storage=Morphy.STORAGE_MEM]`
* `Morphy.STORAGE_FILE` - используются файловые операции. Потребляется небольшое количество памяти. Это самый медленный способ - на каждую операцию производится чтение с диска.
* `Morphy.STORAGE_MEM` - словарь загружается в память при инициализации. Это самый быстрый способ доступа, но при этом словарь загружается для каждого экземпляра класса phpMorphy, что приводит к медленной инициализации библиотеки и большему потреблению памяти. В этом режиме логично инициализировать все необходимые экземпляры библиотеки **при старте приложения**.

##### `@property {Boolean} [predict_by_suffix=true]`
Использовать предсказание путем отсечения префикса. Для распознавания слов, образованных от известных путём прибавления префиксов ('популярный' => 'мегапопулярный' и т.п.).

##### `@property {Boolean} [predict_by_db=true]`
Использовать предсказание по окончанию.

##### `@property {Boolean} [use_ancodes_cache=false]`
Позволяет ускорить процесс получения грамматической информации (увеличивает потребление памяти во время исполнения и замедляет процесс инициализации).

**Обратите внимание!** Кэш анкодов доступен только для русского языка.

##### `@property {Number} [resolve_ancodes=Morphy.RESOLVE_ANCODES_AS_TEXT]`
Устанавливает способ преобразования анкодов.

* `Morphy.RESOLVE_ANCODES_AS_INT` - Используются числовые идентификаторы анкодов;
* `Morphy.RESOLVE_ANCODES_AS_TEXT` - Развертывать анкод в текстовое представление. Формат - ЧАСТЬ_РЕЧИ граммема1, граммема2, и т.д.
* `Morphy.RESOLVE_ANCODES_AS_DIALING` - Анкоды преобразуются к виду используемому в словарях AOT. (двухбуквенное обозначение). Доступно только для русского языка *(если кто сможет собрать под остальные словари - [велкам](https://github.com/antixrist/node-phpmorphy/pulls))*.

#### Методы

##### Сервисные

```javascript
/** @returns {string} */
morphy.getEncoding();
// 'utf-8'
```

Возвращает кодировку загруженного словаря. `windows-1250` для английского или `utf-8` для всех остальных словарей.

***

```javascript
/** @returns {string} */
morphy.getLocale();
```
Возвращает код языка. В формате: *`ISO3166` код страны* + *'_'* + *`ISO639` код языка*.
`ru_RU` или `en_EN` или `uk_UA` и т.д., в зависимости от словаря.

***

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getCommonMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только поиск по словарю.

***

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getPredictBySuffixMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только предсказание путем отсечения префикса.

***

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getPredictByDatabaseMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только предсказание по окончанию.

***

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getBulkMorphier();
```
Возвращает экземпляр `Morphy_Morphier_Bulk` класса. Используется пакетный режим обработки слов, только поиск по словарю.

##### Основные

```javascript
/** @returns {boolean} */
morphy.isLastPredicted();
```
Функция не работает для bulk режима.

Возвращает `true` если при анализе последнего слова выяснилось, что слово отсутствует в словаре и было предсказано. `false` в ином случае.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

// слова ГЛОКАЯ нет в словаре, слово ТЕСТ есть в словаре
log(morphy.lemmatize('ГЛОКАЯ', Morphy.NORMAL));
// 'ГЛОКАЯ'
log(morphy.isLastPredicted());
// TRUE (слово было предсказано)
 
log(morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT)); 
// FALSE
// если предыдущий вызов вернул FALSE, то isLastPredicted() возвращает FALSE
log(morphy.isLastPredicted());
// FALSE

morphy.lemmatize('ТЕСТ', Morphy.NORMAL);
log(morphy.isLastPredicted());
// FALSE (слово ТЕСТ было найдено в словаре)
 
morphy.lemmatize('ТЕСТ', Morphy.ONLY_PREDICT);
log(morphy.isLastPredicted());
// TRUE (был использован режим ONLY_PREDICT соответственно ТЕСТ было предсказано)
```

***

```javascript
/** @returns {String} */
morphy.getLastPredictionType();
```
Возвращает константу определяющую, каким способом было предсказано последнее слово. Функция не работает для bulk режима.

1. `Morphy.PREDICT_BY_NONE`:
    * слово было найдено в словаре, предсказание не использовалось;
    * либо слово отсутствует в словаре и предсказать его не удалось (к примеру, метод `morphy.lemmatize(word)` возвратил `FALSE`);
2. `Morphy.PREDICT_BY_SUFFIX` – слово было предсказано по окончанию;
3. `Morphy.PREDICT_BY_DB` – слово было предсказано по базе окончаний.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

morphy.lemmatize('ТЕСТ', Morphy.NORMAL);
// слово ТЕСТ есть в словаре, предсказание не использовалось.
log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_NONE);
// TRUE
 
morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT);
// слово ГЛОКАЯ отсутствует в  словаре, предсказать не удалось (lemmatize вернул FALSE).
log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_NONE);
// TRUE
 
morphy.lemmatize('ТЕСТДРАЙВ', Morphy.ONLY_PREDICT);
log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_SUFFIX);
// TRUE
 
morphy.lemmatize('ПОДФИГАЧИТЬ', Morphy.ONLY_PREDICT);
log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_DB);
// TRUE
```

***

##### Следующие методы имеют схожую сигнатуру.
   
```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.findWord(word, type);
morphy.lemmatize(word, type);
morphy.getBaseForm(word, type);
morphy.getPseudoRoot(word, type);
morphy.getPartOfSpeech(word, type);
morphy.getAllFormsWithGramInfo(word, type);
// и т.д.
```
Первый параметр `word` может быть:
* строкой. Это слово для анализа. Если слово не было найдено в словаре или предсказано, функция возвращает `FALSE`.
* массивом слов для анализа. Это так называемый `bulk`-режим.
Благодаря некоторым оптимизациям внутри кода, позволяет увеличить скорость обработки слов на ~50%. В данном режиме функция возвращает массив, в качестве ключа выступает исходное слово, соответствующее значение – результат.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

const words = ['СОБАКА', 'КОШКА'];
const result = {};

words.forEach(word => result[word] = morphy.lemmatize(word));

log(result);
// { 'СОБАКА': [ 'СОБАКА' ], 'КОШКА': [ 'КОШКА' ] }
```
`result` можно получить на 50% быстрее в `bulk`-режиме:
```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

const words = ['СОБАКА', 'КОШКА'];
const result = morphy.lemmatize(words);
log(result);
// { 'СОБАКА': [ 'СОБАКА' ], 'КОШКА': [ 'КОШКА' ] }
```

Следует заметить, что `morphy.getLastPredictionType()` и `morphy.isLastPredicted()` не работают в `bulk`-режиме.

Второй параметр `type` – указывает порядок обработки для конкретного слова (списка слов в `bulk`-режиме). Может принимать значения:

* `Morphy.NORMAL` – значение по умолчанию. В этом режиме обработка слова производится в следующем порядке:
    * идет поиск в словаре;
    * если в словаре слово не найдено, то пытаемся предсказать в соответствии с настройками предсказания при инициализации (опции `predict_by_suffix` и `predict_by_db`);
    * если предсказать не удалось, возвращаем FALSE.
* `Morphy.IGNORE_PREDICT` – отключает предсказание. Т.е. поиск слова идет только по словарю. Если слова в словаре нет, возвращает FALSE
* `Morphy.ONLY_PREDICT` – отключает поиск по словарю. Используется только предсказание, в соответствии с настройками предсказания при инициализации. Если предсказать не удалось (к примеру, `predict_by_suffix` и `predict_by_db` установлены в false) возвращаем FALSE.

***

Далее будут описаны только уникальные свойства для каждого метода, на основе одиночного режима (для `bulk`-режима результат помещается в массив).

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.findWord(word, type);
```
Производит анализ слова, возвращает коллекцию типа `Morphy_WordDescriptor_Collection`.
Используется для детального анализа слов.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

const word = 'ДУША';
const paradigms = morphy.findWord(word);

if (!paradigms) {
  throw new Error('Can`t find word');
}

// paradigms instanceof Morphy_WordDescriptor_Collection

// получить только существительные можно при помощи
paradigms.getByPartOfSpeech('С').forEach(paradigm => {
  // paradigm instanceof Morphy_WordDescriptor
  
  log('Существительное:', paradigm.getBaseForm());
});


// обрабатываем омонимы
paradigms.getByPartOfSpeech('С').forEach(paradigm => {
  // paradigm instanceof Morphy_WordDescriptor
  log('Лемма:', paradigm.getBaseForm());
  log('Все формы:', paradigm.getAllForms().join(',', ));
  
  // информация об искомом слове, т.к. в парадигме словоформы могут повторятся
  const found_forms = paradigm.getFoundWordForm();
  found_forms.forEach(found_form => {
    log(found_form.getWord(), found_form.getPartOfSpeech(), found_form.getGrammems().join(','));
  });
  
  if (paradigm.hasGrammems('НО')) {
    log('word - неодушевлённое');
  }
  
  // количество форм в именительном падеже
  log(paradigm.getWordFormsByGrammems('ИМ').length);
  
  // аналогично используется hasPartOfSpeech, getWordFormsByPartOfSpeech
  
  // Все формы с грамматической информацией
  paradigm.forEach(form => {
    log(form.getWord());
    // есть граммема ИМ?
    if (form.hasGrammems('ИМ')) {
      // TRUE
      log('именительный');
    } else
    // у формы должны присутствовать граммемы ЕД и РД
    if (form.hasGrammems(['ЕД', 'РД'])) {
      log('родительный, единственное число');
    } else {
      log(form.getPartOfSpeech(), form.getGrammems().join(','));
    }
  });
});
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.lemmatize(word, type);
```
Возвращает лемму (базовую форму) слова. Из-за присутствия омонимии, результат возвращается в виде массива. Т.е. метод возвращает леммы для всех слов, из которых может быть образована искомая словоформа.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.lemmatize('КОЛБАСЫ')); // [ 'КОЛБАСА' ]
log(morphy.lemmatize('ТЕСТ')); // [ 'ТЕСТ', 'ТЕСТО' ]

// ТЕСТ отождествляется с формами слов
// ТЕСТ – единственное число, именительный, винительный падежи
// ТЕСТО – множественное число, родительный падеж
log(morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT)); // FALSE

log(morphy.lemmatize(['КОЛБАСЫ', 'ТЕСТ', 'ГЛОКАЯ'], Morphy.IGNORE_PREDICT));
// {
//   'ТЕСТ': [ 'ТЕСТ', 'ТЕСТО' ],
//   'КОЛБАСЫ': [ 'КОЛБАСА' ],
//   'ГЛОКАЯ': false
// }
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getBaseForm(word, type);
```
Это синоним для метода `lemmatize`.

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAllForms(word, type);
```
Возвращает список всех форм (в виде массива) для слова. Если word отождествляется с формами разных слов, словоформы для каждого слова сливаются в один массив.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.getAllForms('ТЕСТ'));
// все формы для слов ТЕСТ и ТЕСТО:
// [ 'ТЕСТ', 'ТЕСТА', 'ТЕСТУ', 'ТЕСТОМ', 'ТЕСТЕ', 'ТЕСТЫ', 'ТЕСТОВ', 'ТЕСТАМ', 'ТЕСТАМИ', 'ТЕСТАХ', 'ТЕСТО' ]
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {String}
 */
morphy.getPseudoRoot(word, type);
```
Возвращает общую часть для всех словоформ заданного слова. Общая часть может быть пустой (к примеру, для слова ДЕТИ). Этот метод не возвращает корень слова в привычном его понимании (только *longest common substring* для всех словоформ). Всегда возвращает строку (не массив!).

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.getPseudoRoot('ТЕСТ')); // [ 'ТЕСТ' ]
log(morphy.getPseudoRoot('ДЕТЕЙ')); // [ '' ]
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getPartOfSpeech(word, type);
```
Возвращает часть речи для заданного слова. Т.к. словоформа может образовываться от нескольких слов, метод возвращает массив. Возвращаемое значение зависит от опции инициализации `graminfo_as_text`. Если `graminfo_as_text == true` часть речи представляется в текстовом виде, иначе в виде значения константы (*эта возможность отключена*).

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

// ТЕСТ образовывается от ТЕСТ и ТЕСТО, однако оба слова являются существительными
log(morphy.getPartOfSpeech('ТЕСТ')); // [ 'С' ]

// ДУША образовывается от ДУШ, ДУША и ДУШИТЬ
log(morphy.getPartOfSpeech('ДУША')); // [ 'С', 'ДЕЕПРИЧАСТИЕ' ]
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Boolean} [asText=true]
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAllFormsWithGramInfo(word, asText, type);
```
Данный метод рекомендуется использовать только для отладки. Для анализа используйте метод `findWord()`.
Если `asText == true` грамматическая информация возвращается в виде строки, иначе в виде массива:

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.getAllFormsWithGramInfo('ТЕСТ', true));
/*
[
  // омоним №1
  {
    all:    [
      // массив содержит часть речи и граммемы для каждой
      // формы из 'forms'. Граммемы разделены запятой.
      // Часть речи отделена от граммем пробелом.
      'С ЕД,ИМ,МР,НО',
      'С ВН,ЕД,МР,НО',
      'С ЕД,МР,НО,РД',
      'С ДТ,ЕД,МР,НО',
      'С ЕД,МР,НО,ТВ',
      'С ЕД,МР,НО,ПР',
      'С ИМ,МН,МР,НО',
      'С ВН,МН,МР,НО',
      'С МН,МР,НО,РД',
      'С ДТ,МН,МР,НО',
      'С МН,МР,НО,ТВ',
      'С МН,МР,НО,ПР'
    ],
    forms:  [
      'ТЕСТ',
      'ТЕСТ',
      'ТЕСТА',
      'ТЕСТУ',
      'ТЕСТОМ',
      'ТЕСТЕ',
      'ТЕСТЫ',
      'ТЕСТЫ',
      'ТЕСТОВ',
      'ТЕСТАМ',
      'ТЕСТАМИ',
      'ТЕСТАХ'
    ],
    common: ''
  },
  // омоним №2
  {
    all:    [
      'С ЕД,ИМ,НО,СР',
      'С ВН,ЕД,НО,СР',
      'С ЕД,НО,РД,СР',
      'С ИМ,МН,НО,СР',
      'С ВН,МН,НО,СР',
      'С ДТ,ЕД,НО,СР',
      'С ЕД,НО,СР,ТВ',
      'С ЕД,НО,ПР,СР',
      'С МН,НО,РД,СР',
      'С ДТ,МН,НО,СР',
      'С МН,НО,СР,ТВ',
      'С МН,НО,ПР,СР'
    ],
    forms:  [
      'ТЕСТО',
      'ТЕСТО',
      'ТЕСТА',
      'ТЕСТА',
      'ТЕСТА',
      'ТЕСТУ',
      'ТЕСТОМ',
      'ТЕСТЕ',
      'ТЕСТ',
      'ТЕСТАМ',
      'ТЕСТАМИ',
      'ТЕСТАХ'
    ],
    common: ''
  }
]
*/

log(morphy.getAllFormsWithGramInfo('ТЕСТ', false));
/*
[
  // омоним №1
  {
    all:    [
      {pos: 'С', grammems: ['ЕД', 'ИМ', 'МР', 'НО']},
      {pos: 'С', grammems: ['ВН', 'ЕД', 'МР', 'НО']},
      {pos: 'С', grammems: ['ЕД', 'МР', 'НО', 'РД']},
      {pos: 'С', grammems: ['ДТ', 'ЕД', 'МР', 'НО']},
      {pos: 'С', grammems: ['ЕД', 'МР', 'НО', 'ТВ']},
      {pos: 'С', grammems: ['ЕД', 'МР', 'НО', 'ПР']},
      {pos: 'С', grammems: ['ИМ', 'МН', 'МР', 'НО']},
      {pos: 'С', grammems: ['ВН', 'МН', 'МР', 'НО']},
      {pos: 'С', grammems: ['МН', 'МР', 'НО', 'РД']},
      {pos: 'С', grammems: ['ДТ', 'МН', 'МР', 'НО']},
      {pos: 'С', grammems: ['МН', 'МР', 'НО', 'ТВ']},
      {pos: 'С', grammems: ['МН', 'МР', 'НО', 'ПР']}
    ],
    forms:  [
      'ТЕСТ',
      'ТЕСТ',
      'ТЕСТА',
      'ТЕСТУ',
      'ТЕСТОМ',
      'ТЕСТЕ',
      'ТЕСТЫ',
      'ТЕСТЫ',
      'ТЕСТОВ',
      'ТЕСТАМ',
      'ТЕСТАМИ',
      'ТЕСТАХ'
    ],
    common: ''
  },
  // омоним №2
  {
    all:    [
      {pos: 'С', grammems: ['ЕД', 'ИМ', 'НО', 'СР']},
      {pos: 'С', grammems: ['ВН', 'ЕД', 'НО', 'СР']},
      {pos: 'С', grammems: ['ЕД', 'НО', 'РД', 'СР']},
      {pos: 'С', grammems: ['ИМ', 'МН', 'НО', 'СР']},
      {pos: 'С', grammems: ['ВН', 'МН', 'НО', 'СР']},
      {pos: 'С', grammems: ['ДТ', 'ЕД', 'НО', 'СР']},
      {pos: 'С', grammems: ['ЕД', 'НО', 'СР', 'ТВ']},
      {pos: 'С', grammems: ['ЕД', 'НО', 'ПР', 'СР']},
      {pos: 'С', grammems: ['МН', 'НО', 'РД', 'СР']},
      {pos: 'С', grammems: ['ДТ', 'МН', 'НО', 'СР']},
      {pos: 'С', grammems: ['МН', 'НО', 'СР', 'ТВ']},
      {pos: 'С', grammems: ['МН', 'НО', 'ПР', 'СР']}
    ],
    forms:  [
      'ТЕСТО',
      'ТЕСТО',
      'ТЕСТА',
      'ТЕСТА',
      'ТЕСТА',
      'ТЕСТУ',
      'ТЕСТОМ',
      'ТЕСТЕ',
      'ТЕСТ',
      'ТЕСТАМ',
      'ТЕСТАМИ',
      'ТЕСТАХ'
    ],
    common: ''
  }
]
*/
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAllFormsWithAncodes(word, type);
```
Вывод похож на `getAllFormsWithGramInfo()`, но грамматическая информация возвращается в виде анкодов (согласно опции `resolve_ancodes`). Если `resolve_ancodes == Morphy.RESOLVE_ANCODES_AS_TEXT` (по умолчанию), то вывод аналогичен `morphy.getAllFormsWithGramInfo(word, true)`.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

let morphy;

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT // <==
});

log(morphy.getAllFormsWithAncodes('Я'));
/*
[
  {
    all:    [
      'МС 1Л,ЕД,ИМ',
      'МС 1Л,ЕД,РД',
      'МС 1Л,ЕД,ВН',
      'МС 1Л,ЕД,ДТ',
      'МС 1Л,ЕД,ПР',
      'МС 1Л,ЕД,ТВ',
      'МС 1Л,ЕД,ТВ'
    ],
    forms:  ['Я', 'МЕНЯ', 'МЕНЯ', 'МНЕ', 'МНЕ', 'МНОЙ', 'МНОЮ'],
    common: null
  }
]
*/

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_INT // <==
});

log(morphy.getAllFormsWithAncodes('Я'));
/*
[
  {
    all:    [471, 472, 474, 473, 476, 475, 475],
    forms:  ['Я', 'МЕНЯ', 'МЕНЯ', 'МНЕ', 'МНЕ', 'МНОЙ', 'МНОЮ'],
    common: null
  }
]
*/

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_DIALING // <==
});

log(morphy.getAllFormsWithAncodes('Я'));
/*
[
  {
    all:    ['ча', 'чб', 'чг', 'чв', 'че', 'чд', 'чд'],
    forms:  ['Я', 'МЕНЯ', 'МЕНЯ', 'МНЕ', 'МНЕ', 'МНОЙ', 'МНОЮ'],
    common: null
  }
]
*/
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAncode(word, type);
```
Возвращает анкоды для слова.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

let morphy;

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT // <==
});

log(morphy.getAncode('ТЕСТ'));
/*
[
  {common: ' НО', all: ['С МР,ЕД,ИМ', 'С МР,ЕД,ВН']},
  {common: ' НО', all: ['С СР,МН,РД']}
]
*/

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_INT // <==
});

log(morphy.getAncode('ТЕСТ'));
/*
[
  {common: 687, all: [0, 4]},
  {common: 687, all: [115]}
]
*/

morphy = new Morphy('ru', {
  resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_DIALING // <==
});

log(morphy.getAncode('ТЕСТ'));
/*
[
  {common: 'Фа', all: ['аа', 'аг']},
  {common: 'Фа', all: ['ез']}
]
*/
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getGramInfo(word, type);
```
Возвращает грамматическую информацию для слова
```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.getGramInfo('ТЕСТ'));
/*
[
  [
    {pos: 'С', grammems: ['ВН', 'ЕД', 'МР', 'НО'], form_no: 0},
    {pos: 'С', grammems: ['ЕД', 'ИМ', 'МР', 'НО'], form_no: 0}
  ],
  [{pos: 'С', grammems: ['МН', 'НО', 'РД', 'СР'], form_no: 5}]
]
*/
```

***

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getGramInfoMergeForms(word, type);
```
Вывод аналогичен getGramInfo, но если внутри одной парадигмы найдено несколько слов, граммемы сливаются в один массив.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.getGramInfoMergeForms('ТЕСТ'));

/*
[
  {
    pos:          'С',
    grammems:     ['ВН', 'ЕД', 'ИМ', 'МР', 'НО'],
    forms_count:  2,
    form_no_low:  0,
    form_no_high: 2
  },
  {
    pos:          'С',
    grammems:     ['МН', 'НО', 'РД', 'СР'],
    forms_count:  1,
    form_no_low:  5,
    form_no_high: 6
  }
]
*/
```
Обратите внимание, граммемы `ИМ` и `ВН` для парадигмы слова `ТЕСТ` (не `ТЕСТО`) объединены в один массив, в отличие от `getGramInfo()`.

***

```javascript
  /**
   * @param {string} word
   * @param {*} partOfSpeech
   * @param {[]} grammems
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @param {*} [type=NORMAL]
   * @return {[]|boolean}
   */
morphy.castFormByGramInfo(word, partOfSpeech, grammems, returnOnlyWord = false, callback = null);
```
Приводит слово в заданную форму. partOfSpeech – необходим только для прилагательных и глаголов т.к. только для этих частей речи внутри парадигмы встречаются различные части речи. Если partOfSpeech == null, часть речи не используется.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

const word = 'ШКАФ';
 
// поставим слово ШКАФ в множественное число, предложный падеж
log(morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], false));
/*
[
  {
    form:     'ШКАФАХ',
    form_no:  12,
    pos:      'С',
    grammems: ['МР', 'МН', 'ПР', 'НО']
  }
]
*/
 
// возвращает только слово, без грамматической информации
log(morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], true));
// [ 'ШКАФАХ' ]
 
// применим пользовательский фильтр
// фильтр – предикат (функция возвращающая true/false) со следующей сигнатурой:
// function XXX(form, partOfSpeech, grammems, formNo)
// если функция возвращает TRUE, то исходное слово приводится в данную форму
// callback – обычная функция обратного вызова 
function cast_predicate (form, partOfSpeech, grammems, formNo) {
    return grammems.includes('ИМ'); 
}
 
// приведём ШКАФ в именительный падеж
log(morphy.castFormByGramInfo(word, null, null, true, cast_predicate));
// [ 'ШКАФ', 'ШКАФЫ' ]
 
// выберем краткое прилагательное единственного числа, женского рода.
// если не указать часть речи, будут выбраны все прилагательные единственного числа, женского рода
log(morphy.castFormByGramInfo('КРАСНЫЙ', 'КР_ПРИЛ', ['ЕД', 'ЖР'], true));
// [ 'КРАСНА' ]
```

***

```javascript
  /**
   * @param {string} word
   * @param {string} patternWord
   * @param {Morphy_GrammemsProvider_Interface} [grammemsProvider=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=false]
   * @param {*} [type=NORMAL]
   * @return {[]|boolean}
   */
morphy.castFormByPattern (word, patternWord, grammemsProvider, returnOnlyWord, callback, type);
```
Приводит слово word в форму, в которой стоит слово patternWord.

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.castFormByPattern('ДИВАН', 'СТОЛАМИ', null, true)); 
// [ 'ДИВАНАМИ' ]
```

Сложность возникает, если некоторые граммемы у слов не совпадают. Т.к. данная функция ищет в парадигме слова `word` форму, у которой граммемы совпадают с граммемами `patternWord`, то в таких случаях на выходе получим пустой результат. Например, `ДИВАН` и `КРОВАТЬ` имеют разный род (мужской и женский соответственно).

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

log(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true));
// []
```

Нам требуется указать, что род сравнивать не нужно. Можно это сделать следующим способом:

```javascript
const { inspect } = require('util');
function log (...args) { console.log(...args.map(arg => inspect(arg))); }

const provider = morphy.getGrammemsProvider();
provider.excludeGroups('С', 'род');
/*
указываем, что для существительных род сравнивать не будем.
 
Первым параметром указывается часть речи, для которой требуется внести изменения
Вторым - группу граммем, которую необходимо исключить, может принимать следующие значения:
1)  род
2)  одушевленность 
3)  число 
4)  падеж 
5)  залог 
6)  время 
7)  повелительная форма 
8)  лицо
9)  сравнительная форма 
10) превосходная степень
11) вид
12) переходность
13) безличный глагол
 
следует помнить, что все данные должны быть в кодировке словаря
*/
log(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', provider, true));
// [ 'ДИВАНАМИ' ]
log(morphy.castFormByPattern('КРЕСЛО', 'СТУЛЬЯМИ', provider, true));
// [ 'КРЕСЛАМИ' ]

// Чтобы не передавать provider каждый раз, можно сделать изменения глобально
morphy.getDefaultGrammemsProvider().excludeGroups('С', 'род');
log(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true)); 
// [ 'ДИВАНАМИ' ]
```

***

```javascript
  /**
   * @param {string} word
   * @param {*} ancode
   * @param {*} [commonAncode=null]
   * @param {boolean} [returnOnlyWord=false]
   * @param {*} [callback=null]
   * @param {*} [type=NORMAL]
   * @return {[]}
   */
morphy.castFormByAncode (word, ancode, commonAncode, returnOnlyWord, callback, type);
```
Аналогично `castFormByGramInfo`, но грамматическая информация указывается в виде анкода (согласно опции `resolve_ancodes`).
