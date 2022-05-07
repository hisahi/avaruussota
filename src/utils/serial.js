const shipFields = require('../game/ship').fields
const bulletFields = require('../game/bullet').fields
const powerupFields = require('../game/powerup').fields

const serializeFrom = (object, fields) => fields.map(field => object[field])
const deserializeFrom = (array, fields) => {
  const object = {}
  for (let i = 0; i < array.length; ++i) {
    object[fields[i]] = array[i]
  }
  return object
}

const serializeBullet = (obj) => serializeFrom(obj, bulletFields)
const deserializeBullet = (arr) => deserializeFrom(arr, bulletFields)

const serializePowerup = (obj) => serializeFrom(obj, powerupFields)
const deserializePowerup = (arr) => deserializeFrom(arr, powerupFields)

const serializeShip = (obj) => serializeFrom(obj, shipFields)
const deserializeShip = (arr) => deserializeFrom(arr, shipFields)

/*const encode = (data) => pson.encode(data)
const decode = (data) => pson.decode(data)
const recv = (data) => ByteBuffer.wrap(data)
const send = (ws, data) => ws.send(data.buffer)*/

/*
const encode = (data) => JSON.stringify(data)
const decode = (data) => JSON.parse(data)
const recv = (data) => data
const send = (ws, data) => ws.send(data)
*/

const C_ping = 0
const C_join = 1
const C_ctrl = 2
const C_quit = 3
const C_useitem = 4

const C_pong = 128
const C_token = 129
const C_data = 130
const C_board = 131
const C_killship = 132
const C_killproj = 133
const C_orient = 134
const C_unauth = 135
const C_addpup = 136
const C_delpup = 137
const C_minexpl = 138
const C_deathk = 139
const C_deathc = 140
const C_deathp = 141

const C_crashed = 192
const C_killed = 193
const C_hitpl = 194

const keyDictionary = {
  'cmd': 0,
  'token': 1,
  'you': 2,
  'ships': 3,
  'projs': 4,
  'count': 5,
  'rubber': 6,
  'seed': 7,
  'board': 8,
  'ship': 9,
  'proj': 10,
  'orient': 11,
  'nick': 12,
  'perk': 13,
  'time': 14,
  'angle': 15,
  'accel': 16,
  'brake': 17,
  'firing': 18,
  'powerup': 19,
  'by': 20,
}

const reverseKeyDictionary = {}
for (const key of Object.keys(keyDictionary)) {
  reverseKeyDictionary[keyDictionary[key]] = key
}

const encodeKeys = (data) => {
  const result = {}
  for (const key of Object.keys(data)) {
    const encoded = keyDictionary[key]
    if (encoded === undefined)
      result[key] = data[key]
    else
      result[encoded] = data[key]
  }
  return result
}

const decodeKeys = (data) => {
  const result = {}
  for (const key of Object.keys(data)) {
    const decoded = reverseKeyDictionary[key]
    if (decoded === undefined)
      result[key] = data[key]
    else
      result[decoded] = data[key]
  }
  return result
}

const encode = (data) => JSON.stringify(encodeKeys(data))
const decode = (data) => decodeKeys(JSON.parse(data))
const recv = (data) => data
const send = (ws, data) => ws.send(data)

// token: string
const e_token = (token) => encode({ cmd: C_token, token: token })
// ship: Ship, nearbyShips: Ship[], addBullets: Bullet[],
// playerCount: number, rubberRadius: number, planetSeed: number
const e_data = 
  (ship, nearbyShips, addBullets, playerCount, rubberRadius, planetSeed) => 
    encode({ cmd: C_data, you: serializeShip(ship),
      ships: nearbyShips.map(serializeShip),
      projs: addBullets.map(serializeBullet),
      count: playerCount, rubber: rubberRadius, seed: planetSeed })
const e_unauth = () => encode({ cmd: C_unauth })
// board: [[name, score], ...]
const e_board = (b) => encode({ cmd: C_board, board: b })
// shipId: string
const e_killship = (shipId) => encode({ cmd: C_killship, ship: shipId })
// projId: string
const e_killproj = (projId) => encode({ cmd: C_killproj, proj: projId })
// name: string
const e_crashed = (name) => encode({ cmd: C_crashed, ship: name })
// name: string
const e_killed = (name) => encode({ cmd: C_killed, ship: name })
// orient: number
const e_orient = (orient) => encode({ cmd: C_orient, orient: orient })
const e_hitpl = () => encode({ cmd: C_hitpl })
// join: string, perk: string
const e_join = (nick, perk) => encode({ cmd: C_join, nick: nick, perk: perk })
// time: number
const e_ping = (time) => encode({ cmd: C_ping, time: time })
// time: number
const e_pong = (time) => encode({ cmd: C_pong, time: time })
// token: string
const e_quit = (token) => encode({ cmd: C_quit, token: token })
// token: string, orient: number, accel: boolean, brake: boolean, firing: boolean
const e_ctrl = (token, orient, accel, brake, firing) => encode({
  cmd: C_ctrl, token: token, angle: orient, 
  accel: accel, brake: brake, firing: firing })
// powerup: Powerup
const e_addpup = (powerup) => encode({ cmd: C_addpup, powerup: serializePowerup(powerup) })
// id: string
const e_delpup = (id) => encode({ cmd: C_delpup, powerup: id })
// token: string
const e_useitem = (token) => encode({ cmd: C_useitem, token: token })
// mine: Bullet
const e_minexpl = (mine) => encode({ cmd: C_minexpl, proj: serializeBullet(mine) })
// ship: string, by: string
const e_deathk = (ship, by) => encode({ cmd: C_deathk, ship, by })
// ship: string, by: string
const e_deathc = (ship, by) => encode({ cmd: C_deathc, ship, by })
// ship: string, by: string
const e_deathp = (ship) => encode({ cmd: C_deathp, ship })

const is_ctrl = (obj) => obj.cmd === C_ctrl
const is_join = (obj) => obj.cmd === C_join
const is_ping = (obj) => obj.cmd === C_ping
const is_pong = (obj) => obj.cmd === C_pong
const is_quit = (obj) => obj.cmd === C_quit
const is_token = (obj) => obj.cmd === C_token
const is_data = (obj) => obj.cmd === C_data
const is_board = (obj) => obj.cmd === C_board
const is_killship = (obj) => obj.cmd === C_killship
const is_killproj = (obj) => obj.cmd === C_killproj
const is_crashed = (obj) => obj.cmd == C_crashed
const is_killed = (obj) => obj.cmd == C_killed
const is_hitpl = (obj) => obj.cmd == C_hitpl
const is_orient = (obj) => obj.cmd == C_orient
const is_unauth = (obj) => obj.cmd == C_unauth
const is_addpup = (obj) => obj.cmd == C_addpup
const is_delpup = (obj) => obj.cmd == C_delpup
const is_useitem = (obj) => obj.cmd == C_useitem
const is_minexpl = (obj) => obj.cmd == C_minexpl
const is_deathk = (obj) => obj.cmd == C_deathk
const is_deathc = (obj) => obj.cmd == C_deathc
const is_deathp = (obj) => obj.cmd == C_deathp

module.exports = {
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
  e_deathk,
  e_deathc,
  e_deathp,

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
  is_minexpl,
  is_deathk,
  is_deathc,
  is_deathp,

  serializeFrom,
  deserializeFrom,

  deserializeShip,
  deserializeBullet,
  deserializePowerup
}
