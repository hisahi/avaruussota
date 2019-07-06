const physics = require('../src/physics')
const geom = require('../src/utils/geom')
const chron = require('../src/utils/chron')
const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')
const here = document.location
const tps = physics.TICKS_PER_SECOND
const GRID_SIZE = 10
const TURN_UNIT = 2 * Math.PI / tps
const TICK_MS = 1000 / tps

let inGame = false
let ws = null
let token = null
let self = null
let firing = false
let accel = false
let accelStart = 0
let brake = false
let turn_left = false
let turn_right = false
let dead = false
let ships = []
let bullets = []
let turn_left_ramp = 0
let turn_right_ramp = 0
let lines = []
let tpf = 1

let last_partial = null
let send_turn = false

const showDialog = () => {
  document.getElementById('dialog').style.display = 'block'
}

const hideDialog = () => {
  document.getElementById('dialog').style.display = 'none'
}

const hideLose = () => {
  document.getElementById('defeat').style.display = 'none'
  document.getElementById('defeatcrash').style.display = 'none'
  document.getElementById('defeatplanet').style.display = 'none'
  document.getElementById('defeatname').style.display = 'none'
}
hideLose()

const joinGame = () => {
  if (!inGame) {
    hideDialog()
    ws = new WebSocket(`ws://${here.hostname}:${here.port}${here.pathname}`)
    inGame = true
    
    ws.addEventListener('open', () => {
      dead = false
    })

    ws.addEventListener('message', (e) => {
      const msg = e.data

      let [cmd, ...args] = msg.split(' ')
      args = args.join(' ')

      if (cmd === 'your_token') {
        if (token == null) {
          window.requestAnimationFrame(frame)
        }
        token = args
      } else if (cmd === 'you') {
        const obj = JSON.parse(args)
        if (self === null) {
          self = obj
        } else {
          if (Math.abs(obj.posX - self.posX) > 0.3) {
            self.posX = (self.posX + obj.posX) / 2
            self.velX = (self.velX + obj.velX) / 2
          }
          if (Math.abs(obj.posY - self.posY) > 0.3) {
            self.posY = (self.posY + obj.posY) / 2
            self.velY = (self.velY + obj.velY) / 2
          }
          if (Math.abs(obj.velX - self.velX) > 0.2) {
            self.velX = obj.velX
          }
          if (Math.abs(obj.velY - self.velY) > 0.2) {
            self.posY = obj.posY
          }
          if (!accel && obj.accel !== null) {
            send_turn = true
          } else if (accel && obj.accel === null) {
            send_turn = true
          } else if (!brake && obj.brake !== null) {
            send_turn = true
          } else if (brake && obj.brake === null) {
            send_turn = true
          }
        }
      } else if (cmd === 'unrecognized') {
        leaveGame()
      } else if (cmd === 'nearby') {
        [ships, bullets] = JSON.parse(args)
      } else if (cmd === 'defeated') {
        hideLose()
        leaveGame()
        document.getElementById('defeat').style.display = 'block'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = args
      } else if (cmd === 'defeated_collision') {
        hideLose()
        leaveGame()
        document.getElementById('defeatcrash').style.display = 'block'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = args
      } else if (cmd === 'defeated_planet') {
        hideLose()
        leaveGame()
        document.getElementById('defeatplanet').style.display = 'block'
      } else if (cmd === 'kill_ship') {
        const matching = ships.find(ship => ship._id === args)
        if (matching !== null) {
          explosion(matching)
        }
        ships = ships.filter(ship => ship._id !== args)
      } else if (cmd === 'remove_ship') {
        ships = ships.filter(ship => ship._id !== args)
      } else if (cmd === 'remove_bullet') {
        bullets = bullets.filter(bullet => bullet._id !== args)
      }
    })
  }
}

const leaveGame = () => {
  if (ws !== null) {
    ws.close()
  }
  dead = true
  self = null
  ws = null
  token = null
  inGame = false
  showDialog()
}

const send = (msg) => {
  if (token) {
    ws.send(`${token} ${msg}`)
  }
}

const serverTick = () => {
  if (!ws || !self) {
    return
  }

  if (send_turn) {
    send(`control ${JSON.stringify([self.orient, accel, brake])}`)
    send_turn = false
  }
  
  if (firing) {
    send('fire')
  }
  
  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart)
  }
  if (brake) {
    physics.brake(self)
  }
  physics.inertia(self)
}
setInterval(serverTick, TICK_MS)

const partialTick = (delta) => {
  tpf = 1.0 * delta / TICK_MS

  // turning
  if (turn_left && !turn_right) {
    self.orient -= turn_left_ramp * TURN_UNIT * tpf
    turn_left_ramp = Math.min(1, turn_left_ramp + tpf * 0.1)
    accelStart = chron.timeMs()
    send_turn = true
  } else if (turn_right && !turn_left) {
    self.orient += turn_right_ramp * TURN_UNIT * tpf
    turn_right_ramp = Math.min(1, turn_right_ramp + tpf * 0.1)
    accelStart = chron.timeMs()
    send_turn = true
  }
  
  // interpolate
  self.posX += tpf * self.velX
  self.posY += tpf * self.velY

  for (const ship of ships) {
    ship.posX += tpf * ship.velX
    ship.posY += tpf * ship.velY
  }
  for (const bullet of bullets) {
    bullet.posX += tpf * bullet.velX
    bullet.posY += tpf * bullet.velY
  }
}

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
  } else if (e.code == 'Space') {
    firing = true
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
  } else if (e.code == 'Space') {
    firing = false
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
  send('disconnect')
}, true)

const drawShip = (ship, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const [p1, p2, p3, p4] = geom.getShipPoints(ship)
  let [x1, y1] = p1
  let [x2, y2] = p2
  let [x3, y3] = p3
  let [x4, y4] = p4

  x1 = cx + (self.posX - ship.posX + x1) * scale
  x2 = cx + (self.posX - ship.posX + x2) * scale
  x3 = cx + (self.posX - ship.posX + x3) * scale
  x4 = cx + (self.posX - ship.posX + x4) * scale

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
}

const drawBullet = (bullet, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const x = cx + (self.posX - bullet.posX) * scale
  const y = cy + (self.posY - bullet.posY) * scale

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x, y, 0.2 * scale, 0, 2 * Math.PI)
  ctx.fill()
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

const explosion = (ship) => {
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
  console.log(lines)
}

const frame = (time) => {
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) * (1 
    / physics.MAX_BULLET_DISTANCE)

  if (!token || !self) {
    return
  }

  if (last_partial != null) {
    const delta = time - last_partial
    partialTick(delta)
  }
  last_partial = time

  const xm = ((self.posX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE
  const ym = ((self.posY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // draw grid
  ctx.lineWidth = 1
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

  // draw player ship
  ctx.lineWidth = 1.5
  drawShip(self, unitSize)

  // draw ships
  ctx.lineWidth = 1
  for (const ship of ships) {
    drawShip(ship, unitSize)
  }

  // draw bullets
  for (const bullet of bullets) {
    drawBullet(bullet, unitSize)
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

  window.requestAnimationFrame(frame)
}

document.getElementById('btnplay').addEventListener('click', () => joinGame())

showDialog()

// message types (server -> client):
//      your_token TOKEN
//      you SHIP
//      unrecognized
//      collision_sound
//      defeated WINNER_NAME
//      defeated_collision WINNER_NAME
//      defeated_planet
//      kill_ship SHIP_ID
//      remove_ship SHIP_ID
//      remove_bullet BULLET_ID
//      nearby [LIST_OF_SHIPS, LIST_OF_BULLETS]
// message types (client -> server), must be preceded with token:
//      disconnect
//      control [DIRECTION, ACCEL, BRAKE]
//      fire
//      special_weapon
