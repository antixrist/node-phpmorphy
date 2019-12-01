<?php
error_reporting(E_ERROR);
//ini_set('display_errors', 'Off');

function result ($words, $success = true, $message = '') {
  print_r(array(
    "success" => $success,
    "message" => $message,
    "words" => $words
  ));
//  die(json_encode([
//    "success" => $success,
//    "message" => $message,
//    "words" => $words
//  ]));
};

$params = [
  'w:' => 'words:',
  'o:' => 'opts:'
];

$args = getopt(implode('', array_keys($params)), $params);

$parsed_words = null;
$parsed_opts = null;
$err_message = null;

try {
  if (isset($args['words']) || isset($args['w'])) {
    $parsed_words = isset($args['words']) ? $args['words'] : $args['w'];
    $parsed_words = base64_decode($parsed_words);
    $parsed_words = json_decode($parsed_words, 1);
  }

  if (isset($args['opts']) || isset($args['o'])) {
    $parsed_opts = isset($args['opts']) ? $args['opts'] : $args['o'];
    $parsed_opts = base64_decode($parsed_opts);
    $parsed_opts = json_decode($parsed_opts, 1);
  }
} catch (Exception $err) {
  $err_message = $err->getMessage();
}

$args = [
  'words' => $parsed_words,
  'opts' => $parsed_opts
];

//if (
//  $err_message ||
//  !(is_string($args['words']) || is_array($args['words'])) ||
//  !is_array($args['opts'])
//) {
//  $err_message = $err_message ? ':' . PHP_EOL . $err_message : '';
//  $err_message = 'Invalid cli arguments' . $err_message;
//
//  result($args, false, $err_message);
//}

$opts = $parsed_opts;
//$words = $parsed_words;
$words = ["ет", "глокая", "душа", "красный", "спать", "мурелки", "шлепают", "пельсиски", "стакелках", "светится", "мычай"];
$words = array_map('mb_strtoupper', $words);

echo "<<<WORDS".PHP_EOL;
print_r($words);
echo "END WORDS>>>".PHP_EOL;

$dir = getcwd() .'/dicts';
$lang = $opts['lang'] ? $opts['lang'] : 'ru_RU';

require_once(getcwd() .'/phpmorphy/src/common.php');

/** Create phpMorphy instance */
try {
//  $morphy = new phpMorphy($dir, $lang, $opts);
  $morphy = new phpMorphy($dir, $lang, array(
    "storage" => PHPMORPHY_STORAGE_MEM,
    "predict_by_suffix" => true,
    "predict_by_db" => true,
    "graminfo_as_text" => true,
    "use_ancodes_cache" => false,
    "resolve_ancodes" => phpMorphy::RESOLVE_ANCODES_AS_TEXT,
  ));
} catch (phpMorphy_Exception $e) {
  $err_message = 'Error occured while creating phpMorphy instance: ' . PHP_EOL . $e->getMessage();
  result($args, false, $err_message);
}

$tests = [];

/** Declare tests */

$tests['initialize'] = function () use ($words, $morphy) {
  $result = [
    $morphy->getEncoding(),
    $morphy->getLocale()
  ];

  return $result;
};

$tests['getters'] = function () use ($words, $morphy) {
  $result = [
    $morphy->getCommonMorphier() instanceof phpMorphy_Morphier_Interface,
    $morphy->getPredictBySuffixMorphier() instanceof phpMorphy_Morphier_Interface,
    $morphy->getPredictByDatabaseMorphier() instanceof phpMorphy_Morphier_Interface,
    $morphy->getBulkMorphier() instanceof phpMorphy_Morphier_Interface
  ];

  return $result;
};

$tests['isLastPredicted'] = function () use ($words, $morphy) {
  $result = [];

  $result[] = $morphy->lemmatize('ГЛОКАЯ', phpMorphy::NORMAL);
  $result[] = $morphy->isLastPredicted();

  $result[] = $morphy->lemmatize('ГЛОКАЯ', phpMorphy::IGNORE_PREDICT);
  $result[] = $morphy->isLastPredicted();

  $result[] = $morphy->lemmatize('ТЕСТ', phpMorphy::ONLY_PREDICT);
  $result[] = $morphy->isLastPredicted();

  return $result;
};

