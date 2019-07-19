const PSON = require('pson')
const Cookies = require('js-cookie')
const serial = require('../src/utils/serial')(PSON)
const physics = require('../src/physics')
const geom = require('../src/utils/geom')
const chron = require('../src/utils/chron')
const LCG = require('../src/utils/lcg')
const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')
const here = document.location
const tps = physics.TICKS_PER_SECOND
const GRID_SIZE = 10
const TURN_UNIT = 2 * Math.PI / tps
const TICK_MS = 1000 / tps
const PLANET_SPIN_SPEED = 0.02
const BASE_SELF = { dead: true, posX: 0, posY: 0, velX: 0, velY: 0, orient: 0, speedMul: 1 }
const ZOOM_LEVELS = [1.0, 1.5, 2.0, 2.5]
const SQRT_H = Math.sqrt(0.5)
const MINE_X = [0, SQRT_H, 1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H]
const MINE_Y = [1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H, 0, SQRT_H]

let lcg = new LCG(0)
let inGame = false
let ws = null
let token = null
let self = BASE_SELF
let connectTimer = null

let dead = false
let firing = false
let accel = false
let accelStart = 0
let brake = false
let turn_left = false
let turn_right = false
let turn_left_ramp = 0
let turn_right_ramp = 0

let ships = []
let bullets = []
let lines = []
let planets = []
let smokes = []
let bubbles = []
let powerups = []
let tpf = 1
let planetAngle = 0
let count = 1
let leaderboard = []
let rubber = 150
let no_data = 0
let pinger = null
let seed = 0
let dialogOpacity = 0
let damageAlpha = 0
let damageGot = 0
let zoom = 1
let cursorX = -10
let cursorY = -10

let lastSmoke = {}

let last_partial = null
let send_turn = false
let mouse_locked = false

let firingInterval = 200

document.getElementById('scoreanimation').style.animation = 'none'
document.getElementById('scoreanimation').style.visibility = 'hidden'
document.getElementById('powerupanimation').style.animation = 'none'
document.getElementById('powerupanimation').style.visibility = 'hidden'

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

if (isMobile()) {
  zoom = 1.5
}

const updateZoomText = () => {
  document.getElementById('btnzoom').textContent = `zoom: ${(zoom * 100) | 0}%`
}

const nextZoom = (f) => {
  let indx = (ZOOM_LEVELS.indexOf(zoom) + f) % ZOOM_LEVELS.length
  if (indx < 0) {
    indx += ZOOM_LEVELS.length
  }
  zoom = ZOOM_LEVELS[indx]
  Cookies.set('avaruuspeli-zoom', indx)
  updateZoomText()
}

const checkSize = () => {
  if (dead) {
    document.getElementById('mobilecontrols').style.display = 'none'
  } else {
    document.getElementById('mobilecontrols').style.display = isMobile() ? 'block' : 'none'
  }
}

document.addEventListener('resize', () => checkSize())
checkSize()
updateZoomText()

const showDialog = () => {
  dialogOpacity = 0
  document.getElementById('dialogbox').style.opacity = '0'
  document.getElementById('dialog').style.display = 'flex'
  document.getElementById('stats').style.display = 'none'
  document.getElementById('finalscore').style.display = 'block'
  document.body.style.position = 'absolute'
  document.body.style.overflow = ''
}

const hideDialog = () => {
  document.getElementById('dialog').style.display = 'none'
  document.getElementById('stats').style.display = 'block'
  document.body.style.position = 'relative'
  document.body.style.overflow = 'hidden'
}

const hideLose = () => {
  document.getElementById('defeat').style.display = 'none'
  document.getElementById('defeatcrash').style.display = 'none'
  document.getElementById('defeatplanet').style.display = 'none'
  document.getElementById('defeatname').style.display = 'none'
  document.getElementById('disconnected').style.display = 'none'
  document.getElementById('finalscore').style.display = 'none'
}

const disconnect = () => {
  hideLose()
  document.getElementById('disconnected').style.display = 'inline'
  leaveGame()
}

const formatTime = (sec) => {
  sec = Math.floor(sec)
  return `${0 | (sec / 60)}:${('0' + (sec % 60)).slice(-2)}`
}

const updatePowerup = () => {
  let resText = ''
  if (!dead) {
    if (self.item !== null) {
      if (isMobile()) {
        resText += `item: ${self.item} ([USE] to use)\n`
      } else {
        resText += `item: ${self.item} ([Q] to use)\n`
      }
    }
    if (self.rubbership > 0) {
      resText += `[${formatTime(self.rubbership / 1000)}] rubber ship\n`
    }
    if (self.overdrive > 0) {
      resText += `[${formatTime(self.overdrive / 1000)}] overdrive\n`
    }
    if (self.regen > 0) {
      resText += `[${formatTime(self.regen / 1000)}] regen\n`
    }
  }
  document.getElementById('powerupstatus').textContent = resText.trim()
  document.getElementById('btnconsume').style.display = self.item !== null ? 'block' : 'none'
}

