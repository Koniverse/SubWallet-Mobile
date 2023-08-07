module.exports = {
  plugins: [
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
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv'],
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-transform-private-methods', { loose: true }],
  ],
  presets: ['module:metro-react-native-babel-preset'],
};
