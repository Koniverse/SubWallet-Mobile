// Hermes does not support `import.meta`. Some ESM dependencies (notably
// @polkadot/* `packageInfo.js`) reference it. Replace `import.meta` with `{}`
// so guarded expressions like `import.meta && import.meta.url` fall back safely.
const stripImportMeta = ({ types: t }) => ({
  name: 'strip-import-meta',
  visitor: {
    MetaProperty(path) {
      path.replaceWith(t.objectExpression([]));
    },
  },
});

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    stripImportMeta,
    [
      'rewrite-require',
      {
        aliases: {
          vm: 'vm-browserify',
        },
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          assets: './src/assets',
          components: './src/components',
          constants: './src/constants',
          hooks: './src/hooks',
          messaging: './src/messaging',
          providers: './src/providers',
          screens: './src/screens',
          stores: './src/stores',
          styles: './src/styles',
          types: './src/types',
          utils: './src/utils',
          services: './src/services',
          reducers: './src/reducers',
          routes: './src/routes',
        },
        root: ['.'],
      },
    ],
    ['@babel/plugin-transform-class-static-block'],
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
