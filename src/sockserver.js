const listener = (ws) => {
  ws.send('WebSocket server is alive!')
}

module.exports = listener
