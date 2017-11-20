var path = require('path')
var merge = require('webpack-merge')
const config = require('./config').build
var baseWebpackConfig = require('./wpcfg.base')

var webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: './src/firebase.js'
  },
  output: {
    path: path.resolve(config.assetsRoot, 'firebase'),
    filename: 'wildfire.min.js',
    library: 'wildfire',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    },
    firebase: true
  }
})

module.exports = webpackConfig
