module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: true },
        useBuiltIns: false,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-object-rest-spread',
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: false,
        corejs: { version: 3, proposals: true },
        helpers: true,
        regenerator: true,
        useESModules: false,
      },
    ],
    [
      'babel-plugin-module-resolver',
      {
        root: ['./src'],
        alias: {
          '~cwd': './',
          '~': './src',
        },
      },
    ],
  ],
};