$tests['getLastPredictionType'] = function () use ($words, $morphy) {
  $result = [];

  $result[] = $morphy->lemmatize('ТЕСТ', phpMorphy::NORMAL);
  $result[] = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_NONE;

  $result[] = $morphy->lemmatize('ГЛОКАЯ', phpMorphy::IGNORE_PREDICT);
  $result[] = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_NONE;

  $result[] = $morphy->lemmatize('ТЕСТДРАЙВ', phpMorphy::ONLY_PREDICT);
  $result[] = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_SUFFIX;

  $result[] = $morphy->lemmatize('ПОДФИГАЧИТЬ', phpMorphy::ONLY_PREDICT);
  $result[] = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_DB;

  return $result;
};

$tests['lemmatize && getBaseForm'] = function () use ($words, $morphy) {
  $result = ['lemmatize' => [], 'getBaseForm' => []];

  foreach ($words as $word) {
    echo $word . PHP_EOL;
    $result['lemmatize'][$word] = $morphy->lemmatize($word);
  }
  foreach ($words as $word) {
    $result['getBaseForm'][$word] = $morphy->getBaseForm($word);
  }

  return $result;
};

$tests['lemmatize bulk && getBaseForm bulk'] = function () use ($words, $morphy) {
  $result = [];

  $result['lemmatize'] = $morphy->lemmatize($words);
  $result['getBaseForm'] = $morphy->getBaseForm($words);

  return $result;
};


function testFoundWordParadigms ($paradigms, &$res) {
  if (!$paradigms) { return; }

  $res[] = $paradigms instanceof phpMorphy_WordDescriptor_Collection;
  $res[] = count($paradigms);

  foreach ($paradigms as $paradigm) {
    $res[] = $paradigm instanceof phpMorphy_WordDescriptor;
    $res[] = count($paradigm);

    $res[] = $paradigm->getBaseForm();
    $res[] = $paradigm->getPseudoRoot();

    $res[] = $paradigm->getAllForms();
    $res[] = count($paradigm->getFoundWordForm());

    $res[] = $paradigm->hasGrammems('НО');
    $res[] = $paradigm->hasGrammems('ИМ');
    $res[] = count($paradigm->getWordFormsByGrammems('НО'));
    $res[] = count($paradigm->getWordFormsByGrammems('ИМ'));

    $res[] = $paradigm->hasPartOfSpeech('С');
    $res[] = $paradigm->hasPartOfSpeech('ДЕЕПРИЧАСТИЕ');
    $res[] = count($paradigm->getWordFormsByPartOfSpeech('С'));
    $res[] = count($paradigm->getWordFormsByPartOfSpeech('ДЕЕПРИЧАСТИЕ'));
  }

  $res[] = count($paradigms->getByPartOfSpeech('С'));

  foreach ($paradigms->getByPartOfSpeech('С') as $paradigm) {
    $res[] = $paradigm instanceof phpMorphy_WordDescriptor;
    $res[] = count($paradigm);
    $res[] = count($paradigm)
      ? $paradigm->getWordForm(0) instanceof phpMorphy_WordDescriptor
      : null
    ;

    $formsOfSourceWord = $paradigm->getFoundWordForm();
    $res[] = count($formsOfSourceWord);

    foreach ($formsOfSourceWord as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };

    $sampleFormsByGrammem = $paradigm->getWordFormsByGrammems('ИМ');
    $res[] = count($sampleFormsByGrammem);

    foreach ($sampleFormsByGrammem as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };

    $sampleFormsByPartOfSpeech = $paradigm->getWordFormsByPartOfSpeech('С');
    $res[] = count($sampleFormsByPartOfSpeech);

    foreach ($sampleFormsByPartOfSpeech as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };
  }

  foreach ($paradigms->getByPartOfSpeech('VERB') as $paradigm) {
    $res[] = $paradigm instanceof phpMorphy_WordDescriptor;
    $res[] = count($paradigm);
    $res[] = count($paradigm)
      ? $paradigm->getWordForm(0) instanceof phpMorphy_WordDescriptor
      : null
    ;

    $formsOfSourceWord = $paradigm->getFoundWordForm();
    $res[] = count($formsOfSourceWord);

    foreach ($formsOfSourceWord as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };

    $sampleFormsByGrammem = $paradigm->getWordFormsByGrammems('ИМ');
    $res[] = count($sampleFormsByGrammem);

    foreach ($sampleFormsByGrammem as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };

    $sampleFormsByPartOfSpeech = $paradigm->getWordFormsByPartOfSpeech('С');
    $res[] = count($sampleFormsByPartOfSpeech);

    foreach ($sampleFormsByPartOfSpeech as $form) {
      $res[] = $form instanceof phpMorphy_WordForm;
      $res[] = $form->getWord();
      $res[] = $form->getFormNo();
      $res[] = $form->getGrammems();
      $res[] = $form->hasGrammems(['ЕД', 'РД']);
      $res[] = $form->getPartOfSpeech();
    };
  }
}

