const geom = require('./utils/geom')

const commands = {
  'fire': (game, ship) => game.handleFire(ship),
}

const handlerFactory = (game) => {
  return (ship, cmd, args) => {
    if (cmd == 'control') {
      let [angle, accel, brake] = JSON.parse(args)
      angle = geom.wrapRadianAngle(angle)
      return game.handleControl(ship, angle, accel, brake)
    }

    const func = commands[cmd]
    if (func) {
      return func(game, ship)
    }
  }
}

module.exports = handlerFactory
