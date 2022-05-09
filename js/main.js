const Cookies = require('js-cookie')
const serial = require('../src/utils/serial')
const physics = require('../src/game/physics')
const here = document.location
const tps = physics.TICKS_PER_SECOND
const TURN_UNIT = 2 * Math.PI / tps
const BASE_SELF = { dead: true, posX: 0, posY: 0, velX: 0, velY: 0, orient: 0, speedMul: 1 }
const ZOOM_LEVELS = [1.0, 1.5, 2.0]
const canvas = document.getElementById('screen')

const common = require('./common')
const cursor = require('./cursor')

let ws = null
let self = BASE_SELF
let connectTimer = null

let objects = {
  ships: [],
  bullets: [],
  powerups: [],
  planets: []
}
let state = {
  ingame: false,
  dead: false,
  token: null,
  mouseLocked: false
}
let ticksPerFrame = 1

let count = 1
let leaderboard = []
let rubber = 150
let no_data = 0
let pinger = null
let seed = 0
let zoom = 1
let lastPartialTick = null

const PING_SMOOTHING = 5
let gotPing = false
let pingIndex = 0
let smoothedPings = Array(PING_SMOOTHING)

let resendCtrl = false

const draw = require('./draw')(canvas, self, objects, state, cursor)
const controls = require('./controls')(canvas, self, state, cursor,
  {
    useItem: () => useItem(),
    resendControls: () => resendCtrl = true,
    tryLockMouse: (e) => tryLockMouse(e),
    nextZoom: () => nextZoom(),
  })
const joystick = require('./joystick')(self, state, controls)
const tick = require('./tick')(self, objects, controls)
let ui

draw.checkSize()

const updateZoomText = () => {
  ui.updateZoomText(zoom)
  draw.checkSize()
}

const setZoom = z => {
  zoom = z
  draw.setZoom(z)
  updateZoomText()
}

const nextZoom = () => {
  let indx = (ZOOM_LEVELS.indexOf(zoom) + 1) % ZOOM_LEVELS.length
  if (indx < 0) {
    indx += ZOOM_LEVELS.length
  }
  Cookies.set('avaruuspeli-zoom', indx, { sameSite: 'strict' })
  setZoom(ZOOM_LEVELS[indx])
}

const resetPing = () => {
  pingIndex = 0
  gotPing = false
}

const pingReport = (ping) => {
  ping = Math.max(ping, 0)
  if (!gotPing) {
    gotPing = true
    smoothedPings.fill(ping)
  } else {
    smoothedPings[pingIndex++] = ping
    pingIndex %= PING_SMOOTHING
  }
}

const getSmoothedPing = () => {
  if (!gotPing) return 0
  let aggregate = 0
  let weightSum = 0
  const p2 = (pingIndex + PING_SMOOTHING - 2) % PING_SMOOTHING
  const p1 = (pingIndex + PING_SMOOTHING - 1) % PING_SMOOTHING
  for (let i = 0; i < PING_SMOOTHING; ++i) {
    let weight
    if (i === p1) {
      weight = 4
    } else if (i === p2) {
      weight = 2
    } else {
      weight = 1
    }
    aggregate += smoothedPings[i] * weight
    weightSum += weight
  }
  return aggregate / weightSum
}

const onConnect = () => {
  state.ingame = true
  state.dead = false
  if (connectTimer !== null) {
    clearTimeout(connectTimer)
    connectTimer = null
  }
  let nick = document.getElementById('nick').value.trim()
  const perk = document.getElementById('perkselect').value.trim()
  if (nick.length < 1) {
    nick = ((100000000 * Math.random()) | 0).toString()
  } else {
    Cookies.set('avaruuspeli-name', nick)
  }
  Cookies.set('avaruuspeli-perk', perk)
  ui.updateOnlineStatus('waiting for spawn')
  serial.send(ws, serial.e_join(nick, perk))
  draw.checkSize()
  ui.updateControls(state)
  joystick.resetJoystickCenter()
  pinger = setInterval(() => {
    if (++no_data > 10 || ws === null) {
      disconnect()
      return
    }
    serial.send(ws, serial.e_ping(performance.now()))
  }, 500)
}

