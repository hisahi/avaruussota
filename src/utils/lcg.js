const LCG_A = 535426113
const LCG_C = 2258250855

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
    let v = this.randomInt() / (2.0 ** 32)
    if (v < 0) {
      v += 1
    }
    return v
  }

  randomOffset() {
    return 2 * this.random() - 1
  }
}

module.exports = Generator
