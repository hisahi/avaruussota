const jwt = require('jsonwebtoken')
const handler = require('./sockhandler')
const physics = require('./physics')

const JWT_SECRET = process.env.JWT_SECRET || ''

const noop = (_) => _

const onMessage = (ws, game, handle, shipId) => {
  return (msg) => {
    if (msg.startsWith('ping')) {
      ws.send(msg.replace('ping', 'pong'))
    } else if (msg.includes(' ') && shipId !== null) {
      let [token, command, ...args] = msg.split(' ')
      args = args.join(' ')
      const tokenId = jwt.verify(token, JWT_SECRET)

      if (tokenId !== shipId) {
        return
      }

      const ship = game.getShipFromId(shipId)
      if (ship === null) {
        return ws.send('unrecognized')
      }

      if (command == 'disconnect') {
        game.leavePlayer(ship)
        game.disconnectSocket(ws)
        return
      }

      handle(ship, command, args)
    } else if (msg == 'join') {
      const ship = game.newPlayer()
      const token = jwt.sign(ship._id, JWT_SECRET)
      game.setLastSocket(ship, ws)
      shipId = ship._id
      ws.send(`your_token ${token}`)
      ws.send(`data ${JSON.stringify([ship, [], [], 1, 75])}`)
      game.welcome(ship, ws)
    }
  }
}

const onConnectFactory = (wss) => {
  const game = require('./game')(wss)

  setInterval(() => game.deltaTick(), 
    1000 / physics.TICKS_PER_SECOND)

  setInterval(function ping() {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log(`ping timeout: ${ws}`)
        game.disconnectSocket(ws)
        return ws.terminate()
      }
  
      ws.isAlive = false
      ws.ping(noop)
    })
  }, 10000)

  return (ws) => {
    // create ship and token
    ws.on('pong', () => { ws.isAlive = true })
    ws.on('close', () => { game.disconnectSocket(ws) })
    ws.on('message', onMessage(ws, game, handler(game), null))
  }
}

module.exports = onConnectFactory
