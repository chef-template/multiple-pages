const glob = require('glob')
const { join, resolve, isAbsolute, parse } = require('path')
const { execSync } = require('child_process')

let root = process.cwd()
let [, , dir] = process.argv
if (!isAbsolute(dir)) {
    dir = resolve(join(root, dir))
}

glob.sync(`${dir}/**/*.js`).forEach(path => {
    execSync(`./node_modules/.bin/uglifyjs ${path} -c --support-ie8 -o ${path}`)
})