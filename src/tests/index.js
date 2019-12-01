import path from 'path';
import { exec } from 'child_process';
import _ from 'lodash';
import { inspect, logger, isStringifyedNumber } from '~/utils';
import { MorphierInterface, WordForm, WordDescriptor, WordDescriptorCollection } from '~/lib/morphiers';
import Morphy from '~/';

// const log = (...args) => logger.log(...args.map(item => inspect(item)));

function cliEncode(any) {
  return Buffer.from(JSON.stringify(any)).toString('base64');
}
const phpTestsFile = path.join(__dirname, 'index.php');
function runPhpFileWithArgs(args) {
  const cliArgs = Object.keys(args)
    .map(key => {
      return `--${key} ${cliEncode(args[key])}`;
    })
    .join(' ');

  return new Promise((resolve, reject) => {
    exec(
      `php ${phpTestsFile} ${cliArgs}`,
      {
        maxBuffer: 1024 * 1000, // 1MB
      },
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stderr) return reject(stderr);

        return resolve(stdout);
      },
    );
  });
}

async function runPhpTests(words, opts) {
  let res = await runPhpFileWithArgs({ words, opts });

  try {
    res = JSON.parse(res);
  } catch (error) {
    if (res) {
      error.message = `${error.message}
[php]: ${inspect(res)}`;
    }

    throw error;
  }

  if (!res.success) {
    throw new Error(`[php]: "${res.message}". ${res.words ? inspect(res.words) : ''}`);
  }

  return res.words;
}