const joinGame = () => {
  if (!inGame) {
    document.getElementById('scoreanimation').style.animation = 'none'
    document.getElementById('scoreanimation').style.visibility = 'hidden'
    document.getElementById('powerupanimation').style.animation = 'none'
    document.getElementById('powerupanimation').style.visibility = 'hidden'
    document.getElementById('onlinestatus').textContent = 'connecting'

    connectTimer = setTimeout(() => disconnect(), 5000)
    firingInterval = document.getElementById('perkselect').value.trim() == 'fasterrate' ? 150 : 200

    document.getElementById('btnplay').blur()
    hideDialog()
    resetJoystickCenter()

    lines = []
    smokes = []
    bubbles = []

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
        document.getElementById('onlinestatus').textContent = 'in game'
        token = obj.token
      } else if (serial.is_pong(obj)) {
        const now = performance.now()
        document.getElementById('onlinestatus').textContent = 
          `in game, ping: ${Math.max(now - obj.time, 0).toFixed(1)}ms`
      } else if (serial.is_data(obj)) {
        no_data = 0
        let you = null
        let projs = null
        let oldHealth = {}
        for (const ship of ships) {
          oldHealth[ship._id] = ship.health
        }

        ({ you, ships, projs, count, rubber, seed } = obj)
        
        for (const ship of ships) {
          if (oldHealth.hasOwnProperty(ship._id) && oldHealth[ship._id] > ship.health) {
            bubbles.push({ x: ship.posX, y: ship.posY, alpha: 100, radius: 0.3 * (1 + oldHealth[ship._id] - ship.health) })
          }
        }

        if (self.dead) {
          self = you
          self.dead = false
          self.highAgility = document.getElementById('perkselect').value.trim() == 'movespeed'
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
          if (!accel && you.accel !== null) {
            send_turn = true
          } else if (accel && you.accel === null) {
            send_turn = true
          } else if (!brake && you.brake !== null) {
            send_turn = true
          } else if (brake && you.brake === null) {
            send_turn = true
          }
          document.getElementById('yourscore').textContent 
            = document.getElementById('scoreanimation').textContent 
            = document.getElementById('finalscorenum').textContent 
            = you.score
          if (you.score > self.score) {
            document.getElementById('scoreanimation').style.visilbility = 'visible'
            document.getElementById('scoreanimation').style.animation = 'none'
            document.getElementById('scoreanimation').style.animation = ''
          }
          self.name = you.name
          self.score = you.score
          self.dead = you.dead
          if (you.health < self.health) {
            damageAlpha = 0.8 * (self.health - you.health)
            damageGot = performance.now() + (self.health - you.health) * 700
            bubbles.push({ x: self.posX, y: self.posY, alpha: 100, radius: 0.3 * (1 + self.health - you.health) })
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
          planets = physics.getPlanets(self.posX, self.posY)
        }
        if (projs.length) {
          bullets = [...bullets, ...projs.filter(x => x)]
        }
        updatePowerup()
        physics.setPlanetSeed(seed)
        document.getElementById('playerCountNum').textContent = count
        document.getElementById('healthbarhealth').style.width = `${Math.ceil(self.health * 200)}px`
      } else if (serial.is_board(obj)) {
        leaderboard = obj.board
        drawLeaderboard()
      } else if (serial.is_orient(obj)) {
        self.orient = obj.orient
      } else if (serial.is_unauth(obj)) {
        disconnect()
      } else if (serial.is_killed(obj)) {
        explosion(self)
        hideLose()
        leaveGame()
        document.getElementById('defeat').style.display = 'inline'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = obj.ship
      } else if (serial.is_crashed(obj)) {
        explosion(self)
        hideLose()
        leaveGame()
        document.getElementById('defeatcrash').style.display = 'inline'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = obj.ship
      } else if (serial.is_hitpl(obj)) {
        explosion(self)
        hideLose()
        leaveGame()
        document.getElementById('defeatplanet').style.display = 'inline'
      } else if (serial.is_killship(obj)) {
        const matching = ships.find(ship => ship._id === obj.ship)
        if (matching !== null) {
          explosion(matching)
        }
        ships = ships.filter(ship => ship._id !== obj.ship)
      } else if (serial.is_killproj(obj)) {
        bullets = bullets.filter(bullet => bullet._id !== obj.proj)
      } else if (serial.is_minexpl(obj)) {
        bubbles.push({ x: obj.mine.posX, y: obj.mine.posY, alpha: 100, radius: 1 })
      } else if (serial.is_addpup(obj)) {
        powerups.push(obj.powerup)
        // document.getElementById('powerupanimation').style.visibility = 'visible'
        document.getElementById('powerupanimation').style.animation = 'none'
        document.getElementById('powerupanimation').style.animation = ''
      } else if (serial.is_delpup(obj)) {
        powerups = powerups.filter(powerup => powerup._id !== obj.powerup._id)
      }
    })
    
    ws.addEventListener('open', () => {
      dead = false
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
      document.getElementById('onlinestatus').textContent = 'waiting for spawn'
      serial.send(ws, serial.e_join(nick, perk))
      checkSize()
      pinger = setInterval(() => {
        if (++no_data > 8 || ws == null) {
          disconnect()
          return
        }
        serial.send(ws, serial.e_ping(performance.now()))
      }, 500)
    })
    
    ws.addEventListener('close', () => {
      if (!dead) {
        disconnect()
      }
      dead = true
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
  if (mouse_locked) {
    document.exitPointerLock()
  }
  token = null
  dead = self.dead = true
  ws = null
  inGame = accel = brake = turn_left = turn_right = firing = false
  damageGot = damageAlpha = 0
  powerups = []
  document.getElementById('onlinestatus').textContent = 'offline'
  showDialog()
  checkSize()
}

const makeTd = (text) => {
  const td = document.createElement('td')
  td.textContent = text
  return td
}

const makeTableRow = (lb) => {
  const tr = document.createElement('tr')
  tr.appendChild(makeTd(lb[0]))
  tr.appendChild(makeTd(lb[1]))
  return tr
}

const drawLeaderboard = () => {
  const leaderBoardTable = document.getElementById('leaderboard')
  const newBody = document.createElement('tbody')
  
  for (let i = 0; i < Math.min(10, leaderboard.length); ++i) {
    newBody.appendChild(makeTableRow(leaderboard[i]))
  }

  leaderBoardTable.replaceChild(newBody, leaderBoardTable.childNodes[0])
}

const serverTick = () => {
  if (!ws || !self) {
    self.velX *= 0.95
    self.velY *= 0.95
    return
  }

  if (!token) {
    return
  }

  if (send_turn) {
    serial.send(ws, serial.e_ctrl(token, self.orient, accel, brake, firing))
    send_turn = false
  }
  
  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart)
  }
  if (brake) {
    physics.brake(self)
  }
  if (firing && (chron.timeMs() - self.lastFired) >= firingInterval) {
    physics.recoil(self)
  }
  physics.inertia(self)
  if (!self.latched) {
    physics.rubberband(self, rubber)
    planets = physics.getPlanets(self.posX, self.posY)
    physics.gravityShip(self, planets)
  }

  for (const ship of ships) {
    physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
  }

  for (const bullet of bullets) {
    physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))
  }
}
setInterval(serverTick, TICK_MS)

