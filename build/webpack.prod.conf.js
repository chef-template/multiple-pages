const { join, resolve } = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
const UglifyPlugin = require('webpack-parallel-uglify-plugin')

const root = process.cwd()
let config = require('./config')
let Package = require('../package.json')
let version = Package.version
let name = Package.name

module.exports = {
  entry: config.entries,
  output: {
    path: join(root, 'dist'),
    filename: `js/[name].[hash:7].js`,
    publicPath: '/' // cdn path
  },
  resolve: {
    extensions: ['.js', '.json', '.css', '.vue'],
    alias: {
      assets: join(root, '/src/assets'),
      root: join(root, 'node_modules')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
        })
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader'
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: `img/[name].[hash:7].[ext]`
          }
        }]
      },
      {
        test: /\.(eot|ttf|woff|woff2|svg|svgz)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: `fonts/[name].[hash:7].[ext]`
          }
        }]
      }
    ]
  },
  plugins: config.plugins.concat([
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: `js/vendor.[hash:7].js`,
      chunks: config.chunks,
      minChunks: config.chunks.length
    }),
    new ExtractTextPlugin({
      filename: `css/[name].[hash:7].css`,
      allChunks: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    // Thanks: https://github.com/mishoo/UglifyJS2
    new UglifyPlugin({
      workCount: 2,
      uglifyJS: {
        'support-ie8': true
      }
    })
  ])
}