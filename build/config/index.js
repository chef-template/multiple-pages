const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const glob = require('glob')
const root = process.cwd()

let assets = require('./assets')

let entries = {}
let chunks = []
let plugins = []

let appendChunks = []

let opts = {
  append: false,
  publicPath: '',
  hash: false,
  files: []
}

glob.sync('./src/pages/**/*.js').forEach(path => {
  let chunk = path.split('./src/pages/')[1].split('.js')[0]
  chunk = chunk.split('/').shift()
  entries[chunk] = path
})

glob.sync('./src/pages/**/*.html').forEach(path => {
  let title = path.split('./src/pages/')[1].split('/app.html')[0]
  let filename = title + '.html'
  let chunk = path.split('./src/pages/')[1].split('.html')[0]
  chunk = chunk.split('/').shift()
    
  let htmlConf = {
    filename: filename,
    template: path,
    inject: 'body',
    favicon: '',
    chunks: ['vendors', chunk]
  }
  if(~appendChunks.indexOf(chunk)){
    opts.files.push(filename)
  }
  plugins.push(new HtmlWebpackPlugin(htmlConf))
})
plugins.push(new HtmlWebpackIncludeAssetsPlugin(Object.assign({ assets }, opts)))

module.exports = {
  entries,
  plugins,
  chunks
}