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
Для работы библиотеки необходимы node@5.10.0 или выше, npm@3 или выше.

## Установка
С помощью `npm`
```
npm install phpmorphy --save
```

С помощью `yarn`
```
yarn add phpmorphy
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
  nojo: false,
  storage: Morphy.STORAGE_FILE
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

**Обратите внимание!** Кэш анкодов доступен только для русского языка. Библиотека выбросит исключение, если включить эту опцию для других языков.

##### `@property {Number} [resolve_ancodes=Morphy.RESOLVE_ANCODES_AS_TEXT]`
Устанавливает способ преобразования анкодов.

* `Morphy.RESOLVE_ANCODES_AS_INT` - Используются числовые идентификаторы анкодов;
* `Morphy.RESOLVE_ANCODES_AS_DIALING` - Анкоды преобразуются к виду используемому в словарях AOT. (двухбуквенное обозначение);
* `Morphy.RESOLVE_ANCODES_AS_TEXT` - Развертывать анкод в текстовое представление. Формат - ЧАСТЬ_РЕЧИ граммема1, граммема2, и т.д.

#### Методы

##### Сервисные

```javascript
/** @returns {string} */
morphy.getEncoding();
```

Возвращает кодировку загруженного словаря. `windows-1250` для английского или `utf-8` для всех остальных словарей.

**

```javascript
/** @returns {string} */
morphy.getLocale();
```
Возвращает код языка. В формате `ISO3166` код страны, символ '_', `ISO639` код языка.
`ru_RU` или `en_EN` или `uk_UA` и т.д., в зависимости от словаря.

** 

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getCommonMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только поиск по словарю.

** 

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getPredictBySuffixMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только предсказание путем отсечения префикса.

**

```javascript
/** @returns {Morphy_Morphier_Interface} */
morphy.getPredictByDatabaseMorphier();
```
Возвращает экземпляр класса реализующий `Morphy_Morphier_Interface` интерфейс. Используется только предсказание по окончанию.

**

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
// слова ГЛОКАЯ нет в словаре, слово ТЕСТ есть в словаре
console.log(morphy.lemmatize('ГЛОКАЯ', Morphy.NORMAL)); // ГЛОКАЯ
console.log(morphy.isLastPredicted()); // TRUE - слово было предсказано
 
// FALSE
console.log(morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT)); 
// если предыдущий вызов вернул FALSE, то isLastPredicted() возвращает FALSE
console.log(morphy.isLastPredicted()); // FALSE
 
morphy.lemmatize('ТЕСТ', Morphy.NORMAL);
console.log(morphy.isLastPredicted()); // FALSE
// слово ТЕСТ было найдено в словаре
 
morphy.lemmatize('ТЕСТ', Morphy.ONLY_PREDICT);
console.log(morphy.isLastPredicted()); // TRUE
// был использован режим ONLY_PREDICT соответственно ТЕСТ было предсказано
```

**

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
morphy.lemmatize('ТЕСТ', Morphy.NORMAL);
// слово ТЕСТ есть в словаре, предсказание не использовалось.
console.log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_NONE); // TRUE
 
morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT);
// слово ГЛОКАЯ отсутствует в  словаре, предсказать не удалось (lemmatize вернул FALSE).
console.log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_NONE); // TRUE
 
morphy.lemmatize('ТЕСТДРАЙВ', Morphy.ONLY_PREDICT);
console.log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_SUFFIX); // TRUE
 
morphy.lemmatize('ПОДФИГАЧИТЬ', Morphy.ONLY_PREDICT);
console.log(morphy.getLastPredictionType() == Morphy.PREDICT_BY_DB); // TRUE
```

**

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
const words = ['СОБАКА', 'КОШКА'];
const result = {};

words.forEach(word => result[word] = morphy.lemmatize(word));

console.log(result);
```
`result` можно получить на 50% быстрее в `bulk`-режиме:
```javascript
const words = ['СОБАКА', 'КОШКА'];
const result = morphy.lemmatize(words);
console.log(result);
```

Следует заметить, что `morphy.getLastPredictionType()` и `morphy.isLastPredicted()` не работают в `bulk`-режиме.

Второй параметр `type` – указывает порядок обработки для конкретного слова (списка слов в `bulk`-режиме). Может принимать значения:
* `Morphy.NORMAL` – значение по умолчанию. В этом режиме обработка слова производится в следующем порядке:
    * идет поиск в словаре;
    * если в словаре слово не найдено, то пытаемся предсказать в соответствии с настройками предсказания при инициализации (опции `predict_by_suffix` и `predict_by_db`);
    * если предсказать не удалось, возвращаем FALSE.
