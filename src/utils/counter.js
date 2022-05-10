class Counter {
  constructor() {
    this.counter = BigInt(0)
  }

  next() {
    const val = this.counter.toString(36).padStart(10, '0')
    this.counter = BigInt.asUintN(64, this.counter + BigInt(1))
    return '#' + val
  }
}

module.exports = Counter
