const serial = require('./utils/serial')
const geom = require('./utils/geom')

const handlerFactory = (game) => {
  return (ship, cmd, obj) => {
    if (cmd === serial.C_ctrl) {
      let { orient, accel, brake, firing } = obj
      orient = geom.wrapRadianAngle(orient)
      return game.handleControl(ship, orient, accel, brake, firing)
    } else if (cmd === serial.C_useitem) {
      return game.handleUseItem(ship)
    }
  }
}

module.exports = handlerFactory