const disconnect = () => {
  if (ws) {
    ws.dead = true
    if (ws) ws.close()
    ws = null
  }
  if (self.dead) {
    reset()
    ui.endOfBuffer()
  } else {
    ui.disconnect()
  }
  wasKilled()
  leaveGame()
}

const gotData = obj => {
  let you = null
  let ships = []
  let projs = null
  let oldHealth = {}
  for (const ship of objects.ships) {
    oldHealth[ship._id] = ship.health
  }

  ({ you, ships, projs, count, rubber, seed } = obj)
  draw.setRubber(rubber)

  objects.ships = ships

  for (const ship of ships) {
    if (Object.prototype.hasOwnProperty.call(oldHealth, ship._id) && oldHealth[ship._id] > ship.health) {
      draw.addBubble({ x: ship.posX, y: ship.posY, alpha: 100, radius: 0.3 * (1 + oldHealth[ship._id] - ship.health) })
    }
  }

  if (self.dead) {
    Object.assign(self, you)
    self.dead = false
  } else {
    // if there is a high velocity difference, average them out
    if (Math.abs(you.posX - self.posX) > 0.2) {
      self.posX = (self.posX + 3 * you.posX) / 4
      self.velX = (self.velX + you.velX) / 2
    }
    if (Math.abs(you.posY - self.posY) > 0.2) {
      self.posY = (self.posY + 3 * you.posY) / 4
      self.velY = (self.velY + you.velY) / 2
    }
    if (Math.abs(you.velX - self.velX) > 5) {
      self.velX = you.velX
    }
    if (Math.abs(you.velY - self.velY) > 5) {
      self.posY = you.posY
    }
    
    if (controls.isAccelerating() !== (you.accel !== null)
        || controls.isBraking() !== (you.brake !== null)) {
      resendCtrl = true
    }
    ui.updateScore(you.score, self.score)
    self.name = you.name
    self.score = you.score
    self.dead = you.dead
    if (you.health < self.health) {
      draw.gotDamage(self.health - you.health)
      draw.addBubble({ x: self.posX, y: self.posY, alpha: 100, radius: 0.3 * (1 + self.health - you.health) })
    }
    self.health = you.health
    self.latched = you.latched
    self.speedMul = you.speedMul
    self.item = you.item
    self.regen = you.regen
    self.overdrive = you.overdrive
    self.rubbership = you.rubbership
  }
  if (physics.getPlanetSeed() != seed) {
    physics.setPlanetSeed(seed)
    objects.planets = physics.getPlanets(self.posX, self.posY)
  }
  if (projs.length) {
    objects.bullets = [...objects.bullets, ...projs.filter(x => x).
      map(bullet => ({ ...bullet, syncPosX: bullet.posX, syncPosY: bullet.posY }))]
  }
  ui.updatePowerup(self, state)
  physics.setPlanetSeed(seed)
  ui.updatePlayerCount(count)
  ui.updateHealthBar(self.health)
}

const joinGame = () => {
  if (state.ingame && ws !== null) {
    state.token = null
    ws.dead = true
    if (ws) ws.close()
    ws = null
  }
  reset()
  state.token = null
  ui.joiningGame()
  ui.hideDialog()

  resetPing()
  
  connectTimer = setTimeout(() => disconnect(), 5000)

  let wsproto = here.protocol.replace('http', 'ws')
  let port = here.port
  if (port) {
    port = `:${port}`
  }
  ws = new WebSocket(`${wsproto}//${here.hostname}${port}${here.pathname}`)
  ws.binaryType = 'arraybuffer'
  state.ingame = true

  ws.addEventListener('message', (e) => {
    const socket = e.target
    if (socket.dead) return
    let data = serial.recv(e.data)
    if (data instanceof ArrayBuffer)
      data = new Uint8Array(data)
    const [cmd, obj] = serial.decode(data)

    switch (cmd) {
    case serial.C_token:
      ui.updateOnlineStatus('in game')
      state.token = obj.token
      break

    case serial.C_pong:
      pingReport(performance.now() - obj.time)
      ui.updateOnlineStatus(
        `${self.dead ? 'game over' : 'in game'}, ping: ${getSmoothedPing().toFixed(1)}ms`)
      break

    case serial.C_data:
      no_data = 0
      obj.you = serial.deserializeShip(obj.you)
      obj.ships = obj.ships.map(serial.deserializeShip)
      obj.projs = obj.projs.map(serial.deserializeBullet)
      gotData(obj)
      state.dead = self.dead
      break

    case serial.C_board:
      if (self.dead) break
      leaderboard = obj.board
      ui.updateLeaderboard(leaderboard)
      break

    case serial.C_orient:
      self.orient = obj.orient
      break

    case serial.C_unauth:
      disconnect()
      break

    case serial.C_killed:
      draw.explosion(self, ticksPerFrame)
      ui.defeatedByPlayer(obj.ship)
      wasKilled()
      break

    case serial.C_crashed:
      draw.explosion(self, ticksPerFrame)
      ui.defeatedByCrash(obj.ship)
      wasKilled()
      break

    case serial.C_hitpl:
      draw.explosion(self, ticksPerFrame)
      ui.defeatedByPlanet(obj.ship)
      wasKilled()
      self.velX = 0
      self.velY = 0
      break

    case serial.C_killship:
      obj.ship = serial.deserializeShip(obj.ship)
      if (objects.ships.find(ship => ship._id === obj.ship._id) !== null) {
        draw.explosion(obj.ship, ticksPerFrame)
      }
      objects.ships = objects.ships.filter(ship => ship._id !== obj.ship._id)
      break

    case serial.C_killproj:
      objects.bullets = objects.bullets.filter(bullet => bullet._id !== obj.proj)
      break

    case serial.C_minexpl:
    {
      const mine = serial.deserializeBullet(obj.mine)
      draw.addBubble({ x: mine.posX, y: mine.posY, alpha: 200, radius: 1 })
      break
    }

    case serial.C_addpup:
      if (self.dead) break
      objects.powerups.push(serial.deserializePowerup(obj.powerup))
      ui.showPowerupAnimation()
      break

    case serial.C_delpup:
      objects.powerups = objects.powerups.filter(powerup => powerup._id !== obj.powerup)
      break

    case serial.C_deathk:
      ui.addDeathLog(`${obj.ship} was killed by ${obj.by}`)
      break

    case serial.C_deathc:
      ui.addDeathLog(`${obj.ship} crashed into ${obj.by}`)
      break

    case serial.C_deathp:
      ui.addDeathLog(`${obj.ship} crashed into a planet`)
      break

    case serial.C_addpups:
      objects.powerups.push(...obj.powerups.map(serial.deserializePowerup))
      break
    }
  })
  
  ws.addEventListener('open', () => {
    onConnect()
  })
  
  ws.addEventListener('close', (e) => {
    const socket = e.target
    if (socket.dead) return
    if (socket !== ws) return

    if (state.ingame) {
      disconnect()
    }
    state.ingame = false
    state.dead = true
  })
}

const reset = () => {
  objects.ships = []
  objects.bullets = []
  objects.powerups = []
  objects.planets = []
  draw.reset()
  controls.reset()
}

const wasKilled = () => {
  if (state.mouseLocked) {
    document.exitPointerLock()
  }
  no_data = 0
  state.dead = self.dead = true
  state.token = null
  ui.wasKilled()
  ui.showDialog()
  draw.checkSize()
}

const leaveGame = () => {
  if (pinger !== null) {
    clearInterval(pinger)
    pinger = null
  }
  state.dead = self.dead = true
  state.ingame = false

  ui.updateOnlineStatus('offline')
  ui.showDialog()
  draw.checkSize()
  ui.updateControls(state)
}

const serverTick = () => {
  if (!ws || !self || self.dead) {
    self.velX *= 0.95
    self.velY *= 0.95
    return
  }

  if (!state.token) {
    return
  }

  if (resendCtrl) {
    serial.send(ws, serial.e_ctrl(state.token, self.orient, 
      controls.isAccelerating(), controls.isBraking(), controls.isFiring()))
    resendCtrl = false
  }
  
  tick.serverTick(physics.TICK_DELTA, rubber)
  ui.updateColors(self.health, performance.now())
}
setInterval(serverTick, physics.MS_PER_TICK)

let turnLeftRamp = 0
let turnRightRamp = 0

const partialTick = (delta) => {
  if (self.dead) return
  ticksPerFrame = 1000 * delta / physics.MS_PER_TICK

  if (!self.latched) {
    // turning
    const turnLeft = controls.isTurningLeft()
    const turnRight = controls.isTurningRight()
    if (turnLeft && !turnRight) {
      self.orient -= turnLeftRamp * TURN_UNIT * ticksPerFrame
      turnLeftRamp = Math.min(1, turnLeftRamp + ticksPerFrame * 0.1)
      //physics.onTurn(self, chron.timeMs())
      resendCtrl = true
    } else if (turnRight && !turnLeft) {
      self.orient += turnRightRamp * TURN_UNIT * ticksPerFrame
      turnRightRamp = Math.min(1, turnRightRamp + ticksPerFrame * 0.1)
      //physics.onTurn(self, chron.timeMs())
      resendCtrl = true
    }
    if (!turnLeft)
      turnLeftRamp = 0
    if (!turnRight)
      turnRightRamp = 0
  } else {
    turnLeftRamp = 0
    turnRightRamp = 0
  }
  
  // interpolate
  self.posX += delta * self.velX
  self.posY += delta * self.velY

  for (const ship of objects.ships) {
    ship.posX += delta * ship.velX
    ship.posY += delta * ship.velY
  }
  for (const bullet of objects.bullets) {
    switch (bullet.type) {
    case 'bullet':
    case 'laser':
    case 'knockout':
      bullet.posX += delta * bullet.velX
      bullet.posY += delta * bullet.velY
      bullet.dist += delta * bullet.velocity
      break
    case 'mine':
      bullet.dist += delta / (physics.TICKS_PER_SECOND * physics.MINE_LIFETIME)
    }
  }
  objects.bullets = objects.bullets.filter(b => b.dist <= physics.MAX_BULLET_DISTANCE)
}

const useItem = () => {
  if (self.item !== null) {
    serial.send(ws, serial.e_useitem(state.token))
    self.item = null
  }
}

const tryLockMouse = (e) => {
  if (common.isMobile()) {
    return
  }
  cursor.setPosition(e.clientX, e.clientY)
  canvas.requestPointerLock()
}

window.addEventListener('blur', () => {
  if (!state.token || state.dead) {
    return
  }
  controls.unpress()
}, true)

window.addEventListener('beforeunload', () => {
  if (ws) serial.send(ws, serial.e_quit(state.token))
}, true)

const tryReadCookies = () => {
  const name = Cookies.get('avaruuspeli-name')
  if (name) {
    document.getElementById('nick').value = name.substring(0, 20).trim()
  }
  const perk = Cookies.get('avaruuspeli-perk')
  if (perk) {
    document.getElementById('perkselect').value = ''
    for (let i = 0; i < document.getElementById('perkselect').options.length; ++i) {
      const option = document.getElementById('perkselect').options[i]
      if (option.value == perk) {
        option.selected = true
        break
      }
    }
  }
  const cookieZoom = Cookies.get('avaruuspeli-zoom') | 0
  if (isFinite(cookieZoom)) {
    setZoom(ZOOM_LEVELS[cookieZoom % ZOOM_LEVELS.length])
  }
}

const frame = time => {
  let delta = 0
  if (lastPartialTick != null) {
    delta = time - lastPartialTick
    partialTick(delta / 1000)
    ui.updateOpacity(delta)
  }
  lastPartialTick = time
  draw.frame(time, delta)
  window.requestAnimationFrame(frame)
}

window.requestAnimationFrame(frame)

ui = require('./ui')({ joinGame, tryLockMouse, nextZoom })
reset()
ui.showDialog(true)
leaveGame()
updateZoomText()
ui.endOfBuffer()
ui.reset()
tryReadCookies()