* `Morphy.IGNORE_PREDICT` – отключает предсказание. Т.е. поиск слова идет только по словарю. Если слова в словаре нет, возвращает FALSE
* `Morphy.ONLY_PREDICT` – отключает поиск по словарю. Используется только предсказание, в соответствии с настройками предсказания при инициализации. Если предсказать не удалось (к примеру, `predict_by_suffix` и `predict_by_db` установлены в false) возвращаем FALSE.

**

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
const word = 'ДУША';
const paradigms = morphy.findWord(word);

if (!paradigms) {
    throw new Error('Can`t find word');
}

// paradigms instanceof Morphy_WordDescriptor_Collection

const log = console.log.bind(console);

// получить только существительные можно при помощи
paradigms.getByPartOfSpeech('С').forEach(paradigm => {
    // paradigm instanceof Morphy_WordDescriptor
    log('Существительное ', paradigm.getBaseForm())
});


// обрабатываем омонимы
paradigms.getByPartOfSpeech('С').forEach(paradigm => {
    // paradigm instanceof Morphy_WordDescriptor
    log('Лемма: ', paradigm.getBaseForm());
    log('Все формы: ', paradigm.getAllForms().join(',', ));
    
    // информация об искомом слове, т.к. в парадигме словоформы могут повторятся
    const found_forms = paradigm.getFoundWordForm();
    found_forms.forEach(found_form => {
        log(found_form.getWord(), ' - ', found_form.getPartOfSpeech(), ' ', found_form.getGrammems().join(','));
    });
    
    if (paradigm.hasGrammems('НО')) {
        log('word - неодушевлённое');
    }
    
    log('форм в именительном падеже = ', paradigm.getWordFormsByGrammems('ИМ').length);
    
    // аналогично используется hasPartOfSpeech, getWordFormsByPartOfSpeech
    
    log('Все формы с грамматической информацией');
    paradigm.forEach(form => {
        log(form.getWord(), ':');
    
        // есть граммема ИМ?
        if (form.hasGrammems('ИМ')) {
            log('именительный');
        } else
        // у формы должны присутствовать граммемы ЕД и РД
        if (form.hasGrammems(['ЕД', 'РД'])) {
            log('родительный, единственное число');
        } else {
            log(form.getPartOfSpeech(), ' ', form.getGrammems().join(','));
        }
    
        log('\n');
    });
});
```

**

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
const log = console.log.bind(console);


log(inspect(morphy.lemmatize('КОЛБАСЫ'))); // ['КОЛБАСА']
log(inspect(morphy.lemmatize('ТЕСТ'))); // ['ТЕСТ', 'ТЕСТО']

// ТЕСТ отождествляется с формами слов
// ТЕСТ – единственное число, именительный, винительный падежи
// ТЕСТО – множественное число, родительный падеж
log(inspect(morphy.lemmatize('ГЛОКАЯ', Morphy.IGNORE_PREDICT))); // FALSE
 
log(inspect(morphy.lemmatize(['КОЛБАСЫ', 'ТЕСТ', 'ГЛОКАЯ'], Morphy.IGNORE_PREDICT)));
// {
//	'КОЛБАСЫ': ['КОЛБАСА'],
//	'ТЕСТ': ['ТЕСТ', 'ТЕСТО'],
//	'ГЛОКАЯ': false
// }
```

**

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getBaseForm(word, type);
```
Это синоним для метода `lemmatize`.

**

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
const result = morphy.getAllForms('ТЕСТ');
// В result помещаются все формы для слов ТЕСТ и ТЕСТО
```

**

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
const log = console.log.bind(console);

log(inspect(morphy.getPseudoRoot('ТЕСТ'))); // 'ТЕСТ'
log(inspect(morphy.getPseudoRoot('ДЕТЕЙ'))); // ''
```

**

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
const log = console.log.bind(console);

// ТЕСТ образовывается от ТЕСТ и ТЕСТО, однако оба слова являются существительными
log(inspect(morphy.getPartOfSpeech('ТЕСТ'))); // ['С']

// ДУША образовывается от ДУШ, ДУША и ДУШИТЬ
log(inspect(morphy.getPartOfSpeech('ДУША'))); // ['С', 'ДЕЕПРИЧАСТИЕ']
```

**

