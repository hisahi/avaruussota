const Cookies = require('js-cookie')
const serial = require('../src/utils/serial')
const physics = require('../src/game/physics')
const chron = require('../src/utils/chron')
const here = document.location
const tps = physics.TICKS_PER_SECOND
const TURN_UNIT = 2 * Math.PI / tps
const BASE_SELF = { dead: true, posX: 0, posY: 0, velX: 0, velY: 0, orient: 0, speedMul: 1 }
const ZOOM_LEVELS = [1.0, 1.5, 2.0]
const canvas = document.getElementById('screen')

const common = require('./common')
const cursor = require('./cursor')

let inGame = false
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
  dead: false,
  token: null,
  mouseLocked: false
}
let tpf = 1

let count = 1
let leaderboard = []
let rubber = 150
let no_data = 0
let pinger = null
let seed = 0
let zoom = 1
let last_partial = null

let resendCtrl = false

const draw = require('./draw')(canvas, self, objects, state, cursor)
const controls = require('./controls')(canvas, self, state, cursor,
  {
    useItem: () => useItem(),
    resendControls: () => resendCtrl = true,
    tryLockMouse: () => tryLockMouse(),
    nextZoom: () => nextZoom(),
  })
const joystick = require('./joystick')(self, state, controls)
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

const disconnect = () => {
  ui.disconnect()
  leaveGame()
}

const joinGame = () => {
  if (!inGame) {
    ui.joiningGame()
    ui.hideDialog()

    connectTimer = setTimeout(() => disconnect(), 5000)

    let wsproto = here.protocol.replace('http', 'ws')
    let port = here.port
    if (port) {
      port = `:${port}`
    }
    ws = new WebSocket(`${wsproto}//${here.hostname}${port}${here.pathname}`)
    inGame = true

    ws.addEventListener('message', (e) => {
      const obj = serial.decode(serial.recv(e.data))

      if (serial.is_token(obj)) {
        ui.updateOnlineStatus('in game')
        state.token = obj.token

      } else if (serial.is_pong(obj)) {
        const now = performance.now()
        ui.updateOnlineStatus(
          `in game, ping: ${Math.max(now - obj.time, 0).toFixed(1)}ms`)

      } else if (serial.is_data(obj)) {
        no_data = 0
        let you = null
        let ships = []
        let projs = null
        let oldHealth = {}
        for (const ship of objects.ships) {
          oldHealth[ship._id] = ship.health
        }

        ({ you, ships, projs, count, rubber, seed } = obj)
        you = serial.deserializeShip(you)
        ships = ships.map(serial.deserializeShip)
        projs = projs.map(serial.deserializeBullet)
        draw.setRubber(rubber)

        objects.ships = ships

        for (const ship of ships) {
          if (Object.prototype.hasOwnProperty.call(oldHealth, ship._id) && oldHealth[ship._id] > ship.health) {
            draw.addBubble({ x: ship.posX, y: ship.posY, alpha: 100, radius: 0.3 * (1 + oldHealth[ship._id] - ship.health) })
          }
        }

        if (self.dead) {
          Object.assign(self, you)
          state.dead = self.dead = false
        } else {
          if (Math.abs(you.posX - self.posX) > 0.3) {
            self.posX = (self.posX + you.posX) / 2
            self.velX = (self.velX + you.velX) / 2
          }
          if (Math.abs(you.posY - self.posY) > 0.3) {
            self.posY = (self.posY + you.posY) / 2
            self.velY = (self.velY + you.velY) / 2
          }
          if (Math.abs(you.velX - self.velX) > 0.2) {
            self.velX = you.velX
          }
          if (Math.abs(you.velY - self.velY) > 0.2) {
            self.posY = you.posY
          }
          if (controls.isAccelerating() !== (you.accel !== null)
              || controls.isBraking() !== (you.brake !== null)) {
            resendCtrl = true
          }
          ui.updateScore(you.score, self.score)
          self.name = you.name
          self.score = you.score
          state.dead = self.dead = you.dead
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
          objects.bullets = [...objects.bullets, ...projs.filter(x => x)]
        }
        ui.updatePowerup(self, state)
        physics.setPlanetSeed(seed)
        ui.updatePlayerCount(count)
        ui.updateHealthBar(self.health)

      } else if (serial.is_board(obj)) {
        leaderboard = obj.board
        ui.updateLeaderboard(leaderboard)

      } else if (serial.is_orient(obj)) {
        self.orient = obj.orient

      } else if (serial.is_unauth(obj)) {
        disconnect()

      } else if (serial.is_killed(obj)) {
        draw.explosion(self, tpf)
        leaveGame()
        ui.defeatedByPlayer(obj.ship)

      } else if (serial.is_crashed(obj)) {
        draw.explosion(self, tpf)
        leaveGame()
        ui.defeatedByCrash(obj.ship)

      } else if (serial.is_hitpl(obj)) {
        draw.explosion(self, tpf)
        leaveGame()
        ui.defeatedByPlanet(obj.ship)

      } else if (serial.is_killship(obj)) {
        const matching = objects.ships.find(ship => ship._id === obj.ship)
        if (matching !== null) {
          draw.explosion(matching, tpf)
        }
        objects.ships = objects.ships.filter(ship => ship._id !== obj.ship)

      } else if (serial.is_killproj(obj)) {
        objects.bullets = objects.bullets.filter(bullet => bullet._id !== obj.proj)

      } else if (serial.is_minexpl(obj)) {
        const mine = serial.deserializeBullet(obj.mine)
        draw.addBubble({ x: mine.posX, y: mine.posY, alpha: 200, radius: 1 })

      } else if (serial.is_addpup(obj)) {
        objects.powerups.push(serial.deserializePowerup(obj.powerup))
        ui.showPowerupAnimation()

      } else if (serial.is_delpup(obj)) {
        objects.powerups = objects.powerups.filter(powerup => powerup._id !== obj.powerup)

      } else if (serial.is_deathk(obj)) {
        ui.addDeathLog(`${obj.ship} was killed by ${obj.by}`)

      } else if (serial.is_deathc(obj)) {
        ui.addDeathLog(`${obj.ship} crashed into ${obj.by}`)

      } else if (serial.is_deathp(obj)) {
        ui.addDeathLog(`${obj.ship} crashed into a planet`)
      }
    })
    
    ws.addEventListener('open', () => {
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
        if (++no_data > 8 || ws == null) {
          disconnect()
          return
        }
        serial.send(ws, serial.e_ping(performance.now()))
      }, 500)
    })
    
    ws.addEventListener('close', () => {
      if (!state.dead) {
        disconnect()
      }
      state.dead = true
    })
  }
}

