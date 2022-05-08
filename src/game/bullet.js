const geom = require('../utils/geom')
const physics = require('./physics')
const Counter = require('../utils/counter')
const bulletCounter = new Counter()

const BULLET_VELOCITY = physics.MAX_SHIP_VELOCITY * 1.75
const BULLET_DAMAGE_MULTIPLIER = 0.115
const SHEAR_VEL = .777

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

  dead: false,
  _id: bulletCounter.next()
})

const bulletFields = [
  '_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'dist', 'velocity',
  'shooter', 'shooterName', 'isHit', 'canPickUp', 'type', 'damage'
]

const bulletSystemFactory = handler => {
  let bullets = {}

  const getBullets = () => Object.values(bullets)

  const getBulletsById = (ids) => ids.map(id => bullets[id])

  const removeBullet = (bullet) => {
    bullet.dead = true
    delete bullets[bullet._id]
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
    const shipList = ships.getShips()
    const powerupList = powerups.getPowerups()
    const bulletList = getBullets()
    const shipCount = shipList.length
    const powerupCount = powerupList.length
    const bulletCount = bulletList.length

    for (let i = 0; i < bulletCount; ++i) {
      const bullet = bulletList[i]
      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        removeBullet(bullet)
        continue
      }

      if (bullet.type == 'bullet' || bullet.type == 'laser') {
        physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))

        const newX = bullet.posX + delta * bullet.velX
        const newY = bullet.posY + delta * bullet.velY

        let collisionShip = null
        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j]
          if (ship._id !== bullet.shooter
            && Math.abs(ship.posX - bullet.posX) < bullet.velocity
            && Math.abs(ship.posY - bullet.posY) < bullet.velocity) {
            const t = geom.closestSynchroDistance(
              [ship.posX, ship.posY],
              [ship.posXnew, ship.posYnew],
              [bullet.posX, bullet.posY],
              [newX, newY])
            if (0 <= t && t <= 1) {
              ship.posX = geom.lerp1D(ship.posX, t, ship.posXnew)
              ship.posY = geom.lerp1D(ship.posY, t, ship.posYnew)
              const [p1, p2, p3] = geom.getCollisionPoints(ship)
              if (geom.lineIntersectsTriangle([bullet.posX, bullet.posY],
                [newX, newY], p1, p2, p3)) {
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
      } else if (bullet.type == 'mine') {
        const r = 3 + 7 * Math.random() ** 3
        let primerShip = null
        
        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j]
          if (!ship.dead && bullet.shooter !== ship._id &&
              Math.hypot(ship.posX - bullet.posX,
                ship.posY - bullet.posY) < r) {
            primerShip = ship
            break
          }
        }

        if (primerShip || bullet.isHit) {
          // blow up the mine
          shipList.forEach(ship => {
            if (bullet.shooter === ship._id) return
            if (Math.abs(ship.posX - bullet.posX) > 15 ||
              Math.abs(ship.posY - bullet.posY) > 15) {
              return
            }

            let damage = 2 / Math.sqrt(Math.hypot(
              ship.posX - bullet.posX, ship.posY - bullet.posY))

            if (damage < 0.05) {
              damage = 0
            }

            const shooter = ships.getShipById(bullet.shooter)
            ships.damageShip(ship, damage, bullet, shooter, handler.killShipByBullet)
          })

          handler.onMineExplode(bullet)
          removeBullet(bullet)
          continue
        }

        bullet.dist += physics.MAX_BULLET_DISTANCE / (physics.MINE_LIFETIME * physics.TICKS_PER_SECOND)
      }
    }
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
      noShear } = { 
      extraDist: 0,
      orientOffset: 0,
      speedFactor: 1,
      damageFactor: 1,
      rangeSub: 0,
      canPickUp: true,
      noShear: false,
      ...(extras || {}) }

    let typeSpeedMul = 1
    if (type == 'mine') {
      typeSpeedMul = 0
    }

    let bullet = newBullet()
    bullet = {
      ...bullet,
      posX: p1[0] + Math.sin(-ship.orient + orientOffset) * extraDist,
      posY: p1[1] + Math.cos(-ship.orient + orientOffset) * extraDist,
      type: type,
      velocity: BULLET_VELOCITY * ship.bulletSpeedMul * speedFactor + (noShear ? 0 : Math.hypot(ship.velX, ship.velY)),
      velX: typeSpeedMul * BULLET_VELOCITY * Math.sin(-ship.orient + orientOffset) * ship.bulletSpeedMul + (noShear ? 0 : ship.velX * SHEAR_VEL),
      velY: typeSpeedMul * BULLET_VELOCITY * Math.cos(-ship.orient + orientOffset) * ship.bulletSpeedMul + (noShear ? 0 : ship.velY * SHEAR_VEL),
      dist: rangeSub,
      damage: damageFactor,
      canPickUp: canPickUp,
      shooter: ship._id,
      shooterName: ship.name
    }
    bullets[bullet._id] = bullet
    return bullet
  }

  return {
    getBullets,
    getBulletsById,
    moveBullets,
    addProjectile,
    removeBullet,
    removeMinesBy
  }
}

module.exports = {
  system: bulletSystemFactory,
  fields: bulletFields,
}
