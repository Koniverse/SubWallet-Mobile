module.exports = {
  plugins: [
    [
      'rewrite-require',
      {
        aliases: {
          _stream_duplex: 'readable-stream/duplex',
          _stream_passthrough: 'readable-stream/passthrough',
          _stream_readable: 'readable-stream/readable',
          _stream_transform: 'readable-stream/transform',
          _stream_writable: 'readable-stream/writable',
          crypto: 'react-native-crypto',
          stream: 'readable-stream',
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
          providers: './src/providers',
          screens: './src/screens',
          stores: './src/stores',
          styles: './src/styles',
          types: './src/types',
          utils: './src/utils',
        },
        root: ['.'],
      },
    ],
    '@babel/plugin-syntax-import-meta',
  ],
  presets: ['module:metro-react-native-babel-preset'],
};