$tests['findWord'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $paradigms = $morphy->findWord($word);

    testFoundWordParadigms($paradigms, $res);
  }

  return $res;
};

$tests['findWord bulk'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($morphy->findWord($words) as $word => $paradigms) {
    testFoundWordParadigms($paradigms, $res);
  }

  return $res;
};


$tests['getAllForms'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getAllForms($word);
  }

  return $res;
};

$tests['getAllForms bulk'] = function () use ($words, $morphy) {
  return $morphy->getAllForms($words);
};


$tests['getPseudoRoot'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getPseudoRoot($word);
  }

  return $res;
};

$tests['getPseudoRoot bulk'] = function () use ($words, $morphy) {
  return $morphy->getPseudoRoot($words);
};


$tests['getPartOfSpeech'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getPartOfSpeech($word);
  }

  return $res;
};

$tests['getPartOfSpeech bulk'] = function () use ($words, $morphy) {
  return $morphy->getPartOfSpeech($words);
};


$tests['getAllFormsWithGramInfo'] = function () use ($words, $morphy) {
  $res = [
    'asText' => [],
    '!asText' => []
  ];

  foreach ($words as $word) {
    $res['asText'][] = $morphy->getAllFormsWithGramInfo($word, true);
    $res['!asText'][] = $morphy->getAllFormsWithGramInfo($word, false);
  }

  return $res;
};

$tests['getAllFormsWithGramInfo bulk'] = function () use ($words, $morphy) {
  $res = [
    'asText' => $morphy->getAllFormsWithGramInfo($words, true),
    '!asText' => $morphy->getAllFormsWithGramInfo($words, false)
  ];

  return $res;
};


$tests['getAllFormsWithAncodes'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getAllFormsWithAncodes($word);
  }

  return $res;
};

$tests['getAllFormsWithAncodes bulk'] = function () use ($words, $morphy) {
  return $morphy->getAllFormsWithAncodes($words);
};


$tests['getAncode'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getAncode($word);
  }

  return $res;
};

$tests['getAncode bulk'] = function () use ($words, $morphy) {
  return $morphy->getAncode($words);
};


$tests['getGramInfo'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getGramInfo($word);
  }

  return $res;
};

$tests['getGramInfo bulk'] = function () use ($words, $morphy) {
  return $morphy->getGramInfo($words);
};


$tests['getGramInfoMergeForms'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->getGramInfoMergeForms($word);
  }

  return $res;
};

$tests['getGramInfoMergeForms bulk'] = function () use ($words, $morphy) {
  return $morphy->getGramInfoMergeForms($words);
};

