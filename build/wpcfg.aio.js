const path = require('path')
const merge = require('webpack-merge')
const config = require('./config').build
const baseWebpackConfig = require('./wpcfg.base')

const webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: './src/aio.js'
  },
  output: {
    path: path.resolve(config.assetsRoot, 'aio'),
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
    firebase: true,
    wilddog: true
  }
})

module.exports = webpackConfig
