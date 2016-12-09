const grammar = require('./grammar/grammar')
const nearley = require('nearley')

module.exports = {
  parse: code => new Promise((resolve, reject) => {
    const p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)

    try {
      p.feed(code + '\n')

      let already = []
      const results = p.results.filter(tree => {
        // Remove duplicates.
        // I probably shouldn't do this, but does it matter..?

        const treeJSON = JSON.stringify(tree)
        if (already.includes(treeJSON)) return false
        else {
          already.push(treeJSON)
          return true
        }
      })

      if (results.length > 1) {
        console.error('WARN: ambiguous grammar:')
        for (let tree of results) {
          console.error(require('util').inspect(tree, { colors: true, depth: null }))
        }
        console.error('\n')
      }
      if (results.length === 0) throw new SyntaxError('Empty')

      resolve(results[0])
    } catch (err) {
      reject(err)
    }
  })
}
