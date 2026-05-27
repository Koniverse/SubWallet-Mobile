// Hermes does not support `import.meta`. Some ESM dependencies (notably
// @polkadot/* `packageInfo.js`) reference it. Replace it so guarded
// expressions like `import.meta && import.meta.url` fall back safely.
const stripImportMeta = ({ types: t }) => ({
  name: 'strip-import-meta',
  visitor: {
    MemberExpression(path) {
      if (
        path.node.object.type === 'MetaProperty' &&
        path.node.object.meta.name === 'import' &&
        path.node.object.property.name === 'meta' &&
        path.node.property.type === 'Identifier' &&
        path.node.property.name === 'url'
      ) {
        path.replaceWith(t.stringLiteral(''));
      }
    },
    MetaProperty(path) {
      if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
        path.replaceWith(t.nullLiteral());
      }
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
