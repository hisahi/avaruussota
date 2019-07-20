const LCG_A = 535426113
const LCG_C = 2258250855
const SC = 2.0 ** -30

class Generator {
  constructor(seed) {
    this.seed = seed & 0xFFFFFFFF
  }

  reseed(seed) {
    this.seed = seed & 0xFFFFFFFF
  }

  randomInt() {
    const val = this.seed
    this.seed = (LCG_A * val + LCG_C) & 0xFFFFFFFF
    return val
  }

  random() {
    return (this.randomInt() & 0x3FFFFFFF) * SC
  }

  randomOffset() {
    return 2 * this.random() - 1
  }

  randomSign() {
    return 2 * (this.randomInt() & 1) - 1
  }
}

module.exports = Generator
