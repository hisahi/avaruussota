const ByteBuffer = require('bytebuffer')

module.exports = (PSON) => {
  const pson = new PSON.StaticPair(require('./psondict'))

  const encode = (data) => pson.encode(data)
  const decode = (data) => pson.decode(data)
  const recv = (data) => ByteBuffer.fromBinary(data)
  const send = (ws, data) => ws.send(data.toBinary())

  const e_token = (token) => encode({ cmd: 'token', token: token })
  const e_data = 
    (ship, nearbyShips, addBullets, playerCount, rubberRadius, planetSeed) => 
      encode({ cmd: 'data', you: ship, ships: nearbyShips,
        projs: addBullets, count: playerCount, rubber: rubberRadius,
        seed: planetSeed })
  const e_unauth = () => encode({ cmd: 'unauth' })
  const e_board = (b) => encode({ cmd: 'board', board: b })
  const e_killship = (ship) => encode({ cmd: 'killship', ship: ship._id })
  const e_killproj = (proj) => encode({ cmd: 'killproj', proj: proj._id })
  const e_crashed = (name) => encode({ cmd: 'crashed', ship: name })
  const e_killed = (name) => encode({ cmd: 'killed', ship: name })
  const e_orient = (orient) => encode({ cmd: 'orient', orient: orient })
  const e_hitpl = () => encode({ cmd: 'hitpl' })
  const e_join = (nick, perk) => encode({ cmd: 'join', nick: nick, perk: perk })
  const e_ping = (time) => encode({ cmd: 'ping', time: time })
  const e_pong = (time) => encode({ cmd: 'pong', time: time })
  const e_quit = (token) => encode({ cmd: 'quit', token: token })
  const e_ctrl = (token, orient, accel, brake, firing) => encode({
    cmd: 'ctrl', token: token, angle: orient, 
    accel: accel, brake: brake, firing: firing })
  const e_addpup = (powerup) => encode({ cmd: 'addpup', powerup: powerup })
  const e_delpup = (powerup) => encode({ cmd: 'delpup', powerup: powerup })
  const e_useitem = (token) => encode({ cmd: 'useitem', token: token })
  const e_minexpl = (mine) => encode({ cmd: 'minexpl', proj: mine })

  const is_ctrl = (obj) => obj.cmd === 'ctrl'
  const is_join = (obj) => obj.cmd === 'join'
  const is_ping = (obj) => obj.cmd === 'ping'
  const is_pong = (obj) => obj.cmd === 'pong'
  const is_quit = (obj) => obj.cmd === 'quit'
  const is_token = (obj) => obj.cmd === 'token'
  const is_data = (obj) => obj.cmd === 'data'
  const is_board = (obj) => obj.cmd === 'board'
  const is_killship = (obj) => obj.cmd === 'killship'
  const is_killproj = (obj) => obj.cmd === 'killproj'
  const is_crashed = (obj) => obj.cmd == 'crashed'
  const is_killed = (obj) => obj.cmd == 'killed'
  const is_hitpl = (obj) => obj.cmd == 'hitpl'
  const is_orient = (obj) => obj.cmd == 'orient'
  const is_unauth = (obj) => obj.cmd == 'unauth'
  const is_addpup = (obj) => obj.cmd == 'addpup'
  const is_delpup = (obj) => obj.cmd == 'delpup'
  const is_useitem = (obj) => obj.cmd == 'useitem'
  const is_minexpl = (obj) => obj.cmd == 'minexpl'
  
  return {
    encode,
    decode,
    recv,
    send,

    e_token,
    e_data,
    e_unauth,
    e_board,
    e_killship,
    e_killproj,
    e_crashed,
    e_killed,
    e_orient,
    e_hitpl,
    e_join,
    e_ping,
    e_pong,
    e_ctrl,
    e_quit,
    e_addpup,
    e_delpup,
    e_useitem,
    e_minexpl,

    is_ctrl,
    is_join,
    is_ping,
    is_pong,
    is_quit,
    is_token,
    is_data,
    is_board,
    is_killship,
    is_killproj,
    is_crashed,
    is_killed,
    is_hitpl,
    is_orient,
    is_unauth,
    is_addpup,
    is_delpup,
    is_useitem,
    is_minexpl
  }
}
