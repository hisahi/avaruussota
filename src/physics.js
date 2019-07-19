const GRAV = 6.67e-11
const TICKS_PER_SECOND = 20
const MS_PER_TICK = 1000 / TICKS_PER_SECOND
const MAX_SHIP_VELOCITY = 48 / TICKS_PER_SECOND
const MIN_SHIP_VELOCITY = 0.01
const LATCH_VELOCITY = 0.3
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 1.75
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 1.5))
const INERTIA_MUL = 1
// (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))
const VIEW_DISTANCE = 50
const MAX_BULLET_DISTANCE = 50
const DELAY_BETWEEN_BULLETS_MS = 200
const RUBBERBAND_BUFFER = 80
const LCG = require('./utils/lcg')
const PLANET_CHUNK_SIZE = VIEW_DISTANCE * 1.6 + 1

let PLANET_SEED = 1340985553

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
  const maxvel = MAX_SHIP_VELOCITY * healthToVelocity(ship.health)
  const v = Math.hypot(ship.velX, ship.velY) * ship.speedMul
  if (v > maxvel) {
    ship.velX *= maxvel / v
    ship.velY *= maxvel / v
  }
}

const getPlanetSeed = () => {
  return PLANET_SEED
}

const setPlanetSeed = (seed) => {
  PLANET_SEED = seed
}

const newPlanetSeed = () => {
  PLANET_SEED = Math.floor(Math.random() * 2147483647)
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
  const x0 = Math.floor(x / PLANET_CHUNK_SIZE)
  const y0 = Math.floor(y / PLANET_CHUNK_SIZE)

  const xu = [x0 - 2, x0 - 1, x0, x0 + 1, x0 + 2]
  const yu = [y0 - 2, y0 - 1, y0, y0 + 1, y0 + 2]
  let planets = []

  for (const x of xu) {
    for (const y of yu) {
      planets = [...planets, ...getPlanetsForChunk(x, y)]
    }
  }
  
  return planets
}

const hasOverdrive = (ship) => {
  return ship.overdrive > 0
}

const hasRubbership = (ship) => {
  return ship.rubbership > 0
}

const hasRegen = (ship) => {
  return ship.regen > 0
}

const accel = (ship, accelTimeMs) => {
  let accelMul = getAccelMul(accelTimeMs) * healthToVelocity(ship.health)
    * (hasOverdrive(ship) ? 2 : 1)
  if (ship.speedMul !== 1) {
    accelMul *= Math.sqrt(ship.speedMul)
  }
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

const recoil = (ship) => {
  ship.velX -= 0.017 * Math.sin(-ship.orient)
  ship.velY -= 0.017 * Math.cos(-ship.orient)
  checkMaxVelocity(ship)
}

const gravityBullet = (bullet, planets) => {
  if (bullet.type == 'mine') {
    return
  }

  for (const planet of planets) {
    const d = Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y)
    if (d > (planet.radius + 1.2) && d < planet.radius * 3) {
      const dx = planet.x - bullet.posX
      const dy = planet.y - bullet.posY
      const r2 = Math.hypot(dx, dy) ** 2
      const f = GRAV * 8e+9 / r2 * planet.radius
      bullet.velX += f * dx
      bullet.velY += f * dy
    }
  }
  const d = Math.hypot(bullet.velX, bullet.velY)
  bullet.velX *= bullet.velocity / d
  bullet.velY *= bullet.velocity / d
}

const gravityShip = (ship, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y)
    if (d > (planet.radius + 1) && d < planet.radius * 3) {
      const dx = planet.x - ship.posX
      const dy = planet.y - ship.posY
      const r2 = Math.hypot(dx, dy) ** 2
      const f = GRAV * 8e+8 * planet.radius / r2 / (
        (ship.accel !== null || ship.brake !== null) ? 5 : 1)
      ship.velX += f * dx
      ship.velY += f * dy
    }
  }
  checkMaxVelocity(ship)
}

const getRubberbandRadius = (playerCount) => {
  return 75 * Math.pow(Math.max(playerCount, 1), 0.75)
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
    ship.velX += baseX * 0.3 * MAX_SHIP_VELOCITY *
      (1.1 * (distCenter - radius) / (maxRadius - radius)) ** 8
    ship.velY += baseY * 0.3 * MAX_SHIP_VELOCITY *
      (1.1 * (distCenter - radius) / (maxRadius - radius)) ** 8
    checkMaxVelocity(ship)
  }
}

const healthToVelocity = (health) => {
  return 0.6 + 0.4 * Math.pow(health, 1.5)
}

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  MS_PER_TICK,
  BULLET_VELOCITY,
  LATCH_VELOCITY,
  VIEW_DISTANCE,
  MAX_BULLET_DISTANCE,
  PLANET_CHUNK_SIZE,
  DELAY_BETWEEN_BULLETS_MS,
  RUBBERBAND_BUFFER,
  hasOverdrive,
  hasRubbership,
  hasRegen,
  accel,
  inertia,
  brake,
  recoil,
  gravityBullet,
  gravityShip,
  rubberband,
  getPlanets,
  getPlanetSeed,
  setPlanetSeed,
  newPlanetSeed,
  getRubberbandRadius,
  healthToVelocity }
