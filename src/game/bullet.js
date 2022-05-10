const chron = require('../utils/chron')
const geom = require('../utils/geom')
const maths = require('../utils/maths')
const physics = require('./physics')
const Counter = require('../utils/counter')
const bulletCounter = new Counter()
const { filterInplace } = require('../utils/filter')

const BULLET_VELOCITY = physics.MAX_SHIP_VELOCITY * 2.4
const BULLET_DAMAGE_MULTIPLIER = 0.115

const newBullet = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0,                    // distance taken
  velocity: 0,
  shooter: null,
  shooterName: '',
  isHit: false,
  canPickUp: true,
  type: 'bullet',
  damage: 1,
  radius: 0.3,
  punch: 0,

  dead: false,
  _id: bulletCounter.next()
})

const FIELDS = [
  '_id', 'posX', 'posY', 'velX', 'velY', 'dist', 'dead', 'velocity',
  'shooter', 'shooterName', 'isHit', 'canPickUp', 'type', 'damage'
]

const FIELDS_SHORT = [
  '_id', 'posX', 'posY', 'velX', 'velY', 'dist'
]

const bulletTypeRadius = {
  bullet: 0.3,
  laser: 0.01,
  knockout: 0.7,
}

const bulletSystemFactory = handler => {
  let bullets = []

  const getBullets = () => bullets

  const removeBullet = (bullet) => {
    bullet.dead = true
    handler.onBulletDeleted(bullet)
  }

  const handleShipBulletCollision = (ships, ship, bullet) => {
    if (bullet.dead) {
      return
    }
    const shooter = ships.getShipById(bullet.shooter)
    if (shooter && shooter.absorber) {
      shooter.health += 0.01 * shooter.healthMul
    }
    ships.damageShip(ship, BULLET_DAMAGE_MULTIPLIER * bullet.damage, bullet, shooter, handler.killShipByBullet)
    if (bullet.punch) {
      if (ship.latched) {
        ship.latched = false
        ship.velX += Math.sin(-ship.orient) * 25 * bullet.punch
        ship.velY += Math.cos(-ship.orient) * 25 * bullet.punch
      } else {
        let hitX = ship.posX - bullet.posX
        let hitY = ship.posY - bullet.posY;
        [hitX, hitY] = geom.normalize(hitX, hitY, 25 * bullet.punch)
        ship.velX += hitX
        ship.velY += hitY
      }
      if (shooter) {
        ship.lastDamageAt = chron.timeMs()
        ship.lastDamageBy = bullet.shooter
      }
      physics.checkMaxVelocity(ship)
    }
    if (bullet.type !== 'laser') {
      removeBullet(bullet)
    }
  }

  const handlePowerupBulletCollision = (ships, powerup, bullet, powerups) => {
    if (bullet.dead) {
      return
    }
    const shooter = ships.getShipById(bullet.shooter)
    if (shooter) {
      powerups.applyPowerup(shooter, powerup)
    }
    if (bullet.type !== 'laser') {
      removeBullet(bullet)
    }
  }

  const removeMinesBy = ship => {
    const shipId = ship._id
    const projList = getBullets()
    const projCount = projList.length
    for (let i = 0; i < projCount; ++i) {
      const bullet = projList[i]
      if (bullet.type === 'mine' && bullet.shooter === shipId) {
        removeBullet(bullet)
      }
    }
  }

  const moveBullets = (delta, ships, powerups) => {
    const powerupList = powerups.getPowerups()
    const bulletList = getBullets()
    const powerupCount = powerupList.length
    const bulletCount = bulletList.length

    for (let i = 0; i < bulletCount; ++i) {
      const bullet = bulletList[i]
      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        removeBullet(bullet)
        continue
      }
      if (bullet.dead) continue

      switch (bullet.type) {
      case 'bullet':
      case 'knockout':
        physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))
        // fall through
      case 'laser':
      {
        const newX = bullet.posX + delta * bullet.velX
        const newY = bullet.posY + delta * bullet.velY
        const isLaser = bullet.type === 'laser'

        let collisionShip = null
        for (const ship of ships.iterateShips()) {
          if (ship._id !== bullet.shooter
            && Math.abs(ship.posX - bullet.posX) < 2 * delta * Math.abs(bullet.velX) + bullet.radius
            && Math.abs(ship.posY - bullet.posY) < 2 * delta * Math.abs(bullet.velY) + bullet.radius) {
            const t = geom.closestSynchroDistance(
              [ship.posX, ship.posY],
              [ship.posXnew, ship.posYnew],
              [bullet.posX, bullet.posY],
              [newX, newY])
            if ((isLaser ? 0 : -2) <= t && t <= (isLaser ? 1 : 3)) {
              [ship.posX, ship.posY] = geom.lerp2D([ship.posX, ship.posY],
                maths.clamp(0, t, 1), [ship.posXnew, ship.posYnew])
              const [p1, p2, p3] = geom.getCollisionPoints(ship)
              const dist = geom.lineClosestDistanceToTriangle(
                [bullet.posX, bullet.posY], [newX, newY], p1, p2, p3)
              if (dist < bullet.radius) {
                collisionShip = ship
                break
              }
            }
          }
        }

        if (collisionShip) {
          handleShipBulletCollision(ships, collisionShip, bullet)
        }

        let collisionPowerup = null
        if (bullet.canPickUp) {
          for (let j = 0; j < powerupCount; ++j) {
            const powerup = powerupList[j]
            if (Math.abs(powerup.posX - bullet.posX) < bullet.velocity &&
                Math.abs(powerup.posY - bullet.posY) < bullet.velocity) {
              const r = powerup.pickupRadius * 0.35
              const a1 = [
                powerup.posX - (bullet.posY - powerup.posY) * r,
                powerup.posY - (powerup.posX - bullet.posX) * r
              ]
              const a2 = [
                powerup.posX + (bullet.posY - powerup.posY) * r,
                powerup.posY + (powerup.posX - bullet.posX) * r
              ]
              if (geom.lineIntersectsLine([bullet.posX, bullet.posY],
                [newX, newY], a1, a2)) {
                collisionPowerup = powerup
                break
              }
            }
          }
        }

        if (collisionPowerup) {
          handlePowerupBulletCollision(ships, collisionPowerup, bullet, powerups)
        }
        
        let hitPlanet = false
        const planets = physics.getPlanets(newX, newY)
        for (const planet of planets) {
          if (Math.hypot(planet.x - newX, planet.y - newY) < planet.radius) {
            hitPlanet = true
            break
          }
        }

        if (hitPlanet) {
          removeBullet(bullet)
          continue
        }

        bullet.posX = newX
        bullet.posY = newY
        bullet.dist += delta * bullet.velocity
        break
      }
      case 'mine':
      {
        const r = 3 + 7 * Math.random() ** 3
        let primerShip = null
        
        for (const ship of ships.iterateShips()) {
          if (!ship.dead && bullet.shooter !== ship._id &&
              Math.hypot(ship.posX - bullet.posX,
                ship.posY - bullet.posY) < r) {
            primerShip = ship
            break
          }
        }

        if (primerShip || bullet.isHit) {
          // blow up the mine
          for (const ship of ships.iterateShips()) {
            if (bullet.shooter === ship._id) continue
            if (Math.abs(ship.posX - bullet.posX) > 15 ||
              Math.abs(ship.posY - bullet.posY) > 15) {
              continue
            }

            let damage = 2 / Math.sqrt(Math.hypot(
              ship.posX - bullet.posX, ship.posY - bullet.posY))

            if (damage < 0.05) {
              damage = 0
            }

            const shooter = ships.getShipById(bullet.shooter)
            ships.damageShip(ship, damage, bullet, shooter, handler.killShipByBullet)
          }

          handler.onMineExplode(bullet)
          removeBullet(bullet)
          continue
        }

        bullet.dist += physics.MAX_BULLET_DISTANCE / (physics.MINE_LIFETIME * physics.TICKS_PER_SECOND)
        break
      }
      }
    }

    filterInplace(bullets, bullet => !bullet.dead)
  }

  const addProjectile = (ship, type, extras) => {
    const [p1, , , ] = geom.getShipPoints(ship)
    const { 
      extraDist, 
      orientOffset, 
      speedFactor,
      damageFactor, 
      rangeSub,
      canPickUp,
      noShear,
      punch } = { 
      extraDist: 0,
      orientOffset: 0,
      speedFactor: 1,
      damageFactor: 1,
      rangeSub: 0,
      canPickUp: true,
      noShear: false,
      punch: 0,
      ...(extras || {}) }

    let typeSpeedMul = 1
    if (type == 'mine') {
      typeSpeedMul = 0
    }
    typeSpeedMul *= speedFactor

    let bullet = newBullet()
    bullet = {
      ...bullet,
      posX: p1[0] + Math.sin(-ship.orient + orientOffset) * extraDist,
      posY: p1[1] + Math.cos(-ship.orient + orientOffset) * extraDist,
      type: type,
      velocity: BULLET_VELOCITY * ship.bulletSpeedMul,
      velX: typeSpeedMul * BULLET_VELOCITY * Math.sin(-ship.orient + orientOffset) * ship.bulletSpeedMul + (noShear ? 0 : ship.velX),
      velY: typeSpeedMul * BULLET_VELOCITY * Math.cos(-ship.orient + orientOffset) * ship.bulletSpeedMul + (noShear ? 0 : ship.velY),
      dist: rangeSub,
      damage: damageFactor,
      canPickUp: canPickUp,
      shooter: ship._id,
      shooterName: ship.name,
      radius: bulletTypeRadius[type] || bulletTypeRadius['bullet'],
      punch: punch
    }
    //[bullet.velX, bullet.velY] = geom.normalize(bullet.velX, bullet.velY, bullet.velocity)
    bullets.push(bullet)
    return bullet
  }

  return {
    getBullets,
    moveBullets,
    addProjectile,
    removeBullet,
    removeMinesBy
  }
}

module.exports = {
  system: bulletSystemFactory,
  FIELDS,
  FIELDS_SHORT,
}
