// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const webpack = require('webpack');

const pkgJson = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const args = process.argv.slice(2);
let mode = 'production';

if (args) {
  args.forEach((p, index) => {
    if (p === '--mode') {
      mode = args[index + 1] || mode;
    }
  });
}

console.log('You are using ' + mode + ' mode.');

const packages = [
  'extension-base',
  'extension-chains',
  'extension-dapp',
  'extension-inject',
  'extension-koni',
  'extension-koni-base',
  'extension-koni-ui'
];

module.exports = (entry, alias = {}, useSplitChunk = false) => {
  const result = {
    context: __dirname,
    devtool: false,
    entry,
    module: {
      rules: [
        {
          exclude: /(node_modules)/,
          test: /\.(js|mjs|ts|tsx)$/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: require('@polkadot/dev/config/babel-config-webpack.cjs')
            }
          ]
        }
      ]
    },
    output: {
      chunkFilename: '[name].js',
      filename: '[name].js',
      globalObject: '(typeof self !== \'undefined\' ? self : this)',
      path: path.join(__dirname, 'build'),
      publicPath: ''
    },
    performance: {
      hints: false
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js'
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(mode),
          PKG_NAME: JSON.stringify(pkgJson.name),
          PKG_VERSION: JSON.stringify(pkgJson.version)
        }
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/web/index.html',
        chunks: ['main']
      })
    ],
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.cjs', '.jsx', '.ts', '.tsx', '.json'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        zlib: false,
        url: false
      }
    },
    watch: false
  };

  if (useSplitChunk) {
    result.optimization = {
      splitChunks: {
        chunks: 'all',
        maxSize: 2000000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          default: {
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    };
  }

  return result;
};