```javascript
/**
 * @param {String|String[]} word
 * @param {Boolean} [asText=true]
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAllFormsWithGramInfo(word, asText, type);
```
Возвращает массив в формате
```json5
[
	// омоним №1
	{
		forms: [],
		all: [
			// массив содержит часть речи и граммемы для каждой формы из 'forms'. Граммемы разделены запятой. Часть речи отделена от граммем пробелом.
			// например: ПРИЧАСТИЕ ДСТ,ЕД,ИМ,МР,НО,НП,ОД,ПРШ,СВ
		],
  		common: 'строка содержащая общие для всех форм граммемы'
    }
]
```
Данный метод рекомендуется использовать только для отладки. Для анализа используйте метод `findWord()`.

Если `asText = true` грамматическая информация возвращается в виде строки, как описано выше.
Иначе в виде массива:
```json5
{
    pos: 'часть речи',
    grammems: ['массив граммем']
}
```


```javascript
const { inspect } = require('util');
const log = console.log.bind(console);
log(inspect(morphy.getAllFormsWithGramInfo('ТЕСТ', true)));

// @todo:
/*
Результат:
array(2) {
  [0]=>
  array(3) {
    ["forms"]=>
    array(12) {
      [0]=>
      string(4) "ТЕСТ"
      [1]=>
      string(4) "ТЕСТ"
      [2]=>
      string(5) "ТЕСТА"
      [3]=>
      string(5) "ТЕСТУ"
      [4]=>
      string(6) "ТЕСТОМ"
      [5]=>
      string(5) "ТЕСТЕ"
      [6]=>
      string(5) "ТЕСТЫ"
      [7]=>
      string(5) "ТЕСТЫ"
      [8]=>
      string(6) "ТЕСТОВ"
      [9]=>
      string(6) "ТЕСТАМ"
      [10]=>
      string(7) "ТЕСТАМИ"
      [11]=>
      string(6) "ТЕСТАХ"
    }
    ["all"]=>
    array(12) {
      [0]=>
      string(13) "С ЕД,ИМ,МР,НО"
      [1]=>
      string(13) "С ВН,ЕД,МР,НО"
      [2]=>
      string(13) "С ЕД,МР,НО,РД"
      [3]=>
      string(13) "С ДТ,ЕД,МР,НО"
      [4]=>
      string(13) "С ЕД,МР,НО,ТВ"
      [5]=>
      string(13) "С ЕД,МР,НО,ПР"
      [6]=>
      string(13) "С ИМ,МН,МР,НО"
      [7]=>
      string(13) "С ВН,МН,МР,НО"
      [8]=>
      string(13) "С МН,МР,НО,РД"
      [9]=>
      string(13) "С ДТ,МН,МР,НО"
      [10]=>
      string(13) "С МН,МР,НО,ТВ"
      [11]=>
      string(13) "С МН,МР,НО,ПР"
    }
    ["common"]=>
    string(0) ""
  }
  [1]=>
  array(3) {
    ["forms"]=>
    array(12) {
      [0]=>
      string(5) "ТЕСТО"
      [1]=>
      string(5) "ТЕСТО"
      [2]=>
      string(5) "ТЕСТА"
      [3]=>
      string(5) "ТЕСТА"
      [4]=>
      string(5) "ТЕСТА"
      [5]=>
      string(5) "ТЕСТУ"
      [6]=>
      string(6) "ТЕСТОМ"
      [7]=>
      string(5) "ТЕСТЕ"
      [8]=>
      string(4) "ТЕСТ"
      [9]=>
      string(6) "ТЕСТАМ"
      [10]=>
      string(7) "ТЕСТАМИ"
      [11]=>
      string(6) "ТЕСТАХ"
    }
    ["all"]=>
    array(12) {
      [0]=>
      string(13) "С ЕД,ИМ,НО,СР"
      [1]=>
      string(13) "С ВН,ЕД,НО,СР"
      [2]=>
      string(13) "С ЕД,НО,РД,СР"
      [3]=>
      string(13) "С ИМ,МН,НО,СР"
      [4]=>
      string(13) "С ВН,МН,НО,СР"
      [5]=>
      string(13) "С ДТ,ЕД,НО,СР"
      [6]=>
      string(13) "С ЕД,НО,СР,ТВ"
      [7]=>
      string(13) "С ЕД,НО,ПР,СР"
      [8]=>
      string(13) "С МН,НО,РД,СР"
      [9]=>
      string(13) "С ДТ,МН,НО,СР"
      [10]=>
      string(13) "С МН,НО,СР,ТВ"
      [11]=>
      string(13) "С МН,НО,ПР,СР"
    }
    ["common"]=>
    string(0) ""
  }
}
*/
```

