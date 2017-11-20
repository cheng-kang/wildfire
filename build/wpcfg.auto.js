const config = require('./config').build
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let webpackConfig = {
  entry: {
    app: './src/auto.js'
  },
  output: {
    path: config.assetsRoot,
    filename: 'wildfire.auto.js'
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
          warnings: false,
          drop_console: true
        },
        warnings: false,
        sourceMap: true
      }
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