const partialTick = (delta) => {
  tpf = 1.0 * delta / TICK_MS

  if (!self.latched) {
    // turning
    if (turn_left && !turn_right) {
      self.orient -= turn_left_ramp * TURN_UNIT * tpf
      turn_left_ramp = Math.min(1, turn_left_ramp + tpf * 0.1)
      if (self.highAgility) {
        accelStart = chron.timeMs() / 16 + accelStart * 15 / 16
      } else {
        accelStart = chron.timeMs()
      }
      send_turn = true
    } else if (turn_right && !turn_left) {
      self.orient += turn_right_ramp * TURN_UNIT * tpf
      turn_right_ramp = Math.min(1, turn_right_ramp + tpf * 0.1)
      if (self.highAgility) {
        accelStart = chron.timeMs() / 16 + accelStart * 15 / 16
      } else {
        accelStart = chron.timeMs()
      }
      send_turn = true
    }
  }
  
  // interpolate
  self.posX += tpf * self.velX
  self.posY += tpf * self.velY

  for (const ship of ships) {
    ship.posX += tpf * ship.velX
    ship.posY += tpf * ship.velY
  }
  for (const bullet of bullets) {
    if (bullet.type == 'bullet' || bullet.type == 'laser') {
      bullet.posX += tpf * bullet.velX
      bullet.posY += tpf * bullet.velY
      bullet.dist += tpf * bullet.velocity
    } else if (bullet.type == 'mine') {
      bullet.dist += tpf / (physics.TICKS_PER_SECOND * 60)
    }
  }
  bullets = bullets.filter(b => b.dist <= physics.MAX_BULLET_DISTANCE)
}

const jouter = document.getElementById('joystickouter')
const jbase = document.getElementById('joystickbase')
const jstick = document.getElementById('joystick')

