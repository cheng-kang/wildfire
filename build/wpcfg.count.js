const config = require('./config').build
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')
const utils = require('./utils')

let webpackConfig = {
  entry: {
    app: './src/count.js'
  },
  output: {
    path: config.assetsRoot,
    filename: 'wildfire.count.js'
  },
  devtool: '#source-map',
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        ecma: 8,
        output: {
          comments: false,
          beautify: false
        },
        compress: {
          warnings: true,
          drop_console: false
        },
        sourceMap: true
      }
    }),
    new webpack.BannerPlugin({
      banner: utils.copyright(),
    })
  ]
}

if (config.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.js$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackConfig
