const msgpackr = require('msgpackr')

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
const C_addpups = 142

const C_crashed = 192
const C_killed = 193
const C_hitpl = 194

const encode = (cmd, data) => {
  return msgpackr.pack([cmd, ...messageKeys[cmd].map(key => data[key])])
}

const decode = (data) => {
  const array = msgpackr.unpack(data)
  const cmd = array[0]
  return [ cmd, Object.fromEntries(messageKeys[cmd].map((key, index) => [key, array[index + 1]])) ]
}

const recv = (data) => data
const send = (ws, data) => ws.send(data)

const messageKeys = {
  [C_token]: ['token'],
  [C_data]: ['you', 'ships', 'projs', 'count', 'rubber', 'seed'],
  [C_unauth]: [],
  [C_board]: ['board'],
  [C_killship]: ['ship'],
  [C_killproj]: ['proj'],
  [C_crashed]: ['ship'],
  [C_killed]: ['ship'],
  [C_orient]: ['orient'],
  [C_hitpl]: [],
  [C_join]: ['nick', 'perk'],
  [C_ping]: ['time'],
  [C_pong]: ['time'],
  [C_quit]: ['token'],
  [C_ctrl]: ['token', 'orient', 'accel', 'brake', 'firing'],
  [C_addpup]: ['powerup'],
  [C_delpup]: ['powerup'],
  [C_useitem]: ['token'],
  [C_minexpl]: ['proj'],
  [C_deathk]: ['ship', 'by'],
  [C_deathc]: ['ship', 'by'],
  [C_deathp]: ['ship'],
  [C_addpups]: ['powerups'],
}

// token: string
const e_token = (token) => encode(C_token, { token })
// you: Ship, ship: Ship[], projs: Bullet[],
// count: number, rubber: number, seed: number
const e_data = (you, ships, projs, count, rubber, seed) => 
  encode(C_data, { you: serializeShip(you),
    ships: ships.map(serializeShip),
    projs: projs.map(serializeBullet),
    count, rubber, seed })
const e_unauth = () => encode(C_unauth)
// board: [[name, score], ...]
const e_board = (board) => encode(C_board, { board })
// ship: ship
const e_killship = (ship) => encode(C_killship, { ship: serializeShip(ship) })
// proj: string (id)
const e_killproj = (proj) => encode(C_killproj, { proj })
// name: string (name)
const e_crashed = (ship) => encode(C_crashed, { ship })
// name: string (name)
const e_killed = (ship) => encode(C_killed, { ship })
// orient: number
const e_orient = (orient) => encode(C_orient, { orient })
const e_hitpl = () => encode(C_hitpl)
// join: string, perk: string
const e_join = (nick, perk) => encode(C_join, { nick, perk })
// time: number
const e_ping = (time) => encode(C_ping, { time })
// time: number
const e_pong = (time) => encode(C_pong, { time })
// token: string
const e_quit = (token) => encode(C_quit, { token })
// token: string, orient: number, accel: boolean, brake: boolean, firing: boolean
const e_ctrl = (token, orient, accel, brake, firing) => encode(C_ctrl, {
  token, orient, accel, brake, firing })
// powerup: Powerup
const e_addpup = (powerup) => encode(C_addpup, { powerup: serializePowerup(powerup) })
// powerup: (ID) string
const e_delpup = (powerup) => encode(C_delpup, { powerup })
// token: string
const e_useitem = (token) => encode(C_useitem, { token })
// proj: Bullet
const e_minexpl = (proj) => encode(C_minexpl, { proj: serializeBullet(proj) })
// ship: string, by: string
const e_deathk = (ship, by) => encode(C_deathk, { ship, by })
// ship: string, by: string
const e_deathc = (ship, by) => encode(C_deathc, { ship, by })
// ship: string, by: string
const e_deathp = (ship) => encode(C_deathp, { ship })
// powerups: Powerup[]
const e_addpups = (powerups) => encode(C_addpups, { powerups: powerups.map(serializePowerup) })

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
  e_addpups,

  C_ctrl,
  C_join,
  C_ping,
  C_pong,
  C_quit,
  C_token,
  C_data,
  C_board,
  C_killship,
  C_killproj,
  C_crashed,
  C_killed,
  C_hitpl,
  C_orient,
  C_unauth,
  C_addpup,
  C_delpup,
  C_useitem,
  C_minexpl,
  C_deathk,
  C_deathc,
  C_deathp,
  C_addpups,

  serializeFrom,
  deserializeFrom,

  deserializeShip,
  deserializeBullet,
  deserializePowerup
}