const applyPosition = () => {
  if (dead || self === null) {
    return
  }

  const hjbw = jbase.offsetWidth / 2
  const hjbh = jbase.offsetHeight / 2
  let x = (jstick.offsetLeft + (jstick.offsetWidth / 2) - (jbase.offsetLeft + hjbw)) / hjbw * Math.sqrt(2)
  let y = (jstick.offsetTop + (jstick.offsetHeight / 2) - (jbase.offsetTop + hjbh)) / hjbh * Math.sqrt(2)
  if (x > 1) x = 1
  if (x < -1) x = -1
  if (y > 1) y = 1
  if (y < -1) y = -1

  const h = Math.hypot(x, y)
  
  const willAccel = h > 0.8
  let shouldUpdateAccelStart = willAccel != accel

  if (!self.latched && h > 0.01) {
    const angle = Math.atan2(x, -y)
    shouldUpdateAccelStart |= self.orient != angle
    self.orient = angle 
  }

  accel = willAccel
  if (shouldUpdateAccelStart) {
    accelStart = chron.timeMs()
    send_turn = true
  }
}

const resetJoystickCenter = () => {
  jstick.style.top = jbase.offsetTop + (jbase.offsetHeight / 2) - (jstick.offsetHeight / 2) + 'px'
  jstick.style.left = jbase.offsetLeft + (jbase.offsetWidth / 2) - (jstick.offsetWidth / 2) + 'px'
  applyPosition()
}

const useItem = () => {
  if (self.item !== null) {
    serial.send(ws, serial.e_useitem(token))
    self.item = null
  }
}

const tryLockMouse = (e) => {
  if (isMobile()) {
    return
  }
  cursorX = e.clientX
  cursorY = e.clientY
  canvas.requestPointerLock()
}

const handleMouseDown = (e) =>{
  if (!mouse_locked && !document.hidden && !dead) {
    tryLockMouse(e)
  }
  handleMouseMove(e)
}

const handleMouseUp = (e) => {
  handleMouseMove(e)
}

const handleMouseMove = (e) => {
  const leftButton = (e.buttons & 1) !== 0
  const rightButton = (e.buttons & 2) !== 0

  if (leftButton && !firing) {
    firing = true
    send_turn = true
  } else if (!leftButton && firing) {
    firing = false
    send_turn = true
  }

  if (rightButton) {
    useItem()
  }

  if (mouse_locked) {
    cursorX += e.movementX
    cursorY += e.movementY
    const cx = document.body.clientWidth / 2
    const cy = document.body.clientHeight / 2
    const radius = Math.hypot(cursorX - cx, cursorY - cy)
    if (!self.latched && radius > 2) {
      self.orient = Math.atan2(cursorX - cx, cy - cursorY)
      send_turn = true
    }
  }
}

document.addEventListener('pointerlockchange', () => {
  mouse_locked = document.pointerLockElement === canvas
})

canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType == 'mouse') {
    handleMouseDown(e)
  }
})

canvas.addEventListener('mousedown', (e) => {
  handleMouseDown(e)
})

canvas.addEventListener('pointerup', (e) => {
  if (e.pointerType == 'mouse') {
    handleMouseUp(e)
  }
})

canvas.addEventListener('mouseup', (e) => {
  handleMouseUp(e)
})

canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType == 'mouse') {
    handleMouseMove(e)
  }
})

canvas.addEventListener('mousemove', (e) => {
  handleMouseMove(e)
})

jbase.addEventListener('pointerdown', (e) => {
  jstick.style.left = e.clientX - (jstick.offsetWidth / 2) + 'px'
  jstick.style.top = e.clientY - (jstick.offsetHeight / 2) + 'px'
  applyPosition()
})

jbase.addEventListener('pointermove', (e) => {
  if (e.pressure > 0 || e.buttons & 1) {
    jstick.style.left = e.clientX - (jstick.offsetWidth / 2) + 'px'
    jstick.style.top = e.clientY - (jstick.offsetHeight / 2) + 'px'
    applyPosition()
  }
})

jbase.addEventListener('pointerout', (e) => {
  e.stopPropagation()
  e.stopImmediatePropagation()
})

jstick.addEventListener('pointerout', (e) => {
  e.stopPropagation()
  e.stopImmediatePropagation()
})

jouter.addEventListener('pointerout', () => {
  resetJoystickCenter()
})

jouter.addEventListener('pointerup', () => {
  resetJoystickCenter()
})

document.getElementById('btnfire').addEventListener('pointerdown', () => {
  firing = true
  send_turn = true
})
document.getElementById('btnfire').addEventListener('pointerover', (e) => {
  if (e.pressure > 0) {
    firing = true
    send_turn = true
  }
})

