/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    extraNodeModules: {
      // Override fs with react-native-fs
      fs: require.resolve('react-native-fs'),
      path: require.resolve('react-native-path'),
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('react-native-http'),
      https: require.resolve('https-browserify'),
      zlib: require.resolve('react-zlib-js'),
      url: require.resolve('react-native-url-polyfill'),
      'expo-crypto': require.resolve('react-native-expo-crypto'),
      'tiny-secp256k1': require.resolve('@bitcoinerlab/secp256k1'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
