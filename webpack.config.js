const path = require('path');
const mode = process.env.EDIT_PIXEL_ENV || 'development';

module.exports = {
  mode,

  entry: './src/main.js',

  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'edit.js',
  },

  devServer: {
    publicPath: '/lib/',
    compress: true,
    host: 'localhost',
    port: 9000,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
};