document.getElementById('btnfire').addEventListener('pointerout', () => {
  firing = false
  send_turn = true
})
document.getElementById('btnfire').addEventListener('pointerup', () => {
  firing = false
  send_turn = true
})

document.getElementById('btnbrake').addEventListener('pointerdown', () => {
  brake = true
  send_turn = true
})
document.getElementById('btnbrake').addEventListener('pointerover', (e) => {
  if (e.pressure > 0) {
    brake = true
    send_turn = true
  }
})

document.getElementById('btnbrake').addEventListener('pointerout', () => {
  brake = false
  send_turn = true
})
document.getElementById('btnbrake').addEventListener('pointerup', () => {
  brake = false
  send_turn = true
})

document.getElementById('btnconsume').addEventListener('pointerdown', () => {
  useItem()
})
document.getElementById('btnconsume').addEventListener('pointerover', (e) => {
  if (e.pressure > 0) {
    useItem()
  }
})

window.addEventListener('keydown', (e) => {
  if (!token || dead) {
    return
  }

  if (e.code == 'KeyW') {
    accel = true
    self.accel = accelStart = chron.timeMs()
    send_turn = true
  } else if (e.code == 'KeyS') {
    brake = true
    send_turn = true
  } else if (e.code == 'KeyA') {
    turn_left = true
  } else if (e.code == 'KeyD') {
    turn_right = true
  } else if (e.code == 'KeyQ') {
    useItem()
  } else if (e.code == 'Space') {
    firing = true
    send_turn = true
  }
}, true)

window.addEventListener('keyup', (e) => {
  if (!token || dead) {
    return
  }

  if (e.code == 'KeyW') {
    accel = false
    self.accel = null
    send_turn = true
  } else if (e.code == 'KeyS') {
    brake = false
    send_turn = true
  } else if (e.code == 'KeyA') {
    turn_left_ramp = 0
    turn_left = false
  } else if (e.code == 'KeyD') {
    turn_right_ramp = 0
    turn_right = false
  } else if (e.code == 'KeyZ') {
    nextZoom(e.shiftKey ? -1 : 1)
  } else if (e.code == 'Space') {
    firing = false
    send_turn = true
  }
}, true)

window.addEventListener('blur', () => {
  if (!token || dead) {
    return
  }

  accel = false
  self.accel = null
  brake = false
  turn_left = false
  turn_right = false
  firing = false
  send_turn = true
}, true)

window.addEventListener('beforeupload', () => {
  serial.send(ws, serial.e_quit(token))
}, true)

const drawShip = (ship, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const [p1, p2, p3, p4] = geom.getShipPoints(ship)
  let [x1, y1] = p1
  let [x2, y2] = p2
  let [x3, y3] = p3
  let [x4, y4] = p4
  let [x0, y0] = [0, 0]

  x0 = cx + (self.posX - ship.posX) * scale
  x1 = cx + (self.posX - ship.posX + x1) * scale
  x2 = cx + (self.posX - ship.posX + x2) * scale
  x3 = cx + (self.posX - ship.posX + x3) * scale
  x4 = cx + (self.posX - ship.posX + x4) * scale

  y0 = cy + (self.posY - ship.posY) * scale
  y1 = cy + (self.posY - ship.posY + y1) * scale
  y2 = cy + (self.posY - ship.posY + y2) * scale
  y3 = cy + (self.posY - ship.posY + y3) * scale
  y4 = cy + (self.posY - ship.posY + y4) * scale

  ctx.strokeStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.lineTo(x4, y4)
  ctx.lineTo(x1, y1)
  ctx.stroke()

  if (ship.accel) {
    const [tp1, tp2, tp3, tp4, tp5] = geom.getThrusterPoints(ship)
    let [x1, y1] = tp1
    let [x2, y2] = tp2
    let [x3, y3] = tp3
    let [x4, y4] = tp4
    let [x5, y5] = tp5

    let xo = (Math.random() - 0.5) * scale / 4
    let yo = (Math.random() - 0.5) * scale / 4

    x1 = cx + (self.posX - ship.posX + x1) * scale
    x2 = cx + (self.posX - ship.posX + x2) * scale
    x3 = cx + (self.posX - ship.posX + x3) * scale
    x4 = cx + (self.posX - ship.posX + x4) * scale
    x5 = cx + (self.posX - ship.posX + x5) * scale
  
    y1 = cy + (self.posY - ship.posY + y1) * scale
    y2 = cy + (self.posY - ship.posY + y2) * scale
    y3 = cy + (self.posY - ship.posY + y3) * scale
    y4 = cy + (self.posY - ship.posY + y4) * scale
    y5 = cy + (self.posY - ship.posY + y5) * scale

    x3 += xo
    y3 += yo
    x5 += xo / 2
    y5 += yo / 2  

    ctx.strokeStyle = '#888'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x5, y5)
    ctx.stroke()
  }

  ctx.font = `${18 * window.devicePixelRatio}px monospace`
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.textAlign = 'center'
  ctx.fillText(ship.name, x0, y0 - 2.75 * scale)
}