const leaveGame = () => {
  if (pinger !== null) {
    clearInterval(pinger)
    pinger = null
  }
  if (ws !== null) {
    ws.close()
  }
  if (state.mouseLocked) {
    document.exitPointerLock()
  }
  state.token = null
  state.dead = self.dead = true
  ws = null
  inGame = false

  objects.ships = []
  objects.bullets = []
  objects.powerups = []

  draw.reset()
  controls.reset()
  ui.updateOnlineStatus('offline')
  ui.showDialog()
  draw.checkSize()
  ui.updateControls(state)
}

const serverTick = () => {
  if (!ws || !self) {
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
  
  if (controls.isAccelerating()) {
    physics.accel(self, chron.timeMs() - self.accel)
  }
  if (controls.isBraking()) {
    physics.brake(self)
  }
  if (controls.isFiring() 
    && self.fireWaitTicks <= 0
    && !self.latched) {
    physics.recoil(self)
  }
  physics.inertia(self)
  if (!self.latched) {
    physics.rubberband(self, rubber)
    objects.planets = physics.getPlanets(self.posX, self.posY)
    physics.gravityShip(self, objects.planets)
  }

  for (const ship of objects.ships) {
    if (!ship.latched) {
      physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
    }
  }

  for (const bullet of objects.bullets) {
    if (bullet.type !== 'mine') {
      physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))
    }
  }
  
  ui.updateColors(self.health, performance.now())
}
setInterval(serverTick, physics.MS_PER_TICK)

let turnLeftRamp = 0
let turnRightRamp = 0

const partialTick = (delta) => {
  tpf = 1.0 * delta / physics.MS_PER_TICK

  if (!self.latched) {
    // turning
    const turnLeft = controls.isTurningLeft()
    const turnRight = controls.isTurningRight()
    if (turnLeft && !turnRight) {
      self.orient -= turnLeftRamp * TURN_UNIT * tpf
      turnLeftRamp = Math.min(1, turnLeftRamp + tpf * 0.1)
      physics.onTurn(self, chron.timeMs())
      resendCtrl = true
    } else if (turnRight && !turnLeft) {
      self.orient += turnRightRamp * TURN_UNIT * tpf
      turnRightRamp = Math.min(1, turnRightRamp + tpf * 0.1)
      physics.onTurn(self, chron.timeMs())
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
  self.posX += tpf * self.velX
  self.posY += tpf * self.velY

  for (const ship of objects.ships) {
    ship.posX += tpf * ship.velX
    ship.posY += tpf * ship.velY
  }
  for (const bullet of objects.bullets) {
    if (bullet.type == 'bullet' || bullet.type == 'laser') {
      bullet.posX += tpf * bullet.velX
      bullet.posY += tpf * bullet.velY
      bullet.dist += tpf * bullet.velocity
    } else if (bullet.type == 'mine') {
      bullet.dist += tpf / (physics.TICKS_PER_SECOND * physics.MINE_LIFETIME)
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

window.addEventListener('beforeupload', () => {
  serial.send(ws, serial.e_quit(state.token))
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
  if (last_partial != null) {
    delta = time - last_partial
    partialTick(delta)
    ui.updateOpacity(delta)
  }
  last_partial = time
  draw.frame(time, delta)
  window.requestAnimationFrame(frame)
}

window.requestAnimationFrame(frame)

ui = require('./ui')({ joinGame, tryLockMouse, nextZoom })
ui.hideLose()
leaveGame()
updateZoomText()
tryReadCookies()
