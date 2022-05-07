const serial = require('./utils/serial')
const geom = require('./utils/geom')

const handlerFactory = (game) => {
  return (ship, obj) => {
    if (serial.is_ctrl(obj)) {
      let { angle, accel, brake, firing } = obj
      angle = geom.wrapRadianAngle(angle)
      return game.handleControl(ship, angle, accel, brake, firing)
    } else if (serial.is_useitem(obj)) {
      return game.handleUseItem(ship)
    }
  }
}

module.exports = handlerFactory
