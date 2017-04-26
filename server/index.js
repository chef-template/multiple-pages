var app = require('koa')()
var router = require('koa-router')()
var path = require('path')
var chalk = require('chalk')
var proxy = require('koa-proxy')
var webpack = require('webpack')
var webpackDevMiddleware = require('koa-webpack-dev-middleware')
var webpackHotMiddleware = require('koa-webpack-hot-middleware')
var config = require(path.normalize(path.resolve('./build/webpack.dev.conf.js')))

var compiler, hotMiddleware, port, serverConfig

serverConfig = Object.assign({}, {
	port: 8010
}, config.server)

config.plugins = config.plugins || []
config.devServer = config.devServer || {}
port = process.argv[2] || serverConfig.port

config.devServer.hot = false
config.devServer.publicPath = config.output.publicPath

if (Array.isArray(config.entry)) {
	config.entry.unshift('webpack-hot-middleware/client')
} else {
	for (var key of Object.keys(config.entry)) {
		if(Array.isArray(config.entry[key])){
			config.entry[key].unshift('webpack-hot-middleware/client?reload=true')
		} else {
			config.entry[key] = ['webpack-hot-middleware/client?reload=true'].concat(config.entry[key])
		}
		
	}
}

config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
config.plugins.unshift(new webpack.NoEmitOnErrorsPlugin())

delete config.server
compiler = webpack(config)

hotMiddleware = webpackHotMiddleware(compiler, {
	log: function() {
		if (arguments[0].indexOf('building') > -1) {
			return
		}
		
		console.log(chalk.gray(" > " + arguments[0]))
	}
})

if(serverConfig.proxy){
	app.use(proxy(serverConfig.proxy))
}

router.get('/:path', function *(next){
	try{
		console.log(this.params.path)
		this.body = yield readFile(path.join(compiler.outputPath, this.params.path + '.html'))
		this.type = 'text/html'
	} catch(e){
		this.body = '不好意思没找到呀，请查看路由对应的html存在不'
	}
})

app.use(webpackDevServer())
app.use(router.routes()).use(router.allowedMethods())
app.use(function *(next) {
	yield next
})
app.listen(port, function(err) {
	if (err) {
		console.log(err)
		return
	}
	
	console.log(chalk.blue(' # Access URLs:'))
	console.log(chalk.gray(' ----------------------------------------'))
	console.log('     Local: ' + chalk.green('http://localhost:' + port))
	console.log(chalk.gray(' ----------------------------------------'))
	console.log('')
})

function webpackDevServer() {
	return compose([webpackDevMiddleware(compiler, config.devServer), hotMiddleware])
}

function compose(middleware) {
	return function*(next) {
		if (!next) {
			next = function* noop() {}
		}
		
		var i = middleware.length
		
		while (i--) {
			next = middleware[i].call(this, next)
		}
		
		return yield* next
	}
}

function *readFile(filepath) {
	return new Promise(function(resolve, reject) {
		compiler.outputFileSystem.readFile(filepath, function(err, result) {
			if(err) {
				reject(err)
				return
			}
			
			resolve(result)
		})
	})
}
