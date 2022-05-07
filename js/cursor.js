let cursorX = -10
let cursorY = -10

const setPosition = (x, y) => (cursorX = x, cursorY = y)
const addPosition = (x, y) => (cursorX += x, cursorY += y)
const getX = () => cursorX
const getY = () => cursorY

module.exports = {
  setPosition,
  addPosition,
  getX,
  getY
}
