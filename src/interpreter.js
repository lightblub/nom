const builtins = require('./stdlib/builtins')
const types = require('./stdlib/types')
const chalk = require('chalk')

function inspect(d) {
  if (d.__type__ === 'String') {
    return `"${d.value.replace(/\"/g, `\"`).replace(/\n/g, `↵`)}"`
  }

  return d.value.toString()
}

class NomEnvironment {
  constructor() {
    this.variables = {}
  }

  callMethod(fn, args) {
    if (fn.__type__ === 'Method') {
      // Method
      return fn.eval(args)
    } else if (fn instanceof Function) {
      // Builtin
      return fn.call(...args, fn)
    } else {
      // Not a method, so it'll just return itself
      return fn
    }
  }

  parsePath(path) {
    let res = this.variables
    let first = true

    for (let ref of path) {
      const type = ref[0]
      const ident = ref[1]

      if (type === 'variable') {
        res = this.callMethod(res['__' + ident + '__'], [])
      } else {
        let expr = this.callMethod(this.interpExpression(ref), [])

        if (first) res = expr
        else res = res[expr]
      }

      first = false
    }

    return res
  }

  interpExpression(args) {
    const type = args.shift()

    switch (type) {
      case 'path':
        return this.parsePath(args[0])

      case '+':
        const num1 = this.interpExpression(args[0])
        const num2 = this.interpExpression(args[1])

        if (num1.__type__ !== 'Number') {
          throw {
            type: 'TYPE ERROR',
            message: `${num1.__type__} ${inspect(num1)} is not a Number`,
            help: num1 instanceof types.NomString ? `Did you mean to add two Strings?\nThe ${chalk.cyan(`.`)} operator is used for concatenation.` : ''
          }
        }

        if (num2.__type__ !== 'Number') {
          throw {
            type: 'TYPE ERROR',
            message: `${num2.__type__} ${inspect(num2)} is not a Number`,
            help: num2 instanceof types.NomString ? `Did you mean to add two Strings?\nThe ${chalk.cyan(`.`)} operator is used for concatenation.` : ''
          }
        }

        return new types.NomNumber(num1.value + num2.value)

      case 'num':
        return new types.NomNumber(args[0])

      case 'string':
        return new types.NomString(args[0])

      case 'call':
        const fn = this.interpExpression(args[0])
        const argsToSend = args[1].map(this.interpExpression)

        return this.callMethod(fn, argsToSend)

      default:
        throw {
          type: 'INTERNAL ERROR',
          message: `Unknown subexpression type "${type}"`
        }
    }
  }

  interpStatement({ type, args }) {
    switch (type) {
      case 'expr': return this.interpExpression(args[0])
    }
  }

  interpStatements(syns) {
    for (let d of syns) {
      this.interpStatement({
        type: d.shift(),
        args: d,
      })
    }
  }
}

module.exports = {
  NomEnvironment,

  interpret: syn => {
    const env = new NomEnvironment
    env.interpStatements(syn)
  }
}
