const { join,resolve } = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const root = process.cwd()

let config = require('./config')

module.exports = {
  entry: config.entries,
  output: {
    path: join(root,'dist'),
    filename: 'js/[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js','.json','.css','.vue'],
    alias: {
      assets: join(root,'/src/assets'),
      root: join(root,'node_modules')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [[
              "env",
              {
                "targets": {
                  "browsers": [
                    "last 2 versions",
                    "safari >= 7"
                  ]
                },
                "loose": true
              }
            ]]
          }
        }]
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader',{
          loader: 'postcss-loader',
          options: {
            plugins: () => [require('autoprefixer')]
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: 'img/[name].[hash:7].[ext]'
          }
        }]
      },
      {
        test: /\.(eot|ttf|woff|woff2|svg|svgz)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: 'fonts/[name].[hash:7].[ext]'
          }
        }]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader'
        }]
      }
    ]
  },
  plugins: config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ]),
  devServer: {
    inline: true,
    noInfo: true,
    port: 8010
  },
  server: {
    proxy: {
      host: 'http://127.0.0.1',
      match: /^\/api/
    }
  }
}