/** Declare local tests */
async function runLocalTests(words, morphy) {
  const tests = {};
  words = _.isArray(words) ? words : [words];
  // для совместимости с результатами из php
  words = words.map(word => word.toUpperCase());

  tests.initialize = () => {
    return [morphy.getEncoding(), morphy.getLocale()];
  };

  tests.getters = () => {
    return [
      morphy.getCommonMorphier() instanceof MorphierInterface,
      morphy.getPredictBySuffixMorphier() instanceof MorphierInterface,
      morphy.getPredictByDatabaseMorphier() instanceof MorphierInterface,
      morphy.getBulkMorphier() instanceof MorphierInterface,
    ];
  };

  tests.isLastPredicted = () => {
    const res = [];

    res.push(morphy.lemmatize('глокая', Morphy.NORMAL), morphy.isLastPredicted());

    res.push(morphy.lemmatize('глокая', Morphy.IGNORE_PREDICT), morphy.isLastPredicted());

    res.push(morphy.lemmatize('тест', Morphy.ONLY_PREDICT), morphy.isLastPredicted());

    return res;
  };

  tests.getLastPredictionType = () => {
    const res = [];

    res.push(morphy.lemmatize('тест', Morphy.NORMAL), morphy.getLastPredictionType() === Morphy.PREDICT_BY_NONE);

    res.push(
      morphy.lemmatize('глокая', Morphy.IGNORE_PREDICT),
      morphy.getLastPredictionType() === Morphy.PREDICT_BY_NONE,
    );

    res.push(
      morphy.lemmatize('тестдрайв', Morphy.ONLY_PREDICT),
      morphy.getLastPredictionType() === Morphy.PREDICT_BY_SUFFIX,
    );

    res.push(
      morphy.lemmatize('подфигачить', Morphy.ONLY_PREDICT),
      morphy.getLastPredictionType() === Morphy.PREDICT_BY_DB,
    );

    return res;
  };

  tests['lemmatize && getBaseForm'] = () => {
    const res = { lemmatize: {}, getBaseForm: {} };

    words.forEach(word => (res.lemmatize[word] = morphy.lemmatize(word)));
    words.forEach(word => (res.getBaseForm[word] = morphy.getBaseForm(word)));

    return res;
  };

  tests['lemmatize bulk && getBaseForm bulk'] = () => {
    return {
      lemmatize: morphy.lemmatize(words),
      getBaseForm: morphy.getBaseForm(words),
    };
  };

  /**
   * @param {WordDescriptorCollection} paradigms
   * @param {Array} res
   */
  function testFoundWordParadigms(paradigms, res) {
    if (!paradigms) {
      return;
    }

    res.push(paradigms instanceof WordDescriptorCollection, paradigms.length);

    paradigms.forEach(paradigm => {
      res.push(
        paradigm instanceof WordDescriptor,
        paradigm.length,

        paradigm.getBaseForm(),
        paradigm.getPseudoRoot(),

        paradigm.getAllForms(),
        paradigm.getFoundWordForm().length,

        paradigm.hasGrammems('НО'),
        paradigm.hasGrammems('ИМ'),
        paradigm.getWordFormsByGrammems('НО').length,
        paradigm.getWordFormsByGrammems('ИМ').length,

        paradigm.hasPartOfSpeech('С'),
        paradigm.hasPartOfSpeech('ДЕЕПРИЧАСТИЕ'),
        paradigm.getWordFormsByPartOfSpeech('С').length,
        paradigm.getWordFormsByPartOfSpeech('ДЕЕПРИЧАСТИЕ').length,
      );
    });

    res.push(paradigms.getByPartOfSpeech('С').length);

    // для русских слов
    paradigms.getByPartOfSpeech('С').forEach(paradigm => {
      res.push(
        paradigm instanceof WordDescriptor,
        paradigm.length,
        paradigm.length > 0 ? paradigm.getWordForm(0) instanceof WordDescriptor : null,
      );

      const formsOfSourceWord = paradigm.getFoundWordForm();
      res.push(formsOfSourceWord.length);

      formsOfSourceWord.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );

      const sampleFormsByGrammem = paradigm.getWordFormsByGrammems('ИМ');
      res.push(sampleFormsByGrammem.length);

      sampleFormsByGrammem.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );

      const sampleFormsByPartOfSpeech = paradigm.getWordFormsByPartOfSpeech('С');
      res.push(sampleFormsByPartOfSpeech.length);

      sampleFormsByPartOfSpeech.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );
    });

    // для английских слов
    paradigms.getByPartOfSpeech('VERB').forEach(paradigm => {
      res.push(
        paradigm instanceof WordDescriptor,
        paradigm.length,
        paradigm.length > 0 ? paradigm.getWordForm(0) instanceof WordDescriptor : null,
      );

      const formsOfSourceWord = paradigm.getFoundWordForm();
      res.push(formsOfSourceWord.length);

      formsOfSourceWord.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );

      const sampleFormsByGrammem = paradigm.getWordFormsByGrammems('ИМ');
      res.push(sampleFormsByGrammem.length);

      sampleFormsByGrammem.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );

      const sampleFormsByPartOfSpeech = paradigm.getWordFormsByPartOfSpeech('С');
      res.push(sampleFormsByPartOfSpeech.length);

      sampleFormsByPartOfSpeech.forEach(form =>
        res.push(
          form instanceof WordForm,
          form.getWord(),
          form.getFormNo(),
          form.getGrammems(),
          form.hasGrammems(['ЕД', 'РД']),
          form.getPartOfSpeech(),
        ),
      );
    });
  }

  tests.findWord = () => {
    const res = [];

    words.forEach(word => {
      const paradigms = morphy.findWord(word);
      testFoundWordParadigms(paradigms, res);
    });

    return res;
  };

  tests['findWord bulk'] = () => {
    const res = [];

    _.forEach(morphy.findWord(words), (paradigms, word) => {
      testFoundWordParadigms(paradigms, res);
    });

    return res;
  };

  tests.getAllForms = () => {
    return words.map(word => morphy.getAllForms(word));
  };

  tests['getAllForms bulk'] = () => {
    return morphy.getAllForms(words);
  };

  tests.getPseudoRoot = () => {
    return words.map(word => morphy.getPseudoRoot(word));
  };

  tests['getPseudoRoot bulk'] = () => {
    return morphy.getPseudoRoot(words);
  };

  tests.getPartOfSpeech = () => {
    return words.map(word => morphy.getPartOfSpeech(word));
  };

  tests['getPartOfSpeech bulk'] = () => {
    return morphy.getPartOfSpeech(words);
  };

  tests.getAllFormsWithGramInfo = () => {
    return {
      asText: words.map(word => morphy.getAllFormsWithGramInfo(word, true)),
      '!asText': words.map(word => morphy.getAllFormsWithGramInfo(word, false)),
    };
  };

  tests['getAllFormsWithGramInfo bulk'] = () => {
    return {
      asText: morphy.getAllFormsWithGramInfo(words, true),
      '!asText': morphy.getAllFormsWithGramInfo(words, false),
    };
  };

  tests.getAllFormsWithAncodes = () => {
    return words.map(word => morphy.getAllFormsWithAncodes(word));
  };

  tests['getAllFormsWithAncodes bulk'] = () => {
    return morphy.getAllFormsWithAncodes(words);
  };

  tests.getAncode = () => {
    return words.map(word => morphy.getAncode(word));
  };

  tests['getAncode bulk'] = () => {
    return morphy.getAncode(words);
  };

  tests.getGramInfo = () => {
    return words.map(word => morphy.getGramInfo(word));
  };

  tests['getGramInfo bulk'] = () => {
    return morphy.getGramInfo(words);
  };

  tests.getGramInfoMergeForms = () => {
    return words.map(word => morphy.getGramInfoMergeForms(word));
  };

  tests['getGramInfoMergeForms bulk'] = () => {
    return morphy.getGramInfoMergeForms(words);
  };

  tests.castFormByGramInfo = () => {
    const res = [];

    words.forEach(word => {
      res.push(
        morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], false),
        morphy.castFormByGramInfo(word, null, ['МН', 'ПР'], true),
        morphy.castFormByGramInfo('ШКАФ', null, null, true, (form, partOfSpeech, grammems, formNo) => {
          return _.includes(grammems, 'ИМ');
        }),
        morphy.castFormByGramInfo(word, 'КР_ПРИЛ', ['ЕД', 'ЖР'], true),
      );
    });

    return res;
  };

  tests.castFormByPattern = () => {
    const res = [];

    const provider = morphy.getGrammemsProvider();
    provider.excludeGroups('С', 'род');

    res.push(
      morphy.castFormByPattern('ДИВАН', 'СТОЛАМИ', null, true),
      morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true),
      morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', provider, true),
      morphy.castFormByPattern('КРЕСЛО', 'СТУЛЬЯМИ', provider, true),
    );

    words.forEach(word => {
      res.push(
        morphy.castFormByPattern(word, 'СТОЛАМИ', null, true),
        morphy.castFormByPattern(word, 'СТОЛАМИ', provider, true),
        morphy.castFormByPattern('СТОЛАМИ', word, null, true),
        morphy.castFormByPattern('СТОЛАМИ', word, provider, true),

        morphy.castFormByPattern(word, 'ДИВАН', null, true),
        morphy.castFormByPattern(word, 'ДИВАН', provider, true),
        morphy.castFormByPattern('ДИВАН', word, null, true),
        morphy.castFormByPattern('ДИВАН', word, provider, true),

        morphy.castFormByPattern(word, 'КРОВАТЯМИ', null, true),
        morphy.castFormByPattern(word, 'КРОВАТЯМИ', provider, true),
        morphy.castFormByPattern('КРОВАТЯМИ', word, null, true),
        morphy.castFormByPattern('КРОВАТЯМИ', word, provider, true),
      );
    });

    morphy.getDefaultGrammemsProvider().excludeGroups('С', 'род');
    res.push(morphy.castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true));

    return res;
  };

  // /** @todo: castFormByAncode */
  // tests['castFormByAncode'] = () => {
  //   const res = [];
  //
  //   return res;
  // };

  /** Run tests */
  const results = {};
  _.forEach(tests, (fn, name) => {
    results[name] = fn();
  });

  return results;
}

