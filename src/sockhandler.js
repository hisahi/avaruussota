const geom = require('./utils/geom')

const handlerFactory = (game) => {
  return (ship, cmd, args) => {
    if (cmd == 'control') {
      let [angle, accel, brake, firing] = JSON.parse(args)
      angle = geom.wrapRadianAngle(angle)
      return game.handleControl(ship, angle, accel, brake, firing)
    } else if (cmd == 'nick') {
      return game.handleNick(ship, args)
    }
  }
}

module.exports = handlerFactory