const drawBullet = (bullet, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const x = cx + (self.posX - bullet.posX) * scale
  const y = cy + (self.posY - bullet.posY) * scale

  ctx.lineWidth = 1 * window.devicePixelRatio
  if (bullet.type === 'bullet') {
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 0.2 * scale, 0, 2 * Math.PI)
    ctx.fill()
  } else if (bullet.type === 'laser') {
    ctx.strokeStyle = '#fff'
    const x1 = cx + (self.posX - (bullet.posX + bullet.velX)) * scale
    const y1 = cy + (self.posY - (bullet.posY + bullet.velY)) * scale
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  } else if (bullet.type === 'mine') {
    ctx.strokeStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 0.8 * scale, 0, 2 * Math.PI)
    for (let i = 0; i < 8; ++i) {
      const xo = scale * 0.8 * MINE_X[i]
      const yo = scale * 0.8 * MINE_Y[i]
      ctx.moveTo(x + 0.75 * xo, y + 0.75 * yo)
      ctx.lineTo(x + 1.5 * xo, y + 1.5 * yo)
    }
    ctx.stroke()
  }
}

const drawLine = (line, scale) => {
  const { x, y, angle, r, alpha } = line
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const x1 = cx + scale * (x + self.posX - line.xr - r * Math.cos(angle))
  const y1 = cy + scale * (y + self.posY - line.yr - r * Math.sin(angle))
  const x2 = cx + scale * (x + self.posX - line.xr + r * Math.cos(angle))
  const y2 = cy + scale * (y + self.posY - line.yr + r * Math.sin(angle))

  ctx.strokeStyle = `rgba(192,192,192,${alpha * 0.01})` 
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

const drawPowerup = (powerup, scale, color) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const { posX, posY } = powerup

  const sx = cx + (self.posX - posX) * scale
  const sy = cy + (self.posY - posY) * scale

  if (sx < -20 || sy < -20 
    || sx > ctx.canvas.width + 20 || sy > ctx.canvas.height + 20) {
    return
  }

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(sx, sy, scale, 0, 2 * Math.PI)
  ctx.fill()
}

const drawSmoke = (smoke, scale) => {
  const { x, y, radius, alpha } = smoke
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const sx = cx + (self.posX - x) * scale
  const sy = cy + (self.posY - y) * scale

  ctx.fillStyle = `rgba(92,92,92,${alpha * 0.01})` 
  ctx.beginPath()
  ctx.arc(sx, sy, radius * scale, 0, 2 * Math.PI)
  ctx.fill()
}

const drawBubble = (bubble, scale) => {
  const { x, y, radius, alpha } = bubble
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const sx = cx + (self.posX - x) * scale
  const sy = cy + (self.posY - y) * scale

  ctx.strokeStyle = `rgba(128,128,128,${alpha * 0.01})` 
  ctx.beginPath()
  ctx.arc(sx, sy, radius * scale, 0, 2 * Math.PI)
  ctx.stroke()
}

const createLine = (x1, y1, x2, y2, xr, yr, xv, yv) => {
  const [x, y] = [(x1 + x2) / 2, (y1 + y2) / 2]
  const angle = Math.atan2(x2 - x1, y2 - y1)
  const r = Math.hypot(x2 - x1, y2 - y1) / 2
  const vx = -0.05 + 0.1 * Math.random() - xv * tpf
  const vy = -0.05 + 0.1 * Math.random() - yv * tpf
  const vangle = -0.1 + 0.2 * Math.random()

  // x, y, xr, yr, angle, r, alpha, vx, vy, vangle
  return { x, y, xr, yr, angle, alpha: 100, r, vx, vy, vangle }
}

const computePlanetAngle = (planet, angle, scale, cx, cy) => {
  const x = planet.x + Math.sin(angle) * planet.radius
  const y = planet.y + Math.cos(angle) * planet.radius

  return [cx + (self.posX - x) * scale, cy + (self.posY - y) * scale]
}

const drawPlanet = (planet, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1 * window.devicePixelRatio

  lcg.reseed(planet.seed)
  const gon = Math.abs(lcg.randomInt()) % 19 + 12

  let angle = lcg.randomOffset() * Math.PI * 2 + planetAngle * 
    (2 * (lcg.randomInt() & 1) - 1)
  let [x, y] = computePlanetAngle(planet, angle, scale, cx, cy)

  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let i = 0; i < gon; ++i) {
    angle += (2 * Math.PI) / gon;
    [x, y] = computePlanetAngle(planet, angle, scale, cx, cy)
    ctx.lineTo(x, y)
  }
  ctx.stroke()
}

