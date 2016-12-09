const parser = require('./parser')

module.exports = function nom(code) {
  return parser.parse(code)
}
