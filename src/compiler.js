const deepfilter = require('deep-filter')
const types = require('./types')

const compiler = module.exports = {
  compile: tree => new Promise((resolve, reject) => {
    compiler.mem = []

    try {
      // Recursively check for methods
      let methods = deepfilter(tree, val => val[0] === 'methodDef')

      for (let line of tree) {
        compiler.part(line)
      }

      compiler.mem.push('quit')
      resolve(compiler.mem)
    } catch (err) {
      reject(err)
    }
  }),

  malloc: () => {
    return compiler.mem.length
  },

  mem: [],
  idents: new Map,
  ident: ident => {
    if (compiler.idents[ident]) {
      // We've already malloc()ed this identifier
      return compiler.idents[ident]
    } else {
      // Find a place in memory for this value to live using malloc()
      let mem = compiler.malloc() - 1
      compiler.idents[ident] = mem
      return mem
    }
  },

  part: d => {
    const type = d[0]

    switch (type) {
      case 'expr':
        let j = compiler.part(d[1])

        if (j instanceof types.String || j instanceof types.Number) {
          compiler.mem.push(...[
            j.value,
          ])
        }
      break;

      case 'varAssign':
        compiler.part(d[2])

        for (let what of d[1]) {
          let mem = compiler.ident(what[1])
          compiler.mem.push(...[
            'mwra', mem,
          ])
        }
      break;

      case 'constant':
      case 'class':
      case 'variable':
        let mem = compiler.ident(d[1])
        compiler.mem.push(...[
          'mrda', mem,
        ])
        return mem
      break;

      case 'call':
        let res = []

        const builtins = ['println', 'print']

        const ident = builtins.includes(d[1]) ? ident : compiler.part(d[1])
        const args  = d[2].map(arg => {
          let result = compiler.part(arg)
          if (arg[0] === 'call') {
            // TODO arguments + call method
          } else {
            return result
          }
        })

        const getValue = ident => {
          console.log(ident)

          return []
        }

        // Builtins?
        switch (ident[1]) {
          case 'println':
            if (args[0] instanceof types.String) {
              compiler.mem.push(...[
                ...getValue(args[0]),
                'loga',
                'nwln',
              ])
            } else {
              throw new TypeError(`println(str) only takes String`)
            }
          break;

          case 'print':
            if (args[0] instanceof types.String) {
              compiler.mem.push(...[
                ...getValue(args[0]),
                'loga',
              ])
            } else {
              throw new TypeError(`print(str) only takes String`)
            }
          break;

          // TODO
          default:
            // Call the function
            console.log(ident, args)
          break;
        }
      break;

      case 'string':
        const str = d[1]
        return new types.String(str)
      break;

      case 'num':
        const num = d[1]
        return new types.Number(num)
      break;

      case 'methodDef':
        // TODO
      break;

      default: throw new TypeError(`Unknown lineType "${type}"`)
    }
  }
}
