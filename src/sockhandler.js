const geom = require('./utils/geom')

const commands = {
  'accel_on': (game, ship) => game.handleAccelOn(ship).then(() => {}),
  'accel_off': (game, ship) => game.handleAccelOff(ship).then(() => {}),
  'brake_on': (game, ship) => game.handleBrakeOn(ship).then(() => {}),
  'brake_off': (game, ship) => game.handleBrakeOff(ship).then(() => {}),
  'fire': (game, ship) => game.handleFire(ship).then(() => {}),
}

const handlerFactory = (game) => {
  return (ship, cmd, args) => {
    if (cmd == 'turn') {
      const angle = geom.wrapRadianAngle(parseFloat(args))
      return angle === angle && game.handleTurn(ship, angle).then(() => {})
    }

    const func = commands[cmd]
    if (func) {
      return func(game, ship)
    }
  }
}

module.exports = handlerFactory
