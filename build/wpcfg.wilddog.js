const path = require('path')
const merge = require('webpack-merge')
const config = require('./config').build
const baseWebpackConfig = require('./wpcfg.base')

const webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: './src/wilddog.js'
  },
  output: {
    path: path.resolve(config.assetsRoot, 'wilddog'),
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
    wilddog: true
  }
})

module.exports = webpackConfig
