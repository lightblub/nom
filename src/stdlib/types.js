class NomString {
  constructor(value) {
    this.value = value

    this.__type__ = 'String'
    this.__length__ = value.length
    this.__to_string__ = this
    this.__print__ = () => {
      process.stdout.write(this.value + '\n')
      return this
    }
  }
}

class NomNumber {
  constructor(value) {
    this.value = parseFloat(value)

    this.__type__ = 'Number'
    this.__to_string__ = () => new NomString(value)
    this.__to_number__ = this
  }
}

class NomMethod {
  constructor(syn) {
    this.value = syn
    this.__type__ = 'Method'
  }

  eval(args) {

  }
}

module.exports = {
  NomString,
  NomNumber,
  NomMethod,
}
