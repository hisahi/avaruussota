const path = require('path');

module.exports = {
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
        }]
      }, {
        test: /\.css$/,
        use: [{
          loader: 'css-loader'
        }]
      }
    ]
  },
  resolve: {
    alias: {
      pson: 'pson/dist/PSON.js',
    },
  },
  stats: {
    colors: true
  },
  mode: 'development',
  devtool: 'source-map'
};
