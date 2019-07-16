const TICKS_PER_SECOND = 24
const MAX_SHIP_VELOCITY = 32 / TICKS_PER_SECOND
const MIN_SHIP_VELOCITY = 0.01
const LATCH_VELOCITY = 0.15
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 2
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 2.5))
const INERTIA_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))
const MAX_BULLET_DISTANCE = 56
const DELAY_BETWEEN_BULLETS_MS = 250
const RUBBERBAND_BUFFER = 80
const PLANET_SEED = 1340985549
const LCG = require('./utils/lcg')
const PLANET_CHUNK_SIZE = MAX_BULLET_DISTANCE * 2 + 1

const getAccelMul = (accelTimeMs) => { // time in milliseconds
  return 0.05 + 0.000025 * accelTimeMs
}

const checkMinVelocity = (ship) => {
  const v = Math.hypot(ship.velX, ship.velY)
  if (v <= MIN_SHIP_VELOCITY) {
    ship.velX = 0
    ship.velY = 0
  }
}

const checkMaxVelocity = (ship) => {
  const v = Math.hypot(ship.velX, ship.velY)
  if (v > MAX_SHIP_VELOCITY) {
    ship.velX *= MAX_SHIP_VELOCITY / v
    ship.velY *= MAX_SHIP_VELOCITY / v
  }
}

// planet: x, y, radius, seed
const getPlanetsForChunk = (cx, cy) => {
  const r = PLANET_CHUNK_SIZE
  const lcg = new LCG((PLANET_SEED ^ (cx * 1173320513) ^ (cy * 891693747)) & 0xFFFFFFFF)
  const xb = (cx + 0.5) * r
  const yb = (cy + 0.5) * r
  
  const xo = lcg.randomOffset() * (r / 4)
  const yo = lcg.randomOffset() * (r / 4)
  const radius = (r / 24) + (r / 8) * lcg.random()
  const seed = lcg.randomInt()
  return [ { x: xb + xo, y: yb + yo, radius, seed } ]
}

const getPlanets = (x, y) => {
  const x1 = Math.floor((x - MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE)
  const y1 = Math.floor((y - MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE)
  const x2 = Math.floor((x + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE)
  const y2 = Math.floor((y + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE)
  if (x1 == x2 && y1 == y2) {
    return getPlanetsForChunk(x1, y1)
  } else if (x1 == x2) {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x1, y2)]
  } else if (y1 == y2) {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x2, y1)]
  } else {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x2, y1),
      ...getPlanetsForChunk(x1, y2), ...getPlanetsForChunk(x2, y2)]
  }
}

const accel = (ship, accelTimeMs) => {
  const accelMul = getAccelMul(accelTimeMs)
  ship.velX += accelMul * Math.sin(-ship.orient)
  ship.velY += accelMul * Math.cos(-ship.orient)
  checkMaxVelocity(ship)
}

const inertia = (ship) => {
  ship.velX *= INERTIA_MUL
  ship.velY *= INERTIA_MUL
  checkMinVelocity(ship)
}

const brake = (ship) => {
  ship.velX *= BRAKE_MUL
  ship.velY *= BRAKE_MUL
  checkMinVelocity(ship)
}

const gravityBullet = (bullet, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y)
    if (d > (planet.radius + 1.2) && d < planet.radius * 2.5) {
      const dx = planet.x - bullet.posX
      const dy = planet.y - bullet.posY
      const d2 = Math.hypot(dx, dy)
      const m = (BULLET_VELOCITY * (planet.radius ** 1.25)) / (d2 * d2)
      bullet.velX += (m / d2) * dx
      bullet.velY += (m / d2) * dy
    }
  }
  const d = Math.hypot(bullet.velX, bullet.velY)
  bullet.velX *= BULLET_VELOCITY / d
  bullet.velY *= BULLET_VELOCITY / d
}

const gravityShip = (ship, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y)
    if (d > (planet.radius + 1.2) && d < planet.radius * 2.5) {
      const dx = planet.x - ship.posX
      const dy = planet.y - ship.posY
      const d2 = Math.hypot(dx, dy)
      const m = (MAX_SHIP_VELOCITY / 24 * (planet.radius ** 1.5)) / (d2 * d2)
      ship.velX += (m / d2) * dx
      ship.velY += (m / d2) * dy
    }
  }
  checkMaxVelocity(ship)
}

const getRubberbandRadius = (playerCount) => {
  return 100 * Math.pow(Math.max(playerCount, 1), 0.4)
}

const rubberband = (ship, radius) => {
  const distCenter = Math.hypot(ship.posX, ship.posY)
  if (distCenter > radius) {
    const maxRadius = radius + RUBBERBAND_BUFFER
    const baseX = -ship.posX / Math.hypot(ship.posX, ship.posY)
    const baseY = -ship.posY / Math.hypot(ship.posX, ship.posY)
    if (distCenter > maxRadius) {
      ship.velX = ship.velY = 0
    }
    ship.velX += baseX * 0.25 * MAX_SHIP_VELOCITY *
      ((distCenter - radius) / (maxRadius - radius)) ** 4
    ship.velY += baseY * 0.25 * MAX_SHIP_VELOCITY *
      ((distCenter - radius) / (maxRadius - radius)) ** 4
    checkMaxVelocity(ship)
  }
}

module.exports = {
  TICKS_PER_SECOND, 
  MAX_SHIP_VELOCITY,
  BULLET_VELOCITY,
  LATCH_VELOCITY,
  MAX_BULLET_DISTANCE,
  DELAY_BETWEEN_BULLETS_MS,
  RUBBERBAND_BUFFER,
  accel,
  inertia,
  brake,
  gravityBullet,
  gravityShip,
  rubberband,
  getPlanets,
  getRubberbandRadius }
