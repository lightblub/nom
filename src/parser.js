const grammar = require('./grammar/grammar')
const nearley = require('nearley')
const uniq = require('array-uniq')

module.exports = {
  parse: code => new Promise((resolve, reject) => {
    const p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)

    try {
      p.feed(code + '\n')

      const results = uniq(p.results)
      if (results.length > 1) {
        console.warn('WARN: ambiguous grammar')
        console.dir(results.map((tree, l) => [l, tree]), { colors: true, depth: null })
      }
      if (results.length === 0) throw new SyntaxError('Empty')

      resolve(results[0])
    } catch (err) {
      reject(err)
    }
  })
}
