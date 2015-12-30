var webpack = require('webpack'),
	minify = process.env.NODE_ENV !== 'dev';
module.exports = {

  entry: {
  	'main.min': './js/src/main.js',
  	'narrative.min': './js/src/narrative.js',
  	'explore.min': './js/src/explore.js',
  },
  devtool: 'source-map',
  output: {
    path: './js/lib',
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  plugins: minify ? [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ] : []

};