**

```javascript
/**
 * @param {String|String[]} word
 * @param {Number} [type=Morphy.NORMAL]
 * @returns {*}
 */
morphy.getAllFormsWithAncodes(word, type);
```
Вывод похож на `getAllFormsWithGramInfo()`, но грамматическая информация возвращается в виде анкодов (согласно опции `resolve_ancodes`). Если `resolve_ancodes == Morphy.RESOLVE_ANCODES_AS_TEXT` вывод аналогичен `morphy.getAllFormsWithGramInfo(word, true)`.

```javascript
const { inspect } = require('util');
const log = console.log.bind(console);
const opts = {
    resolve_ancode: Morphy.RESOLVE_ANCODES_AS_TEXT,
    // ...
};
const morphy = new Morphy('ru', opts);

log(inspect(morphy.getAllFormsWithAncodes('Я')));

// @todo:
/*
Результат:
array(1) {
  [0]=>
  array(3) {
    ["forms"]=>
    array(7) {
      [0]=>
      string(1) "Я"
      [1]=>
      string(4) "МЕНЯ"
      [2]=>
      string(4) "МЕНЯ"
      [3]=>
      string(3) "МНЕ"
      [4]=>
      string(3) "МНЕ"
      [5]=>
      string(4) "МНОЙ"
      [6]=>
      string(4) "МНОЮ"
    }
    ["common"]=>
    NULL
    ["all"]=>
    array(7) {
      [0]=>
      string(11) "МС 1Л,ЕД,ИМ"
      [1]=>
      string(11) "МС 1Л,ЕД,РД"
      [2]=>
      string(11) "МС 1Л,ЕД,ВН"
      [3]=>
      string(11) "МС 1Л,ЕД,ДТ"
      [4]=>
      string(11) "МС 1Л,ЕД,ПР"
      [5]=>
      string(11) "МС 1Л,ЕД,ТВ"
      [6]=>
      string(11) "МС 1Л,ЕД,ТВ"
    }
  }
}
*/
```

**

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
const log = console.log.bind(console);

log(inspect(morphy.getAncode('ТЕСТ')));

// @todo:
/*
Результат:
array(2) {
  [0]=>
  array(2) {
    ["common"]=>
    string(3) " НО"
    ["all"]=>
    array(2) {
      [0]=>
      string(10) "С МР,ЕД,ИМ"
      [1]=>
      string(10) "С МР,ЕД,ВН"
    }
  }
  [1]=>
  array(2) {
    ["common"]=>
    string(3) " НО"
    ["all"]=>
    array(1) {
      [0]=>
      string(10) "С СР,МН,РД"
    }
  }
}
*/
```
**

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
const log = console.log.bind(console);

log(inspect(morphy.getGramInfo('ТЕСТ')));

// @todo:
/*
Результат:
array(2) {
  [0]=>
  array(2) {
    [0]=>
    array(3) {
      ["pos"]=>
      string(1) "С"
      ["grammems"]=>
      array(4) {
        [0]=>
        string(2) "ВН"
        [1]=>
        string(2) "ЕД"
        [2]=>
        string(2) "МР"
        [3]=>
        string(2) "НО"
      }
      ["form_no"]=>
      int(0)
    }
    [1]=>
    array(3) {
      ["pos"]=>
      string(1) "С"
      ["grammems"]=>
      array(4) {
        [0]=>
        string(2) "ЕД"
        [1]=>
        string(2) "ИМ"
        [2]=>
        string(2) "МР"
        [3]=>
        string(2) "НО"
      }
      ["form_no"]=>
      int(0)
    }
  }
  [1]=>
  array(1) {
    [0]=>
    array(3) {
      ["pos"]=>
      string(1) "С"
      ["grammems"]=>
      array(4) {
        [0]=>
        string(2) "МН"
        [1]=>
        string(2) "НО"
        [2]=>
        string(2) "РД"
        [3]=>
        string(2) "СР"
      }
      ["form_no"]=>
      int(5)
    }
  }
}
*/
```

**

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
const log = console.log.bind(console);

log(inspect(morphy.getGramInfoMergeForms('ТЕСТ')));

