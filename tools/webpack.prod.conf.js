var path = require('path')
var config = require('../config')
var utils = require('./utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env
var rucksack = require('rucksack-css')
var autoprefixer = require('autoprefixer')
var cssnano = require('cssnano')

var webpackConfig = merge(baseWebpackConfig, {
  // module: {
  //   loaders: utils.styleLoaders({ sourceMap: config.build.productionSourceMap, extract: true })
  // },
  // css 兼容 不拎出css
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['postcss']
        // loader: ExtractTextPlugin.extract(
        //   'css?sourceMap!' +
        //   'postcss!'+
        //   'sass-loader'
        // )
      }
    ]
  },
  // https://github.com/ai/browserslist#queries
  postcss: [
      rucksack(),
      // cssnano({
      //   autoprefixer: false,
      // }),
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 5%', 'ie > 8', 'iOS >= 9', 'Android >= 4'],
      }),
    ],
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    // path: config.build.assetsRoot,
    // filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')

    path: config.build.assetsRoot,
    //publicPath: config.build.assetsPublicPath,
    //filename: '[name].js'
    //分别打包 + hash版本号
    filename: utils.assetsPath("[name]-" + "[hash:6]" + ".js"),
    chunkFilename: utils.assetsPath("chunk/[name]-" + "[chunkhash:6]" + ".js"),
  },

  plugins: [
    // http://vuejs.github.io/vue-loader/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(utils.assetsPath('css/[name]-[contenthash:6].css'), {
        disable: false,
        allChunks: true,
      }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index_tj.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    })
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackConfig
