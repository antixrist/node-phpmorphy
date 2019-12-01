const EXTENSIONS = ['.js', '.mjs', '.ts', '.node'];

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  plugins: [
    'babel',
    'node',
    'import',
    'module-resolver',
    'optimize-regex',
    'security',
    'promise',
    'unicorn',
    'sonarjs',
    'eslint-comments',
    'prettier',
  ],
  settings: {
    'import/extensions': EXTENSIONS,
    'import/resolver': {
      node: { extensions: EXTENSIONS },
      'babel-module': {},
    },
    // eslint-plugin-node settings
    node: { tryExtensions: EXTENSIONS },
  },
  // prettier-ignore
  extends: [
    'airbnb-base',
    'prettier',
    'prettier/babel',
    'prettier/unicorn',
  ],
  overrides: [
    {
      // rewrite rules for any config files in project root (including dot-files)
      files: ['*.{js,mjs,ts}'],
      excludedFiles: ['src/**'],
      rules: {
        'import/no-commonjs': 0,
        'global-require': 0,
        'node/exports-style': [2, 'module.exports'],
      },
    },
  ],
  rules: {
    'no-console': 2,
    'no-plusplus': 2,
    'no-bitwise': 0,
    'no-await-in-loop': 1,
    'no-return-assign': 0,
    'no-underscore-dangle': [2, { allowAfterThis: true, allowAfterSuper: true, enforceInMethodNames: false }],
    'prefer-destructuring': 0,
    // 'prefer-destructuring': [
    //   1, // fixable
    //   { object: true, array: false },
    //   { enforceForRenamedProperties: true },
    // ],
    'lines-between-class-members': [2, 'always', { exceptAfterSingleLine: true }],

    // fixed by prettier,
    // for full disable sequences expressions read this:
    // https://github.com/prettier/eslint-config-prettier#no-sequences
    'no-sequences': 0,
    'new-cap': 0, // prefer to 'babel/new-cap'
    quotes: 0, // prefer to 'babel/quotes'
    camelcase: 0, // prefer to 'babel/camelcase'
    semi: 0, // prefer to 'babel/semi'
    'valid-typeof': 0, // prefer to 'babel/valid-typeof'
    'no-invalid-this': 0, // prefer to 'babel/no-invalid-this'
    'object-curly-spacing': 0, // prefer to 'babel/object-curly-spacing'
    'no-unused-expressions': 0, // prefer to 'babel/no-unused-expressions'
    'no-new-wrappers': 0, // prefer to 'unicorn/new-for-builtins'
    'no-process-exit': 0, // prefer to 'unicorn/no-process-exit'
    'no-buffer-constructor': 0, // prefer to 'node/no-deprecated-api'
    'prefer-template': 1, // fixable

    // airbnb-base: `['error', 100, 2, {
    //   ignoreUrls: true,
    //   ignoreComments: false,
    //   ignoreRegExpLiterals: true,
    //   ignoreStrings: true,
    //   ignoreTemplateLiterals: true,
    // }]`
    'max-len': [
      2,
      {
        // if change line length don't forget set same value:
        //  - for `max_line_length` in `.editorconfig`
        //  - for `printWidth` option in `prettier` config
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    // this value from airbnb-base
    // but without `ForOfStatement` item
    'no-restricted-syntax': [
      2,
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],

    /* eslint-plugin-babel */

    // disabled by 'prettier/babel' and then fixing them
    // airbnb-base: `['error', 'single', { avoidEscape: true }]`
    'babel/quotes': [0, 'single', { allowTemplateLiterals: true }],

    // disabled by 'prettier/babel' and then fixing them
    // airbnb-base: `['error', 'always']`
    'babel/semi': [0, 'always'], // fixable

    // disabled by 'prettier/babel' and then fixing them
    // airbnb-base: `['error', 'always']`
    'babel/object-curly-spacing': [0, 'always', { arraysInObjects: false }], // fixable

    // airbnb-base: `['error', {
    //   newIsCap: true,
    //   newIsCapExceptions: [],
    //   capIsNew: false,
    //   capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
    // }]`
    'babel/new-cap': [
      2,
      {
        newIsCap: true,
        newIsCapExceptions: [],
        capIsNew: true,
        capIsNewExceptions: [],
        properties: true,
      },
    ],
    // airbnb-base: `['error', { properties: 'never' }]`
    'babel/camelcase': [1, { properties: 'always' }],
    // airbnb-base: `['error', { requireStringLiterals: true }]`
    'babel/valid-typeof': [2, { requireStringLiterals: true }],
    // airbnb-base: `off`
    'babel/no-invalid-this': 2,
    // airbnb-base: `['error', {
    //   allowShortCircuit: false,
    //   allowTernary: false,
    //   allowTaggedTemplates: false,
    // }]`
    'babel/no-unused-expressions': [
      2,
      {
        allowShortCircuit: false,
        allowTernary: false,
        allowTaggedTemplates: false,
      },
    ],

    /* eslint-plugin-node */
    'node/no-callback-literal': 2,
    'node/no-extraneous-import': 2,
    'node/no-extraneous-require': 2,
    'node/no-exports-assign': 2,
    'node/no-missing-import': 0, // prefer to 'import/no-unresolved'
    'node/no-missing-require': 0, // prefer to 'import/no-unresolved'
    'node/no-unpublished-bin': 2,
    'node/no-unpublished-import': 2,
    'node/no-unpublished-require': 2,
    'node/no-unsupported-features/es-builtins': 0,
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/node-builtins': 2,
    'node/process-exit-as-throw': 2,
    'node/shebang': 1, // fixable
    'node/no-deprecated-api': 2,
    'node/exports-style': 0, // prefer to 'import/no-commonjs'
    'node/file-extension-in-import': 0, // fixable, prefer to 'import/extensions'
    'node/prefer-global/buffer': [2, 'always'],
    'node/prefer-global/console': [2, 'always'],
    'node/prefer-global/process': [2, 'always'],
    'node/prefer-global/text-decoder': [2, 'always'],
    'node/prefer-global/text-encoder': [2, 'always'],
    'node/prefer-global/url-search-params': [2, 'always'],
    'node/prefer-global/url': [2, 'always'],
    'node/prefer-promises/dns': 2,
    'node/prefer-promises/fs': 2,

    /* eslint-plugin-import */
    'import/default': 2,
    'import/dynamic-import-chunkname': 0,
    'import/export': 2,
    'import/exports-last': 1,
    'import/extensions': [
      2,
      'always',
      {
        js: 'never',
        json: 'ignorePackages',
        json5: 'ignorePackages',
      },
    ],
    'import/first': [2, 'absolute-first'], // fixable
    'import/group-exports': 0,
    'import/max-dependencies': [2, { max: 10 }],
    'import/named': 2,
    'import/namespace': 2,
    'import/newline-after-import': 1, // fixable
    'import/no-absolute-path': 2,
    'import/no-amd': 2,
    'import/no-anonymous-default-export': [
      2,
      {
        allowArray: false,
        allowArrowFunction: false,
        allowAnonymousClass: false,
        allowAnonymousFunction: false,
        allowCallExpression: false,
        allowLiteral: false,
        allowObject: true,
      },
    ],
    'import/no-commonjs': [2, { allowRequire: false }],
    'import/no-cycle': 1,
    'import/no-default-export': 0,
    'import/no-named-export': 0,
    'import/no-deprecated': 1,
    'import/no-duplicates': 1, // fixable
    'import/no-dynamic-require': 2,
    'import/no-extraneous-dependencies': [
      2,
      {
        devDependencies: false,
        optionalDependencies: true,
        peerDependencies: true,
      },
    ],
    'import/no-internal-modules': 0,
    'import/no-mutable-exports': 2,
    'import/no-named-as-default-member': 1,
    'import/no-named-as-default': 1,
    'import/no-named-default': 2,
    'import/no-namespace': 0,
    'import/no-nodejs-modules': 0,
    'import/no-relative-parent-imports': 0,
    'import/no-restricted-paths': 0,
    'import/no-self-import': 2,
    'import/no-unassigned-import': 0,
    'import/no-unresolved': [2, { commonjs: true }],
    // `import/no-unused-modules` is broken for proposals `export-default-from` and `export-namespace-from`
    'import/no-unused-modules': 0, // [1, { missingExports: false, unusedExports: true }],
    'import/no-useless-path-segments': [2, { noUselessIndex: true }],
    'import/no-webpack-loader-syntax': 2,
    'import/prefer-default-export': 2,
    'import/unambiguous': 0,
    'import/order': [
      1, // fixable
      {
        'newlines-between': 'never',
        groups: ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index'],
      },
    ],

    /* eslint-plugin-module-resolver */
    'module-resolver/use-alias': 2,

    /* eslint-plugin-optimize-regex */
    'optimize-regex/optimize-regex': 1, // fixable

    /* eslint-plugin-security */
    'security/detect-unsafe-regex': 2,
    'security/detect-buffer-noassert': 1,
    'security/detect-child-process': 1,
    'security/detect-disable-mustache-escape': 2,
    'security/detect-eval-with-expression': 2,
    'security/detect-no-csrf-before-method-override': 1,
    'security/detect-non-literal-fs-filename': 1,
    'security/detect-non-literal-regexp': 1,
    'security/detect-non-literal-require': 2,
    'security/detect-object-injection': 0,
    'security/detect-possible-timing-attacks': 1,
    'security/detect-pseudoRandomBytes': 2,

    /* eslint-plugin-promise */
    'promise/catch-or-return': [
      2,
      {
        allowThen: true,
        allowFinally: true,
      },
    ],
    'promise/no-return-wrap': 2,
    'promise/always-return': 2,
    'promise/param-names': 2,
    'promise/no-native': 0,
    'promise/no-nesting': 1,
    'promise/no-promise-in-callback': 0,
    'promise/no-callback-in-promise': 1,
    'promise/avoid-new': 0,
    'promise/no-new-statics': 1, // fixable
    'promise/no-return-in-finally': 2,
    'promise/valid-params': 2,
    'promise/prefer-await-to-then': 2,
    'promise/prefer-await-to-callbacks': 2,

    /* eslint-plugin-unicorn */
    // fixable, but instead of `error2` it now uses `error_` (it's very ugly for me)
    'unicorn/catch-error-name': [2, { name: 'error', caughtErrorsIgnorePattern: '^_$' }],
    'unicorn/custom-error-definition': 1, // fixable
    'unicorn/error-message': 2,
    'unicorn/escape-case': 1, // fixable
    'unicorn/explicit-length-check': [2, { 'non-zero': 'greater-than' }], // partly fixable
    'unicorn/filename-case': [
      2,
      {
        cases: { kebabCase: true, camelCase: true },
      },
    ],
    'unicorn/import-index': 1, // fixable
    'unicorn/new-for-builtins': 1, // fixable
    'unicorn/no-abusive-eslint-disable': 0, // prefer to 'eslint-comments/no-unlimited-disable'
    'unicorn/no-array-instanceof': 1, // fixable
    'unicorn/no-console-spaces': 1, // fixable
    'unicorn/no-fn-reference-in-iterator': 1, // fixable
    'unicorn/no-for-loop': 1, // fixable
    'unicorn/no-hex-escape': 1, // fixable
    'unicorn/no-keyword-prefix': 0,
    'unicorn/no-new-buffer': 0, // fixable, prefer to 'node/no-deprecated-api'
    'unicorn/no-process-exit': 2,
    'unicorn/no-unreadable-array-destructuring': 2,
    'unicorn/no-unsafe-regex': 0, // prefer to 'security/detect-unsafe-regex'
    'unicorn/no-unused-properties': 2,
    'unicorn/no-zero-fractions': 1, // fixable
    // disabled by 'prettier/unicorn' and then fixing them
    'unicorn/number-literal-case': 0,
    'unicorn/prefer-add-event-listener': 0, // frontend, fixable
    'unicorn/prefer-event-key': 1, // frontend, partly fixable
    'unicorn/prefer-exponentiation-operator': 1, // fixable
    'unicorn/prefer-flat-map': 1, // fixable
    'unicorn/prefer-includes': 1, // fixable
    'unicorn/prefer-node-append': 0, // frontend, fixable
    'unicorn/prefer-node-remove': 0, // frontend, fixable
    'unicorn/prefer-query-selector': 0, // frontend, fixable
    'unicorn/prefer-spread': 1, // fixable
    'unicorn/prefer-starts-ends-with': 2,
    'unicorn/prefer-text-content': 0, // frontend, fixable
    'unicorn/prefer-type-error': 1, // fixable
    'unicorn/prevent-abbreviations': 0, // fixable, can break the code
    'unicorn/regex-shorthand': 0, // fixable, prefer to 'optimize-regex/optimize-regex'
    'unicorn/throw-new-error': 1, // fixable

    /* eslint-plugin-sonarjs */
    'sonarjs/cognitive-complexity': [1, 15],
    'sonarjs/max-switch-cases': [2, 20],
    'sonarjs/no-all-duplicated-branches': 2,
    'sonarjs/no-collapsible-if': 2,
    'sonarjs/no-duplicate-string': [2, 3],
    'sonarjs/no-duplicated-branches': 2,
    'sonarjs/no-element-overwrite': 2,
    'sonarjs/no-extra-arguments': 2,
    'sonarjs/no-identical-conditions': 2,
    'sonarjs/no-identical-expressions': 2,
    'sonarjs/no-identical-functions': 2,
    'sonarjs/no-inverted-boolean-check': 2,
    'sonarjs/no-one-iteration-loop': 2,
    'sonarjs/no-redundant-boolean': 2,
    'sonarjs/no-small-switch': 2,
    'sonarjs/no-use-of-empty-return-value': 2,
    'sonarjs/no-useless-catch': 2,
    'sonarjs/prefer-immediate-return': 1, // fixable
    'sonarjs/prefer-object-literal': 2,
    'sonarjs/prefer-single-boolean-return': 2,
    'sonarjs/prefer-while': 1, // fixable

    /* eslint-plugin-prettier */
    'prettier/prettier': 1,

    /* eslint-plugin-eslint-comments */
    'eslint-comments/disable-enable-pair': [2, { allowWholeFile: true }],
    'eslint-comments/no-aggregating-enable': 2,
    'eslint-comments/no-duplicate-disable': 2,
    'eslint-comments/no-unlimited-disable': 2,
    'eslint-comments/no-unused-disable': 2,
    'eslint-comments/no-unused-enable': 2,
    'eslint-comments/no-restricted-disable': 0,
    'eslint-comments/no-use': 0,
  },
};
