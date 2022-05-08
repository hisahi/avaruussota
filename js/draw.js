const LCG = require('../src/utils/lcg')
const geom = require('../src/utils/geom')
const physics = require('../src/game/physics')

const fogCanvas = document.createElement('canvas')
const fogCtx = fogCanvas.getContext('2d')
const SQRT_H = Math.sqrt(0.5)
const GRID_SIZE = 10
const PLANET_SPIN_SPEED = 0.02
const MINE_X = [0, SQRT_H, 1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H]
const MINE_Y = [1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H, 0, SQRT_H]

module.exports = (canvas, self, objects, state, cursor) => {
  const ctx = canvas.getContext('2d')

  let damageGot = 0
  let lcg = new LCG(0)
  let lines = []
  let smokes = []
  let bubbles = []
  let planetAngle = 0
  let damageAlpha = 0
  let lastSmoke = {}
  let zoom = 1
  let rubber = 150
  let cx = 0
  let cy = 0
  let unitSize = 1

  const reset = () => {
    lines = []
    smokes = []
    damageGot = 0
    damageAlpha = 0
  }

  const gotDamage = (damage) => {
    damageGot = performance.now() + damage * 700
    damageAlpha = 0.8 * damage
  }

  const setZoom = z => zoom = z

  const setRubber = r => rubber = r

  const checkSize = () => {
    ctx.canvas.width = window.innerWidth * window.devicePixelRatio
    ctx.canvas.height = window.innerHeight * window.devicePixelRatio
    cx = ctx.canvas.width / 2
    cy = ctx.canvas.height / 2
    unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) 
      / physics.VIEW_DISTANCE * (zoom / 2)
    
    drawFog()
  }

  const addBubble = bubble => bubbles.push(bubble)

  const drawFog = () => {
    fogCanvas.width = ctx.canvas.width
    fogCanvas.height = ctx.canvas.height

    fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height)
    const bgradient = fogCtx.createRadialGradient(cx, cy,
      (physics.VIEW_DISTANCE - 1) * unitSize,
      cx, cy,
      (physics.VIEW_DISTANCE + 10) * unitSize)

    bgradient.addColorStop(0, 'rgba(0,0,0,0)')
    bgradient.addColorStop(0.5, 'rgba(0,0,0,0.2)')
    bgradient.addColorStop(1, 'rgba(0,0,0,0.9)')
    fogCtx.beginPath()
    fogCtx.arc(cx, cy, 
      (physics.VIEW_DISTANCE - 1) * unitSize, 0, 2 * Math.PI)
    fogCtx.rect(fogCtx.canvas.width, 0, -fogCtx.canvas.width, fogCtx.canvas.height)
    fogCtx.fillStyle = bgradient
    fogCtx.fill()
  }

  const drawShip = (ship) => {
    const [p1, p2, p3, p4] = geom.getShipPoints(ship)
    let [x1, y1] = p1
    let [x2, y2] = p2
    let [x3, y3] = p3
    let [x4, y4] = p4
    let [x0, y0] = [0, 0]

    x0 = cx + (self.posX - ship.posX) * unitSize
    x1 = cx + (self.posX - x1) * unitSize
    x2 = cx + (self.posX - x2) * unitSize
    x3 = cx + (self.posX - x3) * unitSize
    x4 = cx + (self.posX - x4) * unitSize

    y0 = cy + (self.posY - ship.posY) * unitSize
    y1 = cy + (self.posY - y1) * unitSize
    y2 = cy + (self.posY - y2) * unitSize
    y3 = cy + (self.posY - y3) * unitSize
    y4 = cy + (self.posY - y4) * unitSize

    ctx.strokeStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.closePath()
    ctx.stroke()

    if (ship.accel !== null) {
      const [tp1, tp2, tp3, tp4, tp5] = geom.getThrusterPoints(ship)
      let [x1, y1] = tp1
      let [x2, y2] = tp2
      let [x3, y3] = tp3
      let [x4, y4] = tp4
      let [x5, y5] = tp5

      let xo = (Math.random() - 0.5) * unitSize / 2
      let yo = (Math.random() - 0.5) * unitSize / 2

      x1 = cx + (self.posX - x1) * unitSize
      x2 = cx + (self.posX - x2) * unitSize
      x3 = cx + (self.posX - x3) * unitSize
      x4 = cx + (self.posX - x4) * unitSize
      x5 = cx + (self.posX - x5) * unitSize
    
      y1 = cy + (self.posY - y1) * unitSize
      y2 = cy + (self.posY - y2) * unitSize
      y3 = cy + (self.posY - y3) * unitSize
      y4 = cy + (self.posY - y4) * unitSize
      y5 = cy + (self.posY - y5) * unitSize

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
      ctx.closePath()
      ctx.stroke()
    }

    ctx.font = `${18 * window.devicePixelRatio}px monospace`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.textAlign = 'center'
    ctx.fillText(ship.name, x0, y0 - 3.75 * unitSize)
  }

  const drawBullet = (bullet) => {
    const x = cx + (self.posX - bullet.posX) * unitSize
    const y = cy + (self.posY - bullet.posY) * unitSize

    ctx.lineWidth = 1 * window.devicePixelRatio
    if (bullet.type === 'bullet') {
      ctx.moveTo(x, y)
      ctx.arc(x, y, 0.3 * unitSize, 0, 2 * Math.PI)
    } else if (bullet.type === 'laser') {
      const x1 = cx + (self.posX - (bullet.posX + bullet.velX)) * unitSize
      const y1 = cy + (self.posY - (bullet.posY + bullet.velY)) * unitSize
      ctx.moveTo(x, y)
      ctx.lineTo(x1, y1)
    } else if (bullet.type === 'mine') {
      ctx.moveTo(x + 1.6 * unitSize, y)
      ctx.arc(x, y, 1.6 * unitSize, 0, 2 * Math.PI)
      for (let i = 0; i < 8; ++i) {
        const xo = unitSize * 0.8 * MINE_X[i]
        const yo = unitSize * 0.8 * MINE_Y[i]
        ctx.moveTo(x + 2 * xo, y + 2 * yo)
        ctx.lineTo(x + 3 * xo, y + 3 * yo)
      }
      ctx.moveTo(x, y)
    }
  }

  const drawLine = (line) => {
    const { x, y, angle, r, alpha } = line
    const x1 = cx + unitSize * (self.posX - x - r * Math.cos(angle))
    const y1 = cy + unitSize * (self.posY - y - r * Math.sin(angle))
    const x2 = cx + unitSize * (self.posX - x + r * Math.cos(angle))
    const y2 = cy + unitSize * (self.posY - y + r * Math.sin(angle))

    ctx.strokeStyle = `rgba(192,192,192,${alpha * 0.01})` 
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const drawPowerup = (powerup, color) => {
    const { posX, posY } = powerup

    const sx = cx + (self.posX - posX) * unitSize
    const sy = cy + (self.posY - posY) * unitSize

    if (sx < -20 || sy < -20 
      || sx > ctx.canvas.width + 20 || sy > ctx.canvas.height + 20) {
      return
    }

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(sx, sy, unitSize, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawSmoke = (smoke) => {
    const { x, y, radius, alpha } = smoke
    const sx = cx + (self.posX - x) * unitSize
    const sy = cy + (self.posY - y) * unitSize

    ctx.fillStyle = `rgba(92,92,92,${alpha * 0.01})` 
    ctx.beginPath()
    ctx.arc(sx, sy, radius * unitSize, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawBubble = (bubble) => {
    const { x, y, radius, alpha } = bubble
    const sx = cx + (self.posX - x) * unitSize
    const sy = cy + (self.posY - y) * unitSize

    ctx.lineWidth = window.devicePixelRatio * (1 + Math.max(0, alpha - 1))
    ctx.strokeStyle = `rgba(128,128,128,${Math.min(1, alpha) * 0.01})` 
    ctx.beginPath()
    ctx.arc(sx, sy, radius * unitSize, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const computePlanetAngle = (radius, sx, sy, angle) => {
    return [sx + Math.sin(angle) * radius * unitSize,
      sy + Math.cos(angle) * radius * unitSize]
  }

  const drawPlanet = (planet) => {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 * window.devicePixelRatio
    
    const sx = cx + (self.posX - planet.x) * unitSize
    const sy = cy + (self.posY - planet.y) * unitSize

    if (sx < -planet.radius * unitSize 
      || sy < -planet.radius  * unitSize
      || sx > ctx.canvas.width + planet.radius * unitSize 
      || sy > ctx.canvas.height + planet.radius * unitSize) {
      return
    }

    lcg.reseed(planet.seed)
    const gon = Math.abs(lcg.randomInt()) % 19 + 12

    let angle = lcg.randomOffset() * Math.PI * 2 + planetAngle * lcg.randomSign()
    let [x, y] = computePlanetAngle(planet.radius, sx, sy, angle)
    let fac = 2 * Math.PI / gon

    ctx.moveTo(x, y)
    for (let i = 0; i <= gon; ++i) {
      [x, y] = computePlanetAngle(planet.radius, sx, sy, angle + i * fac)
      ctx.lineTo(x, y)
    }
  }

  const createLine = (x1, y1, x2, y2, xv, yv, tpf) => {
    const [x, y] = [(x1 + x2) / 2, (y1 + y2) / 2]
    const angle = Math.atan2(x2 - x1, y2 - y1)
    const r = Math.hypot(x2 - x1, y2 - y1) / 2
    const vx = -0.05 + 0.1 * Math.random() + xv * tpf
    const vy = -0.05 + 0.1 * Math.random() + yv * tpf
    const vangle = -0.1 + 0.2 * Math.random()

    return { x, y, angle, alpha: 100, r, vx, vy, vangle }
  }

  const explosion = (ship, tpf) => {
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

    lines.push(createLine(x1, y1, x5, y5, ship.velX, ship.velY, tpf))
    lines.push(createLine(x5, y5, x2, y2, ship.velX, ship.velY, tpf))
    lines.push(createLine(x2, y2, x3, y3, ship.velX, ship.velY, tpf))
    lines.push(createLine(x3, y3, x4, y4, ship.velX, ship.velY, tpf))
    lines.push(createLine(x4, y4, x6, y6, ship.velX, ship.velY, tpf))
    lines.push(createLine(x6, y6, x1, y1, ship.velX, ship.velY, tpf))
  }

  const frame = (time, delta) => {
    const xm = ((self.posX % GRID_SIZE) + GRID_SIZE) % GRID_SIZE
    const ym = ((self.posY % GRID_SIZE) + GRID_SIZE) % GRID_SIZE

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // draw grid
    ctx.lineWidth = 1 * window.devicePixelRatio
    ctx.strokeStyle = '#333'
    ctx.beginPath()
    for (let x = xm * unitSize; 
      x < ctx.canvas.width; 
      x += GRID_SIZE * unitSize) {
      const dx = x | 0 + 0.5
      ctx.moveTo(dx, 0)
      ctx.lineTo(dx, ctx.canvas.height)
    }
    for (let y = ym * unitSize; 
      y < ctx.canvas.height;
      y += GRID_SIZE * unitSize) {
      const dy = y | 0 + 0.5
      ctx.moveTo(0, dy)
      ctx.lineTo(ctx.canvas.width, dy)
    }
    ctx.stroke()
    
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
      drawShip(self)
      if (self.health < 0.75) {
        const interval = 320 ** (self.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(self.velX, self.velY) / 4)
        if (!Object.prototype.hasOwnProperty.call(lastSmoke, self._id) || time - lastSmoke[self._id] > interval) {
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
      for (const ship of objects.ships) {
        drawShip(ship)
        if (ship.health < 0.75) {
          const interval = 320 ** (ship.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(ship.velX, ship.velY) / 4)
          if (!Object.prototype.hasOwnProperty.call(lastSmoke, ship._id) || time - lastSmoke[ship._id] > interval) {
            smokes.push({ 
              x: ship.posX + 1.5 * Math.random() - 0.75, 
              y: ship.posY + 1.5 * Math.random() - 0.75, 
              radius: 0.15 + (0.75 - ship.health) + Math.random() * 0.3, 
              alpha: 100 * Math.min(1, 1.4 - ship.health) })
            lastSmoke[ship._id] = time
          }
        }
      }

      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#fff'
      ctx.beginPath()
      // draw bullets
      for (const bullet of objects.bullets) {
        drawBullet(bullet)
      }
      ctx.stroke()
    }

    ctx.beginPath()
    // draw planets
    for (const planet of objects.planets) {
      drawPlanet(planet)
    }
    ctx.stroke()

    if (objects.powerups.length) {
      const ctr = 0 | ((time % 300) / 15)
      const alp = (time / 1000) % 1.0
      const powerupColor = `rgba(${224+ctr},255,${192+ctr*2},${Math.max(alp, 1 - alp)})`
      // draw powerups
      for (const powerup of objects.powerups) {
        drawPowerup(powerup, powerupColor)
      }
    }
      
    // draw lines
    for (const line of lines) {
      drawLine(line)

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
      drawSmoke(smoke)

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
      drawBubble(bubble)

      bubble.radius += 0.05
      bubble.alpha -= 1
    }
    bubbles = bubbles.filter(bubble => bubble.alpha > 0)

    if (!self.dead) {
      ctx.drawImage(fogCanvas, 0, 0)

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
    
    if (state.mouseLocked) {
      const cursorX = cursor.getX()
      const cursorY = cursor.getY()
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
  }

  window.addEventListener('resize', () => checkSize())

  return {
    reset,
    gotDamage,
    setZoom,
    setRubber,
    checkSize,
    addBubble,
    drawFog,
    drawShip,
    drawBullet,
    drawLine,
    drawPowerup,
    drawSmoke,
    drawBubble,
    drawPlanet,
    explosion,
    frame
  }
}
