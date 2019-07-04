const physics = require('../src/physics')
const geom = require('../src/utils/geom')
const chron = require('../src/utils/chron')
const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')
const here = document.location
const ws = new WebSocket(`ws://${here.hostname}:${here.port}${here.pathname}`)
const tps = physics.TICKS_PER_SECOND
const GRID_SIZE = 10
const TURN_UNIT = 2 * Math.PI / tps

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

const send = (msg) => {
  if (token) {
    ws.send(`${token} ${msg}`)
  }
}

setInterval(() => {
  let new_angle = self.orient

  if (turn_left && !turn_right) {
    new_angle -= turn_left_ramp * TURN_UNIT
    turn_left_ramp = Math.min(1, turn_left_ramp + 0.1)
    accelStart = chron.timeMs()
  } else if (turn_right && !turn_left) {
    new_angle += turn_right_ramp * TURN_UNIT
    turn_right_ramp = Math.min(1, turn_right_ramp + 0.1)
    accelStart = chron.timeMs()
  }

  if (new_angle != self.orient) {
    self.orient = new_angle
    send(`turn ${new_angle}`)
  }

  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart)
  }
  if (brake) {
    physics.brake(self)
  }
  physics.inertia(self)
  self.posX += self.velX
  self.posY += self.velY
}, 1000 / tps)

window.addEventListener('keydown', (e) => {
  if (!token || dead) {
    return
  }

  if (e.code == 'KeyW') {
    accel = true
    self.accel = accelStart = chron.timeMs()
    send('accel_on')
  } else if (e.code == 'KeyS') {
    brake = true
    send('brake_on')
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
    send('accel_off')
  } else if (e.code == 'KeyS') {
    brake = false
    send('brake_off')
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

window.addEventListener('blur', (e) => {
  if (!token || dead) {
    return
  }

  send('accel_off')
  send('brake_off')
  accel = false
  self.accel = null
  brake = false
  turn_left = false
  turn_right = false
  firing = false
}, true)

const drawShip = (ship, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2

  const [p1, p2, p3, p4] = geom.getShipPoints(ship)
  let [x1, y1] = p1
  let [x2, y2] = p2
  let [x3, y3] = p3
  let [x4, y4] = p4

  x1 = cx + ship.posX - self.posX + x1 * scale
  x2 = cx + ship.posX - self.posX + x2 * scale
  x3 = cx + ship.posX - self.posX + x3 * scale
  x4 = cx + ship.posX - self.posX + x4 * scale

  y1 = cy + ship.posY - self.posY + y1 * scale
  y2 = cy + ship.posY - self.posY + y2 * scale
  y3 = cy + ship.posY - self.posY + y3 * scale
  y4 = cy + ship.posY - self.posY + y4 * scale

  ctx.strokeStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.lineTo(x4, y4)
  ctx.lineTo(x1, y1)
  ctx.stroke()

  if (ship.accel) {
    const [tp1, tp2, tp3, tp4, tp5] = geom.getThrusterPoints(ship);
    let [x1, y1] = tp1
    let [x2, y2] = tp2
    let [x3, y3] = tp3
    let [x4, y4] = tp4
    let [x5, y5] = tp5

    let xo = (Math.random() - 0.5) * scale / 4;
    let yo = (Math.random() - 0.5) * scale / 4;

    x1 = cx + ship.posX - self.posX + x1 * scale
    x2 = cx + ship.posX - self.posX + x2 * scale
    x3 = cx + ship.posX - self.posX + x3 * scale
    x4 = cx + ship.posX - self.posX + x4 * scale
    x5 = cx + ship.posX - self.posX + x5 * scale
  
    y1 = cy + ship.posY - self.posY + y1 * scale
    y2 = cy + ship.posY - self.posY + y2 * scale
    y3 = cy + ship.posY - self.posY + y3 * scale
    y4 = cy + ship.posY - self.posY + y4 * scale
    y5 = cy + ship.posY - self.posY + y5 * scale

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

  let x = bullet.posX
  let y = bullet.posY

  x = cx + bullet.posX - self.posX + x * scale
  y = cy + bullet.posY - self.posY + y * scale

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x, y, 0.2 * scale, 0, 2 * Math.PI)
  ctx.fill()
}

const frame = () => {
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) * (1 
    / physics.MAX_BULLET_DISTANCE)
  
  if (firing) {
    send('fire')
  }

  if (self == null) {
    return
  }

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
    const dx = x | 0 + 0.5;
    ctx.moveTo(dx, 0)
    ctx.lineTo(dx, ctx.canvas.height)
    ctx.stroke()
  }
  for (let y = ym * unitSize; 
    y < ctx.canvas.height;
    y += GRID_SIZE * unitSize) {
    ctx.beginPath()
    const dy = y | 0 + 0.5;
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

  window.requestAnimationFrame(frame)
}

ws.addEventListener('open', () => {
  console.log(`  O wonder!
  How many goodly creatures are there here!
  How beauteous mankind is! O brave new world,
  That has such people in't.`)
  dead = false
})

ws.addEventListener('message', (e) => {
  const msg = e.data

  let [cmd, ...args] = msg.split(' ')
  args = args.join(' ')

  if (cmd === 'your_token') {
    if (token === null) {
      window.requestAnimationFrame(frame)
    }
    token = args
  } else if (cmd === 'you') {
    const obj = JSON.parse(args)
    if (self === null) {
      self = obj
    } else {
      if (Math.abs(obj.posX - self.posX) > 0.3) {
        self.posX = (self.posX + obj.posX) / 2;
        self.velX = (self.velX + obj.velX) / 2;
      }
      if (Math.abs(obj.posY - self.posY) > 0.3) {
        self.posY = (self.posY + obj.posY) / 2;
        self.velY = (self.velY + obj.velY) / 2;
      }
      if (Math.abs(obj.velX - self.velX) > 0.2) {
        self.velX = obj.velX;
      }
      if (Math.abs(obj.velY - self.velY) > 0.2) {
        self.posY = obj.posY;
      }
      if (!accel && obj.accel !== null) {
        ws.send('accel_off');
      } else if (accel && obj.accel === null) {
        ws.send('accel_on');
      } else if (!brake && obj.brake !== null) {
        ws.send('brake_off');
      } else if (brake && obj.brake === null) {
        ws.send('brake_on');
      }
    }
  } else if (cmd === 'unrecognized') {
    token = ''
    self = {}
  } else if (cmd === 'nearby') {
    [ships, bullets] = JSON.parse(args)
  } else if (cmd === 'kill_ship') {
    // display explosion animation????
    if (args == self._id) {
      token = ''
      self = {}
    } else {
      ships = ships.filter(ship => ship._id !== args)
    }
  } else if (cmd === 'remove_ship') {
    if (args == self._id) {
      token = ''
      self = {}
    } else {
      ships = ships.filter(ship => ship._id !== args)
    }
  } else if (cmd === 'remove_bullet') {
    bullets = bullets.filter(bullet => bullet._id !== args)
  }
})

// message types (server -> client):
//      your_token TOKEN
//      you SHIP
//      unrecognized
//      collision_sound
//      kill_ship SHIP_ID
//      remove_ship SHIP_ID
//      remove_bullet BULLET_ID
//      nearby [LIST_OF_SHIPS, LIST_OF_BULLETS]
// message types (client -> server), must be preceded with token:
//      accel_on
//      accel_off
//      brake_on
//      brake_off
//      turn NEW_ORIENTATION
//      fire
//      special_weapon
