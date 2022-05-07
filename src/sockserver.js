const serial = require('./utils/serial')
const jwt = require('jsonwebtoken')
const handler = require('./sockhandler')
const physics = require('./game/physics')
const gameFactory = require('./game')

const JWT_SECRET = process.env.JWT_SECRET || ''

const noop = (_) => _

const onMessage = (ws, game, handle, shipId) => {
  return (msg) => {
    const obj = serial.decode(serial.recv(msg))
    if (serial.is_ping(obj)) {
      serial.send(ws, serial.e_pong(obj.time))
    } else if (serial.is_join(obj)) {
      const ship = game.newPlayer()
      const token = jwt.sign(ship._id, JWT_SECRET)
      game.setLastSocket(ship, ws)
      shipId = ship._id
      serial.send(ws, serial.e_token(token))
      game.welcome(ship, ws)
      game.handleNick(ship, obj.nick || '', obj.perk || '')
    } else if (obj.token && shipId !== null) {
      const tokenId = jwt.verify(obj.token, JWT_SECRET)

      if (tokenId !== shipId) {
        return
      }

      const ship = game.getShipById(shipId)
      if (ship === null || ship === undefined) {
        return serial.send(ws, serial.e_unauth())
      }

      if (serial.is_quit(obj)) {
        game.leavePlayer(ship)
        game.disconnectSocket(ws)
        return
      }

      handle(ship, obj)
    }
  }
}

const onConnectFactory = (wss) => {
  const game = gameFactory(wss)

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