// @todo:
/*
Результат:
array(2) {
  [0]=>
  array(5) {
    ["pos"]=>
    string(1) "С"
    ["grammems"]=>
    array(5) {
      [0]=>
      string(2) "ВН"
      [1]=>
      string(2) "ЕД"
      [2]=>
      string(2) "ИМ"
      [3]=>
      string(2) "МР"
      [4]=>
      string(2) "НО"
    }
    ["forms_count"]=>
    int(2)
    ["form_no_low"]=>
    int(0)
    ["form_no_high"]=>
    int(2)
  }
  [1]=>
  array(5) {
    ["pos"]=>
    string(1) "С"
    ["grammems"]=>
    array(4) {
      [0]=>
      string(2) "МН"
      [1]=>
      string(2) "НО"
      [2]=>
      string(2) "РД"
      [3]=>
      string(2) "СР"
    }
    ["forms_count"]=>
    int(1)
    ["form_no_low"]=>
    int(5)
    ["form_no_high"]=>
    int(6)
  }
}
*/
```
Обратите внимание, граммемы `ИМ` и `ВН` для парадигмы слова `ТЕСТ` (не `ТЕСТО`) объединены в один массив, в отличие от `getGramInfo()`.

**

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
const log = console.log.bind(console);

const word = 'ШКАФ';
 
// поставим слово ШКАФ в множественное число, предложный падеж
log(inspect(morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], false)));
// @todo:
/*
Результат:
array(1) {
  [0]=>
  array(4) {
    ["form"]=>
    string(6) "ШКАФАХ"
    ["form_no"]=>
    int(12)
    ["pos"]=>
    string(1) "С"
    ["grammems"]=>
    array(4) {
      [0]=>
      string(2) "МР"
      [1]=>
      string(2) "МН"
      [2]=>
      string(2) "ПР"
      [3]=>
      string(2) "НО"
    }
  }
}
*/
 
// возвращает только слово, без грамматической информации
log(inspect(morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], true)));
// @todo:
/*
Результат:
['ШКАФАХ']
*/
 
// применим пользовательский фильтр
// фильтр – предикат (функция возвращающая true/false) со следующей сигнатурой:
// function XXX(form, partOfSpeech, grammems, formNo)
// если функция возвращает TRUE, то исходное слово приводится в данную форму
// callback – обычная функция обратного вызова, может принимать значения допустимые для call_user_func(…) т.е. is_callable(callback) === true.
 
function cast_predicate (form, partOfSpeech, grammems, formNo) {
    return grammems.includes('ИМ'); 
}
 
// приведём ШКАФ в именительный падеж
log(inspect(morphy.castFormByGramInfo(word, null, null, true, cast_predicate)));
// @todo:
/*
Результат:
array(2) {
  [0]=>
  string(4) "ШКАФ"
  [1]=>
  string(5) "ШКАФЫ"
}
*/
 
// выберем краткое прилагательное единственного числа, женского рода.
// если не указать часть речи, будут выбраны все прилагательные единственного числа, женского рода
log(inspect(morphy.castFormByGramInfo('КРАСНЫЙ', 'КР_ПРИЛ', ['ЕД', 'ЖР'], true)));
// @todo:
/*
Результат:
array(1) {
  [0]=>
  string(6) "КРАСНА"
}
*/
```

**

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
const log = console.log.bind(console);

log(inspect(morphy.castFormByPattern('ДИВАН', 'СТОЛАМИ', null, true))); 
// @todo:
/*
Результат:
array(1) {
  [0]=>
  string(8) "ДИВАНАМИ"
}
*/
```

Сложность возникает, если некоторые граммемы у слов не совпадают. Т.к. данная функция ищет в парадигме слова `word` форму, у которой граммемы совпадают с граммемами `patternWord`, то в таких случаях на выходе получим пустой результат. Например, `ДИВАН` и `КРОВАТЬ` имеют разный род (мужской и женский соответственно).

```javascript
log(inspect(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true)));
// @todo:
/*
Результат:
array(0) {
}
*/
```

Нам требуется указать, что род сравнивать не нужно. Можно это сделать следующим способом:

```javascript
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
log(inspect(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', provider, true)));
log(inspect(morphy.castFormByPattern('КРЕСЛО', 'СТУЛЬЯМИ', provider, true)));

// @todo:
/*
Результат:
array(1) {
  [0]=>
  string(8) "ДИВАНАМИ"
}
*/ 
 
// Чтобы не передавать provider каждый раз, можно сделать изменения глобально
morphy.getDefaultGrammemsProvider().excludeGroups('С', 'род');
log(inspect(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true))); 
```

**

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