const explosion = (ship) => {
  if (!ship) {
    return
  }

  const [p1, p2, p3, p4] = geom.getShipPoints(ship)
  let [x1, y1] = p1
  let [x2, y2] = p2
  let [x3, y3] = p3
  let [x4, y4] = p4

  let [x5, y5] = [(x1 + x2) / 2, (y1 + y2) / 2]
  let [x6, y6] = [(x1 + x4) / 2, (y1 + y4) / 2]

  lines.push(createLine(x1, y1, x5, y5, 
    ship.posX, ship.posY, ship.velX, ship.velY))
  lines.push(createLine(x5, y5, x2, y2, 
    ship.posX, ship.posY, ship.velX, ship.velY))
  lines.push(createLine(x2, y2, x3, y3, 
    ship.posX, ship.posY, ship.velX, ship.velY))
  lines.push(createLine(x3, y3, x4, y4, 
    ship.posX, ship.posY, ship.velX, ship.velY))
  lines.push(createLine(x4, y4, x6, y6, 
    ship.posX, ship.posY, ship.velX, ship.velY))
  lines.push(createLine(x6, y6, x1, y1, 
    ship.posX, ship.posY, ship.velX, ship.velY))
}

const frame = (time) => {
  ctx.canvas.width = window.innerWidth * window.devicePixelRatio
  ctx.canvas.height = window.innerHeight * window.devicePixelRatio
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) 
    / physics.VIEW_DISTANCE * (zoom / 2)

  let delta = 0
  if (last_partial != null) {
    delta = time - last_partial
    partialTick(delta)
    if (dialogOpacity < 1) {
      dialogOpacity = Math.min(1, dialogOpacity + delta / 250)
      document.getElementById('dialogbox').style.opacity = dialogOpacity
    }
  }
  last_partial = time

  const xm = ((self.posX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE
  const ym = ((self.posY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // draw grid
  ctx.lineWidth = 1 * window.devicePixelRatio
  ctx.strokeStyle = '#333'
  for (let x = xm * unitSize; 
    x < ctx.canvas.width; 
    x += GRID_SIZE * unitSize) {
    ctx.beginPath()
    const dx = x | 0 + 0.5
    ctx.moveTo(dx, 0)
    ctx.lineTo(dx, ctx.canvas.height)
    ctx.stroke()
  }
  for (let y = ym * unitSize; 
    y < ctx.canvas.height;
    y += GRID_SIZE * unitSize) {
    ctx.beginPath()
    const dy = y | 0 + 0.5
    ctx.moveTo(0, dy)
    ctx.lineTo(ctx.canvas.width, dy)
    ctx.stroke()
  }
  
  if (!self.dead) {
    // draw red mask
    if (rubber > 1) {
      const gradient = ctx.createRadialGradient(cx + self.posX * unitSize,
        cy + self.posY * unitSize,
        (rubber - 1) * unitSize,
        cx + self.posX * unitSize,
        cy + self.posY * unitSize,
        (rubber + physics.RUBBERBAND_BUFFER - 1) * unitSize)
      gradient.addColorStop(0, 'rgba(192,192,192,0)')
      gradient.addColorStop(1, 'rgba(192,192,192,0.25)')
      ctx.beginPath()
      ctx.arc(cx + self.posX * unitSize, cy + self.posY * unitSize, 
        rubber * unitSize, 0, 2 * Math.PI)
      ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // draw player ship
    ctx.lineWidth = 1.5 * window.devicePixelRatio
    drawShip(self, unitSize)
    if (self.health < 0.75) {
      const interval = 320 ** (self.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(self.velX, self.velY) / 6)
      if (!lastSmoke.hasOwnProperty(self._id) || time - lastSmoke[self._id] > interval) {
        smokes.push({ 
          x: self.posX + 1.5 * Math.random() - 0.75, 
          y: self.posY + 1.5 * Math.random() - 0.75, 
          radius: 0.15 + (0.75 - self.health) + Math.random() * 0.3, 
          alpha: 100 * Math.min(1, 1.4 - self.health) })
        lastSmoke[self._id] = time
      }
    }

    // draw ships
    ctx.lineWidth = 1 * window.devicePixelRatio
    for (const ship of ships) {
      drawShip(ship, unitSize)
      if (ship.health < 0.75) {
        const interval = 320 ** (ship.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(ship.velX, ship.velY) / 6)
        if (!lastSmoke.hasOwnProperty(ship._id) || time - lastSmoke[ship._id] > interval) {
          smokes.push({ 
            x: ship.posX + 1.5 * Math.random() - 0.75, 
            y: ship.posY + 1.5 * Math.random() - 0.75, 
            radius: 0.15 + (0.75 - ship.health) + Math.random() * 0.3, 
            alpha: 100 * Math.min(1, 1.4 - ship.health) })
          lastSmoke[ship._id] = time
        }
      }
    }

    // draw bullets
    for (const bullet of bullets) {
      drawBullet(bullet, unitSize)
    }
  }

  // draw planets
  for (const planet of planets) {
    drawPlanet(planet, unitSize)
  }

  const ctr = 0 | ((time % 300) / 15)
  const alp = (time / 1000) % 1.0
  const powerupColor = `rgba(${224+ctr},255,${192+ctr*2},${Math.max(alp, 1 - alp)})`
  // draw powerups
  for (const powerup of powerups) {
    drawPowerup(powerup, unitSize, powerupColor)
  }
  
  // draw lines
  for (const line of lines) {
    drawLine(line, unitSize)

    line.x += line.vx
    line.y += line.vy
    line.angle += line.vangle
    line.vx *= 0.99
    line.vy *= 0.99
    line.vangle *= 0.99
    line.alpha -= 1
  }
  lines = lines.filter(line => line.alpha > 0)

  // draw smokes
  for (const smoke of smokes) {
    drawSmoke(smoke, unitSize)

    smoke.radius += 0.015
    smoke.alpha -= 1
  }
  smokes = smokes.filter(smoke => smoke.alpha > 0)

  for (const shipid of Object.keys(lastSmoke)) {
    if (time - lastSmoke[shipid] >= 5000) {
      delete lastSmoke[shipid]
    }
  }

  // draw bubbles
  for (const bubble of bubbles) {
    drawBubble(bubble, unitSize)

    bubble.radius += 0.05
    bubble.alpha -= 1
  }
  bubbles = bubbles.filter(bubble => bubble.alpha > 0)

  if (!self.dead) {
    // draw black mask
    const bgradient = ctx.createRadialGradient(cx, cy,
      (physics.VIEW_DISTANCE - 1) * unitSize,
      cx, cy,
      (physics.VIEW_DISTANCE + 10) * unitSize)
    bgradient.addColorStop(0, 'rgba(0,0,0,0)')
    bgradient.addColorStop(0.5, 'rgba(0,0,0,0.2)')
    bgradient.addColorStop(1, 'rgba(0,0,0,0.9)')
    ctx.beginPath()
    ctx.arc(cx, cy, 
      (physics.VIEW_DISTANCE - 1) * unitSize, 0, 2 * Math.PI)
    ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = bgradient
    ctx.fill()

    if (damageAlpha > 0) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(128,0,0,${damageAlpha})`
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fill()
      if (time > damageGot && damageAlpha > 0) {
        damageAlpha = Math.max(0, damageAlpha - delta / 800)
      }
    }
  }

  if (self.health < 0.3) {
    document.getElementById('yourscore').style.color = (time % 1000) >= 500 ? '#f88' : '#fff'
    document.getElementById('healthbarhealth').style.background = ((time + 100) % 800) >= 400 ? '#800' : '#c00'
  } else if (self.health < 0.7) {
    document.getElementById('yourscore').style.color = '#fff'
    const t = (self.health - 0.3) / 0.4 * 204
    document.getElementById('healthbarhealth').style.background = `rgba(204,${t},${t})`
  } else {
    document.getElementById('yourscore').style.color = '#fff'
    document.getElementById('healthbarhealth').style.background = '#ccc'
  }
  
  if (mouse_locked) {
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 * window.devicePixelRatio
    ctx.moveTo(cursorX - 8.5, cursorY + 0.5)
    ctx.lineTo(cursorX + 9.5, cursorY + 0.5)
    ctx.moveTo(cursorX + 0.5, cursorY - 8.5)
    ctx.lineTo(cursorX + 0.5, cursorY + 9.5)
    ctx.stroke()
  }

  planetAngle += PLANET_SPIN_SPEED
  planetAngle %= 2 * Math.PI
  
  window.requestAnimationFrame(frame)
}

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
    zoom = ZOOM_LEVELS[(cookieZoom + 1) % ZOOM_LEVELS.length]
    nextZoom(-1)
  }
}

document.getElementById('btnplay').addEventListener('click', (e) => {
  tryLockMouse(e)
  joinGame()
})
document.getElementById('btnfs').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
})
document.getElementById('btnzoom').addEventListener('click', () => nextZoom(1))

window.requestAnimationFrame(frame)

leaveGame()
tryReadCookies()
showDialog()
hideLose()
resetJoystickCenter()
