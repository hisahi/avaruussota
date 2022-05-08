
const randomSign = () => {
  return 2 * ((2 * Math.random()) | 0) - 1
}

const squarePair = (x, y) => x ** 2 + y ** 2

const padFromBelow = (p, v) => p + (1 - p) * v

module.exports = {
  randomSign,
  squarePair,
  padFromBelow }
