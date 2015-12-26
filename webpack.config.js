var path = require('path');
module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname,
    filename: 'lib/edit.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        },
      }
    ]
  }
};