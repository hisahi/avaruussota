require('dotenv').config()
const app = require('./src/httpserver')
const sock = require('./src/sockserver')
const http = require('http')
const WebSocket = require('ws')

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || ''

if (!JWT_SECRET) {
  throw new Error('must supply non-empty JWT_SECRET in env or .env')
}

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', sock(wss))

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
