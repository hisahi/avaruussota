const jwt = require('jsonwebtoken')
const handler = require('./sockhandler')
const physics = require('./physics')

const JWT_SECRET = process.env.JWT_SECRET || ''

const noop = (_) => _

const onMessage = (ws, game, handle, shipId) => {
  return (msg) => {
    if (msg.includes(' ')) {
      let [token, command, ...args] = msg.split(' ')
      args = args.join(' ')
      const tokenId = jwt.verify(token, JWT_SECRET)

      if (tokenId !== shipId) {
        return
      }

      game.getShipFromId(shipId).then((ship) => {
        if (ship === null) {
          return ws.send('unrecognized')
        }

        handle(ship, command, args)
      })
    }
  }
}

const onConnectFactory = (wss) => {
  const game = require('./game')(wss)

  setInterval(() => game.deltaTick().then(() => {}), 
    1000 / physics.TICKS_PER_SECOND)

  setInterval(function ping() {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        game.disconnectSocket(ws)
        return ws.terminate()
      }
  
      ws.isAlive = false
      ws.ping(noop)
    })
  }, 30000)

  return (ws) => {
    // create ship and token
    game.newPlayer().then((ship) => {
      const token = jwt.sign(ship._id, JWT_SECRET)
      game.setLastSocket(ship, ws)
      ws.on('pong', () => { this.isAlive = true })
      ws.on('close', () => { game.disconnectSocket(ws) })
      ws.send('your_token ' + token)
      ws.on('message', onMessage(ws, game, handler(game), ship._id))
      ws.send('you ' + JSON.stringify(ship))
    })
  }
}

module.exports = onConnectFactory
