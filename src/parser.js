const grammar = require('./grammar/grammar')
const nearley = require('nearley')

module.exports = {
  parse: code => {
    const p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)

    p.feed(code)

    let already = []
    const results = p.results.filter(tree => {
      // Remove duplicates.
      // I probably shouldn't do this, but does it matter..?

      if (tree === null) return false

      const treeJSON = JSON.stringify(tree)
      if (already.includes(treeJSON)) return false
      else {
        already.push(treeJSON)
        return true
      }
    })

    if (results.length > 1) {
      for (let tree of results) {
        console.error(JSON.stringify(tree)/*require('util').inspect(tree, { colors: true, depth: null })*/, '\n\n_________\n\n')
      }

      console.error(`WARN: ambiguous grammar (${results.length}) ^\n\n`)
    }
    if (results.length === 0) throw new SyntaxError('Empty')

    return results[0]
  }
}
