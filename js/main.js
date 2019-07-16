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

let lcg = new LCG(0)
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
let planets = []
let tpf = 1
let planetAngle = 0
let playerCount = 1
let leaderboard = []
let rubber = 150

let last_partial = null
let send_turn = false

const showDialog = () => {
  document.getElementById('dialog').style.display = 'block'
  document.getElementById('stats').style.display = 'none'
}

const hideDialog = () => {
  document.getElementById('dialog').style.display = 'none'
  document.getElementById('stats').style.display = 'block'
}

const hideLose = () => {
  document.getElementById('defeat').style.display = 'none'
  document.getElementById('defeatcrash').style.display = 'none'
  document.getElementById('defeatplanet').style.display = 'none'
  document.getElementById('defeatname').style.display = 'none'
  document.getElementById('disconnected').style.display = 'none'
}
hideLose()

const joinGame = () => {
  if (!inGame) {
    hideDialog()
    let wsproto = here.protocol.replace('http', 'ws')
    ws = new WebSocket(`${wsproto}//${here.hostname}:${here.port}${here.pathname}`)
    inGame = true
    
    ws.addEventListener('open', () => {
      dead = false
    })
    
    ws.addEventListener('close', () => {
      if (!dead) {
        hideLose()
        document.getElementById('disconnected').style.display = 'inline'
        leaveGame()
      }
      dead = true
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
        let nick = document.getElementById('nick').value
        if (nick.length < 1) {
          nick = ((100000000 * Math.random()) | 0).toString()
        }
        send(`nick ${nick}`)
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
          self.name = obj.name
        }
      } else if (cmd === 'players') {
        [playerCount, rubber] = JSON.parse(args)
        document.getElementById('playerCountNum').textContent = playerCount
      } else if (cmd === 'leaderboard') {
        leaderboard = JSON.parse(args)
        drawLeaderboard()
      } else if (cmd === 'set_orient') {
        self.orient = parseFloat(args)
      } else if (cmd === 'unrecognized') {
        leaveGame()
      } else if (cmd === 'nearby') {
        [ships, bullets] = JSON.parse(args)
      } else if (cmd === 'defeated') {
        hideLose()
        leaveGame()
        document.getElementById('defeat').style.display = 'inline'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = args
      } else if (cmd === 'defeated_collision') {
        hideLose()
        leaveGame()
        document.getElementById('defeatcrash').style.display = 'inline'
        document.getElementById('defeatname').style.display = 'inline'
        document.getElementById('defeatname').innerHTML = args
      } else if (cmd === 'defeated_planet') {
        hideLose()
        leaveGame()
        document.getElementById('defeatplanet').style.display = 'inline'
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
  accel = false
  brake = false
  turn_left = false
  turn_right = false
  firing = false
  showDialog()
}

const send = (msg) => {
  if (token) {
    ws.send(`${token} ${msg}`)
  }
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
  physics.rubberband(self, rubber)
  planets = physics.getPlanets(self.posX, self.posY)
  physics.gravityShip(self, planets)

  for (const bullet of bullets) {
    physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))
  }
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

  ctx.font = '18px monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.textAlign = 'center'
  ctx.fillText(ship.name, x0, y0 - 2.75 * scale)
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

const computePlanetAngle = (planet, angle, scale, cx, cy) => {
  const x = planet.x + Math.sin(angle) * planet.radius
  const y = planet.y + Math.cos(angle) * planet.radius

  return [cx + (self.posX - x) * scale, cy + (self.posY - y) * scale]
}

const drawPlanet = (planet, scale) => {
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1

  lcg.reseed(planet.seed)
  const gon = Math.abs(lcg.randomInt()) % 24 + 14

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
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
  const cx = ctx.canvas.width / 2
  const cy = ctx.canvas.height / 2
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

  const gradient = ctx.createRadialGradient(cx + self.posX * unitSize,
    cy + self.posY * unitSize,
    (rubber - 1) * unitSize,
    cx + self.posX * unitSize,
    cy + self.posY * unitSize,
    (rubber + physics.RUBBERBAND_BUFFER - 1) * unitSize)
  gradient.addColorStop(0, 'rgba(255,0,0,0)')
  gradient.addColorStop(1, 'rgba(255,0,0,0.25)')
  // draw mask
  ctx.beginPath()
  ctx.arc(cx + self.posX * unitSize, cy + self.posY * unitSize, 
    rubber * unitSize, 0, 2 * Math.PI)
  ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = gradient
  ctx.fill()

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

  // draw planets
  for (const planet of planets) {
    drawPlanet(planet, unitSize)
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

  planetAngle += PLANET_SPIN_SPEED
  planetAngle %= 2 * Math.PI

  window.requestAnimationFrame(frame)
}

document.getElementById('btnplay').addEventListener('click', () => joinGame())

leaveGame()
showDialog()
