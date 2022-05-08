const GRAV = 6.67e-11
const TICKS_PER_SECOND = 25
const MS_PER_TICK = 1000 / TICKS_PER_SECOND
const MAX_SHIP_VELOCITY = 64 / TICKS_PER_SECOND
const ACTUAL_MAX_SHIP_VELOCITY = MAX_SHIP_VELOCITY * 2.5
const ACCEL_BASE = 0.0875
const ACCEL_FACTOR = 0.000025
const MIN_SHIP_VELOCITY = 0.01
const LATCH_VELOCITY = 0.33
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 1.75
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 1.5))
const VIEW_DISTANCE = 55
const MAX_BULLET_DISTANCE = 100
const RUBBERBAND_BUFFER = 80
const RUBBERBAND_RADIUS_MUL = 80
const MINE_LIFETIME = 120
const INERTIA_MUL = 1
// (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))

const LCG = require('../utils/lcg')
const geom = require('../utils/geom')
const PLANET_CHUNK_SIZE = VIEW_DISTANCE * 1.6 + 1
const lcg = new LCG(0)

let PLANET_SEED = 1340985553

const getAccelMul = (accelTimeMs) => { // time in milliseconds
  return ACCEL_BASE + ACCEL_FACTOR * Math.min(accelTimeMs, 2500)
}

const getAccelRamp = (v) => {
  if (v < MAX_SHIP_VELOCITY) return 1
  return (geom.unlerp1D(ACTUAL_MAX_SHIP_VELOCITY, v, MAX_SHIP_VELOCITY)) ** 1.5
}

const checkMinVelocity = (ship) => {
  const v = Math.hypot(ship.velX, ship.velY)
  if (v <= MIN_SHIP_VELOCITY) {
    ship.velX = 0
    ship.velY = 0
  }
}

const checkMaxVelocity = (ship) => {
  const maxvel = ACTUAL_MAX_SHIP_VELOCITY * healthToVelocity(ship.health) * ship.speedMul
  const v = Math.hypot(ship.velX, ship.velY)
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
  const xb = (cx + 0.5) * r
  const yb = (cy + 0.5) * r

  lcg.reseed((PLANET_SEED ^ (cx * 1173320513) ^ (cy * 891693747)) & 0xFFFFFFFF)
  
  const xo = lcg.randomOffset() * (r / 4)
  const yo = lcg.randomOffset() * (r / 4)
  const radius = (r / 20) + (r / 12) * lcg.random()
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
    * ship.thrustBoost
    * (hasOverdrive(ship) ? 2 : 1) * (ship.highAgility ? 1.33 : 1)
  if (ship.speedMul !== 1) {
    accelMul *= Math.sqrt(ship.speedMul)
  }
  const v = Math.hypot(ship.velX, ship.velY)
  ship.velX += accelMul * getAccelRamp(v) * Math.sin(-ship.orient)
  ship.velY += accelMul * getAccelRamp(v) * Math.cos(-ship.orient)
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
    if (d > (planet.radius + 1) && d < 10 + planet.radius * 4) {
      const dx = planet.x - bullet.posX
      const dy = planet.y - bullet.posY
      const r2 = Math.hypot(dx, dy) ** 2
      const f = GRAV * 1.5e+10 / r2 * planet.radius
      bullet.velX += f * dx
      bullet.velY += f * dy
    }
  }
  const d = Math.hypot(bullet.velX, bullet.velY)
  bullet.velX *= bullet.velocity / d
  bullet.velY *= bullet.velocity / d
}

const gravityShip = (ship, planets) => {
  let thrust = 1
  const vector = [Math.sin(-ship.orient), Math.cos(-ship.orient)]
  const dv = Math.hypot(ship.velX, ship.velY)
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y)
    if (d > (planet.radius + 1.5 + dv * 0.3) && d < 10 + planet.radius * 4) {
      const dx = planet.x - ship.posX
      const dy = planet.y - ship.posY
      const r2 = Math.hypot(dx, dy) ** 2
      const f = GRAV * 1e+9 * planet.radius / r2 / (
        (ship.accel !== null || ship.brake !== null) ? 5 : 1)
      ship.velX += f * dx
      ship.velY += f * dy
      if (ship.accel !== null) {
        const direction = geom.normalize(dx, dy)
        thrust += 3 * (Math.min(1, dv / MAX_SHIP_VELOCITY) ** 0.5) *
          (1000 * Math.max(0, f * (direction[0] * vector[0]
                                 + direction[1] * vector[1]))) ** 1.5
      }
    }
  }
  ship.thrustBoost = Math.min(thrust, 3)
  checkMaxVelocity(ship)
}

const getRubberbandRadius = (playerCount) => {
  return RUBBERBAND_RADIUS_MUL * Math.pow(Math.max(playerCount, 1), 0.75)
}

const rubberband = (ship, radius) => {
  const distCenter = Math.hypot(ship.posX, ship.posY)
  if (distCenter > radius) {
    const maxRadius = radius + RUBBERBAND_BUFFER
    const baseX = -ship.posX / Math.hypot(ship.posX, ship.posY)
    const baseY = -ship.posY / Math.hypot(ship.posX, ship.posY)
    const d = (distCenter - radius) / (maxRadius - radius)
    ship.velX += baseX * 0.3 * MAX_SHIP_VELOCITY * (1.1 * d) ** 8
    ship.velY += baseY * 0.3 * MAX_SHIP_VELOCITY * (1.1 * d) ** 8
    const v = Math.hypot(ship.velX, ship.velY)
    if (v > MAX_SHIP_VELOCITY) {
      const nv = geom.lerp1D(v, 0.05, MAX_SHIP_VELOCITY)
      ship.velX *= nv / v
      ship.velY *= nv / v
    }
    checkMaxVelocity(ship)
  }
}

const healthToVelocity = (health) => {
  return 0.7 + 0.3 * health
}

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  ACTUAL_MAX_SHIP_VELOCITY,
  MS_PER_TICK,
  BULLET_VELOCITY,
  LATCH_VELOCITY,
  VIEW_DISTANCE,
  MAX_BULLET_DISTANCE,
  PLANET_CHUNK_SIZE,
  RUBBERBAND_BUFFER,
  MINE_LIFETIME,
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
