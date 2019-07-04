const TICKS_PER_SECOND = 30
const MAX_SHIP_VELOCITY = 32 / TICKS_PER_SECOND
const MIN_SHIP_VELOCITY = 0.01
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 2
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 2.5))
const INERTIA_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 120))
const MAX_BULLET_DISTANCE = 56
const DELAY_BETWEEN_BULLETS_MS = 250

const getAccelMul = (accelTimeMs) => { // time in milliseconds
  return 0.0125 + 0.0000125 * accelTimeMs
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

module.exports = {
  TICKS_PER_SECOND, 
  MAX_SHIP_VELOCITY,
  BULLET_VELOCITY,
  MAX_BULLET_DISTANCE,
  DELAY_BETWEEN_BULLETS_MS,
  accel,
  inertia,
  brake }
