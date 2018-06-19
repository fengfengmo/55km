var path = require('path')
var config = require('../config')
var utils = require('./utils')
//var ExtractTextPlugin = require('extract-text-webpack-plugin')
var projectRoot = path.resolve(__dirname, '../')
//var theme = require('../config/theme')

var theme = {}
theme = require('../src/theme/theme.js')();
// console.log(JSON.stringify(theme))

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: config.build.assetsPublicPath,
    //filename: '[name].js'
    //分别打包 + hash版本号
    filename: "[name]-" + "[hash:6]" + ".js",
    chunkFilename: "chunk/[name]-" + "[chunkhash:6]" + ".js",
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    fallback: [path.join(__dirname, '../node_modules')],
    // 快速寻找
    alias: {
      'src': path.resolve(__dirname, '../src'),
      'scss': path.resolve(__dirname, '../src/scss'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'actions': path.resolve(__dirname, '../src/actions'),
      'api': path.resolve(__dirname, '../src/api'),
      'utils': path.resolve(__dirname, '../src/utils'),
      'locales': path.resolve(__dirname, '../src/locales'),
      'static': path.resolve(__dirname, '../static'),
      'components': path.resolve(__dirname, '../src/components'),
      'containers': path.resolve(__dirname, '../src/containers'),
      'redux': path.resolve(__dirname, '../node_modules/redux/dist/redux.min'),
      'react-redux': path.resolve(__dirname, '../node_modules/react-redux/dist/react-redux'),
    }
  },
  resolveLoader: {
    fallback: [path.join(__dirname, '../node_modules')]
  },
  // 使用外链
  externals: {
    'react': "React",
    'react-dom': "ReactDOM",
    'plupload': "plupload",
    'Qiniu': "Qiniu",
    'QiniuJsSDK': "QiniuJsSDK",
    //  'wx': 'wx'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      // { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      // {
      //   test: /\.less$/,
      //   loaders: ["style-loader", "css-loader", "less-loader"]
      // },
      // {
      //   test: /\.less$/,
      //   loader: ExtractTextPlugin.extract(
      //     'css?sourceMap&modules&localIdentName=[local]___[hash:base64:5]!!' +
      //     `less-loader?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
      //   ),
      // },
      // 引入theme
      {
        test: /\.less$/,
        loader: `style!css!less?{modifyVars:${JSON.stringify(theme)}}`
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.md$/,
        loader: path.resolve(__dirname, './markdown-loader.js'),
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url',
        query: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
}
