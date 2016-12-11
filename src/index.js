const parser = require('./parser')
const compiler = require('./compiler')

module.exports = function nom(code, args) {
  if (args.tree) {
    return parser.parse(code).then(tree => {
      console.error(require('util').inspect(tree, { colors: true, depth: null }))
      return tree
    }).then(compiler.compile)
  } else {
    return parser.parse(code).then(compiler.compile)
  }
}
