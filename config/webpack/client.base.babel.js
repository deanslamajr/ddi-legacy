const HtmlWebpackPlugin  = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './src/client/index.js',
    ],
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

  output: {
    publicPath: '/assets/',
    path: './public/assets',
    filename: '[name].js',
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/../../src/client/index.ejs',
      filename: '../index.ejs',
      inject: 'body',
      markupTarget: '<%- markup -%>'
    }),

    new ExtractTextPlugin('styles.css', {
      allChunks: true
    })
  ]
};