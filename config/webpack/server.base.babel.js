const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  externals: [
    nodeExternals(),
  ],

  target: 'node',

  entry: {
    server: [
      'babel-polyfill',
      './src/server/index.js',
    ],
  },

  output: {
    path: './public',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    publicPath: '/public/',
  },
  
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel',
        ],
      },
      { 
        test: /\.css$/, 
        loader: ExtractTextPlugin.extract('style', 'css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]')
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin('styles.css', {
      allChunks: true
    })
  ],

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
};