const opts = [
  {
    name: 'default opts',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: true,
      use_ancodes_cache: true,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && storage == Morphy.STORAGE_FILE',
    opts: {
      storage: Morphy.STORAGE_FILE,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: true,
      use_ancodes_cache: false,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && off predict_by_suffix',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: false,
      predict_by_db: true,
      graminfo_as_text: true,
      use_ancodes_cache: true,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && off predict_by_db',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: false,
      graminfo_as_text: true,
      use_ancodes_cache: false,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && off predict_by_suffix && off predict_by_db',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: false,
      predict_by_db: false,
      graminfo_as_text: true,
      use_ancodes_cache: true,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && off graminfo_as_text',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: false,
      use_ancodes_cache: false,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && on use_ancodes_cache',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: false,
      use_ancodes_cache: true,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_TEXT,
    },
  },
  {
    name: 'default opts && resolve_ancodes == Morphy.RESOLVE_ANCODES_AS_INT',
    opts: {
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: true,
      use_ancodes_cache: false,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_INT,
    },
  },
  {
    name: 'default opts && resolve_ancodes == Morphy.RESOLVE_ANCODES_AS_DIALING',
    opts: {
      lang: 'ru',
      storage: Morphy.STORAGE_MEM,
      predict_by_suffix: true,
      predict_by_db: true,
      graminfo_as_text: true,
      use_ancodes_cache: true,
      resolve_ancodes: Morphy.RESOLVE_ANCODES_AS_DIALING,
    },
  },
];

