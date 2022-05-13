const path = require('path');
const webpack = require('webpack');

let mode = 'production';
let target = 'web-build';
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pkgJson = require('./package.json');
const args = process.argv.slice(2);
if (args) {
  args.forEach((p, index) => {
    if (p === '--mode') {
      mode = args[index + 1] || mode;
    }
    if (p === '--dist') {
      target = args[index + 1] || target;
    }
  });
}

const baseConfig = dist => {
  return {
    context: __dirname,
    devtool: false,
    entry: {main: './src/web/main.ts'},
    devServer: {
      static: {
        directory: path.join(__dirname, 'web-build'),
      },
      hot: false,
      liveReload: false,
      webSocketServer: false,
      compress: true,
      port: 9000,
    },
    module: {
      rules: [
        {
          exclude: /(node_modules)/,
          test: /\.(js|cjs|mjs|ts|tsx)$/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: require('@polkadot/dev/config/babel-config-webpack.cjs'),
            },
          ],
        },
      ],
    },
    output: {
      chunkFilename: '[name].js',
      filename: '[name].js',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
      path: path.join(__dirname, dist),
      publicPath: '',
    },
    performance: {
      hints: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(mode),
          PKG_NAME: JSON.stringify(pkgJson.name),
          PKG_VERSION: JSON.stringify(pkgJson.version),
        },
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/web/index.html',
        chunks: ['main'],
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        zlib: false,
        url: false,
      },
    },
  };
};

module.exports = baseConfig(target);
