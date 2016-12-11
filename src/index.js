const parser = require('./parser')
const compiler = require('./compiler')
const interpreter = require('./interpreter')

module.exports = function nom(code, args) {
  let tree = parser.parse(code)

  if (args.tree)
    console.error(require('util').inspect(tree, { colors: true, depth: null }))

  interpreter.interpret(tree)
}