const words = [];
words.push(
  ...'ет глокая душа красный спать мурелки шлепают пельсиски стакелках светится мычай This has been a known bug with a known solution for at least since 2009 years but no one seems to be willing to fix it'.split(
    ' ',
  ),
);

const [wordsEn, another] = _.partition(words, word => /^[a-z]+$/i.test(word));
const wordsRu = _.filter(another, word => /^[а-яё]+$/i.test(word));

const testData = [];

opts.forEach(config => {
  if (config.opts.lang) {
    switch (config.opts.lang) {
      case 'ru':
        wordsRu.length &&
          testData.push(
            _.merge(config, {
              words: wordsRu,
              opts: { lang: 'ru' },
            }),
          );
        break;

      case 'en':
        wordsEn.length &&
          testData.push(
            _.merge(config, {
              words: wordsEn,
              opts: { lang: 'en' },
            }),
          );

        break;
    }

    return;
  }
  wordsRu.length &&
    testData.push(
      _.merge(config, {
        words: wordsRu,
        opts: { lang: 'ru' },
      }),
    );
  wordsEn.length &&
    testData.push(
      _.merge(config, {
        words: wordsEn,
        opts: { lang: 'en' },
      }),
    );
});

(async function() {
  const results = {};

  console.time('tests time');

  await Promise.all(
    testData.map(async ({ name, words, opts }, idx) => {
      name = name || idx;

      const morphy = new Morphy(opts);
      const [phpResults, localResults] = await Promise.all([
        runPhpTests(words, morphy.options),
        runLocalTests(words, morphy),
      ]);

      results[name] = {
        words,
        opts,
        tests: _.keys(localResults).reduce((tests, testName) => {
          tests[testName] = {
            // success: _.isEqual(phpResults[testName], localResults[testName]),
            // php: phpResults[testName],
            // local: localResults[testName]
            success: _.isEqual(consistentResults(phpResults[testName]), consistentResults(localResults[testName])),
            php: phpResults[testName],
            local: localResults[testName],
          };

          return tests;
        }, {}),
      };

      return true;
    }),
  );

  console.timeEnd('tests time');

  let hasErrors = false;
  _.forEach(results, ({ words, opts, tests }, groupName) => {
    _.forEach(tests, (test, testName) => {
      if (test.success) {
        return true;
      }

      hasErrors = true;

      logger.error(`
[${groupName}] Test "${testName}" failed!
Data: ${inspect(words)}
Opts: ${inspect(opts)}
Php results: ${inspect(test.php)}
Local results: ${inspect(test.local)}
`);
    });
  });

  if (!hasErrors) logger.log('All tests passed!');
})().catch(error => logger.error(error));

function consistentResults(any) {
  if (_.isPlainObject(any)) {
    return Object.keys(any)
      .sort()
      .reduce((res, key) => {
        res[key] = consistentResults(any[key]);

        return res;
      }, {});
  }
  if (_.isArray(any)) {
    return _.sortBy(
      any.map(x => consistentResults(x)),
      any.length && (_.isNumber(any[0]) || isStringifyedNumber(any[0])) ? _.toInteger : JSON.stringify,
    );
  }

  return any;
}
