require('dotenv').config()
const app = require('./src/httpserver')
const sock = require('./src/sockserver')
const http = require('http')
const WebSocket = require('ws')

const PORT = process.env.PORT || 5000
const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', sock)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