$tests['castFormByGramInfo'] = function () use ($words, $morphy) {
  $res = [];

  foreach ($words as $word) {
    $res[] = $morphy->castFormByGramInfo($word, null, ['МН', 'ПР'], false);
    $res[] = $morphy->castFormByGramInfo($word, null, ['МН', 'ПР'], true);
    $res[] = $morphy->castFormByGramInfo('ШКАФ', null, null, true, function ($form, $partOfSpeech, $grammems, $formNo) {
      return in_array('ИМ', $grammems, true);
    });
    $res[] = $morphy->castFormByGramInfo($word, 'КР_ПРИЛ', ['ЕД', 'ЖР'], true);
  };

  return $res;
};


$tests['castFormByPattern'] = function () use ($words, $morphy) {
  $res = [];

  $provider = $morphy->getGrammemsProvider();
  $provider->excludeGroups('С', 'род');

  $res[] = $morphy->castFormByPattern('ДИВАН', 'СТОЛАМИ', null, true);
  $res[] = $morphy->castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true);
  $res[] = $morphy->castFormByPattern('ДИВАН', 'КРОВАТЯМИ', $provider, true);
  $res[] = $morphy->castFormByPattern('КРЕСЛО', 'СТУЛЬЯМИ', $provider, true);

  foreach ($words as $word) {
    $res[] = $morphy->castFormByPattern($word, 'СТОЛАМИ', null, true);
    $res[] = $morphy->castFormByPattern($word, 'СТОЛАМИ', $provider, true);
    $res[] = $morphy->castFormByPattern('СТОЛАМИ', $word, null, true);
    $res[] = $morphy->castFormByPattern('СТОЛАМИ', $word, $provider, true);

    $res[] = $morphy->castFormByPattern($word, 'ДИВАН', null, true);
    $res[] = $morphy->castFormByPattern($word, 'ДИВАН', $provider, true);
    $res[] = $morphy->castFormByPattern('ДИВАН', $word, null, true);
    $res[] = $morphy->castFormByPattern('ДИВАН', $word, $provider, true);

    $res[] = $morphy->castFormByPattern($word, 'КРОВАТЯМИ', null, true);
    $res[] = $morphy->castFormByPattern($word, 'КРОВАТЯМИ', $provider, true);
    $res[] = $morphy->castFormByPattern('КРОВАТЯМИ', $word, null, true);
    $res[] = $morphy->castFormByPattern('КРОВАТЯМИ', $word, $provider, true);
  }

  $morphy->getDefaultGrammemsProvider()->excludeGroups('С', 'род');
  $res[] = $morphy->castFormByPattern('ДИВАН', 'КРОВАТЯМИ', null, true);

  /**
   * `array_values` нужен потому, что метод `castFormByPattern` внутри себя делает
   * `array_merge`. Из-за этого херятся ключи (будут, к примеру, такими: `'0', '1', '3'`,
   *  т.е. индексы идут с пропусками и становятся строками) и тест не проходит.
   */
  $res = array_map(function ($item) {
    return is_array($item) ? array_values($item) : $item;
  }, $res);

  return $res;
};

///** @todo: castFormByAncode */
//$tests['castFormByAncode'] = function () use ($words, $morphy) {
//  $res = [];
//
//  return $res;
//};


//$tests['pattern'] = function () use ($words, $morphy) {
//  $res = [];
//
//  return $res;
//};


/** Run tests */
$results = [];
foreach ($tests as $name => $fn) {
  try {
    $results[$name] = $fn();
  } catch (phpMorphy_Exception $e) {
    $results[$name] = $e->getMessage();
  }
}





