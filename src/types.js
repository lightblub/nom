module.exports = {
  Number: class {
    constructor(str) {
      this.value = parseFloat(str)
      this.as_number = this.value
      this.as_string = str
    }
  },

  String: class {
    constructor(str) {
      this.value = str
      this.as_string = str
    }
  },
}