//$grammems_list = [[ 9, 1, 2, 21 ],
//  [ 9, 1, 5, 21 ],
//  [ 9, 1, 3, 21 ],
//  [ 9, 1, 4, 21 ],
//  [ 9, 1, 7, 46, 21 ],
//  [ 9, 1, 6, 21 ],
//  [ 9, 1, 7, 21 ],
//  [ 9, 0, 2, 21 ],
//  [ 9, 0, 5, 21 ],
//  [ 9, 0, 3, 21 ],
//  [ 9, 0, 4, 21 ],
//  [ 9, 0, 6, 21 ],
//  [ 9, 0, 7, 21 ],
//  [ 9, 1, 2, 21 ],
//  [ 9, 1, 5, 21 ],
//  [ 9, 1, 3, 21 ],
//  [ 9, 1, 4, 21 ],
//  [ 9, 1, 7, 46, 21 ],
//  [ 9, 1, 6, 21 ],
//  [ 9, 1, 7, 21 ],
//  [ 9, 0, 2, 21 ],
//  [ 9, 0, 5, 21 ],
//  [ 9, 0, 3, 21 ],
//  [ 9, 0, 4, 21 ],
//  [ 9, 0, 6, 21 ],
//  [ 9, 0, 7, 21 ]];
//
//$results = [];
//$search = 'ИМ';
//foreach($grammems_list as $grammems) {
//  $results[] = [in_array($search, $grammems), $search, $grammems];
//}
//result(['castFormByGramInfo' => $results]);

/** Emitting results */
result($results);

//$words = array('КРАКОЗЯБЛИКИ', 'СТАЛИ', 'ВИНА', 'И', 'ДУХИ', 'abc');
//
//try {
//  foreach($words as $word) {
//    // by default, phpMorphy finds $word in dictionary and when nothig found, try to predict them
//    // you can change this behaviour, via second argument to getXXX or findWord methods
//    $base = $morphy->getBaseForm($word);
//    $all = $morphy->getAllForms($word);
//    $part_of_speech = $morphy->getPartOfSpeech($word);
//
//    // $base = $morphy->getBaseForm($word, phpMorphy::NORMAL); // normal behaviour
//    // $base = $morphy->getBaseForm($word, phpMorphy::IGNORE_PREDICT); // don`t use prediction
//    // $base = $morphy->getBaseForm($word, phpMorphy::ONLY_PREDICT); // always predict word
//
//    $is_predicted = $morphy->isLastPredicted(); // or $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_NONE
//    $is_predicted_by_db = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_DB;
//    $is_predicted_by_suffix = $morphy->getLastPredictionType() == phpMorphy::PREDICT_BY_SUFFIX;
//
//    // this used for deep analysis
//    $collection = $morphy->findWord($word);
//    // or var_dump($morphy->getAllFormsWithGramInfo($word)); for debug
//
//    if(false === $collection) {
//      echo $word, " NOT FOUND\n";
//      continue;
//    } else {
//    }
//
//    echo $is_predicted ? '-' : '+', $word, "\n";
//    echo 'lemmas: ', implode(', ', $base), "\n";
//    echo 'all: ', implode(', ', $all), "\n";
//    echo 'poses: ', implode(', ', $part_of_speech), "\n";
//
//    echo "\n";
//    // $collection collection of paradigm for given word
//
//    // TODO: $collection->getByPartOfSpeech(...);
//    foreach($collection as $paradigm) {
//      // TODO: $paradigm->getBaseForm();
//      // TODO: $paradigm->getAllForms();
//      // TODO: $paradigm->hasGrammems(array('', ''));
//      // TODO: $paradigm->getWordFormsByGrammems(array('', ''));
//      // TODO: $paradigm->hasPartOfSpeech('');
//      // TODO: $paradigm->getWordFormsByPartOfSpeech('');
//
//
//      echo "lemma: ", $paradigm[0]->getWord(), "\n";
//      foreach($paradigm->getFoundWordForm() as $found_word_form) {
//        echo
//        $found_word_form->getWord(), ' ',
//        $found_word_form->getPartOfSpeech(), ' ',
//        '(', implode(', ', $found_word_form->getGrammems()), ')',
//        "\n";
//      }
//      echo "\n";
//
//      foreach($paradigm as $word_form) {
//        // TODO: $word_form->getWord();
//        // TODO: $word_form->getFormNo();
//        // TODO: $word_form->getGrammems();
//        // TODO: $word_form->getPartOfSpeech();
//        // TODO: $word_form->hasGrammems(array('', ''));
//      }
//    }
//
//    echo "--\n";
//  }
//} catch(phpMorphy_Exception $e) {
//  die('Error occured while text processing: ' . $e->getMessage());
//}
