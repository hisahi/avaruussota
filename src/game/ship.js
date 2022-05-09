const geom = require('../utils/geom')
const chron = require('../utils/chron')
const physics = require('./physics')
const maths = require('../utils/maths')
const Counter = require('../utils/counter')
const shipCounter = new Counter()

const SHIP_RECT_RADIUS = 2
const SHIP_RADIUS = 1.35

const newShip = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  orient: 0,                  // radians, clockwise from 0 = up
  health: 1,                  // 0 = no health, 1 = max health

  name: '',
  score: 0,
  accel: null,
  brake: null,
  firing: false,
  latched: false,
  fireWaitTicks: 0,
  thrustBoost: 1,

  // perks
  firingInterval: 4,
  bulletSpeedMul: 1.0,
  healthMul: 1.0,
  speedMul: 1.0,
  planetDamageMul: 1.0,
  highAgility: false,
  absorber: false,
  healRate: 1,

  // powerups
  item: null,
  rubbership: 0,
  regen: 0,
  overdrive: 0,

  lastDamageAt: null,
  lastDamageBy: null,

  dead: false,
  _id: shipCounter.next()
})

const shipFields = [
  '_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'orient', 'health',
  'name', 'score', 'accel', 'brake', 'firing', 'latched', 'fireWaitTicks',
  'thrustBoost',
  'firingInterval', 'bulletSpeedMul', 'healthMul', 'speedMul', 'planetDamageMul',
  'highAgility', 'absorber', 'healRate', 'item', 'rubbership', 'regen', 'overdrive'
]

const shipSystemFactory = handler => {
  let ships = {}

  const getShips = () => Object.values(ships)
  const getShipById = id => ships[id]
  const getShipCount = () => Object.keys(ships).length
  const removeShipById = id => delete ships[id]

  const newPlayerShip = (radius, bullets) => {
    const ship = newShip()
    spawn(ship, radius, bullets)
    ships[ship._id] = ship
    return ship
  }

  const latchToPlanet = (ship, planet) => {
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY) + Math.PI
    latchToPlanetWithAngle(ship, planet, planetAngle)
  }

  const computePlanetPoint = (planet, angle) => {
    return [planet.x + (planet.radius + 1.4) * Math.sin(angle),
      planet.y + (planet.radius + 1.4) * Math.cos(angle)]
  }

  const latchToPlanetWithAngle = (ship, planet, angle) => {
    const [x, y] = computePlanetPoint(planet, angle)
    ship.velX = 0
    ship.velY = 0
    ship.posX = x
    ship.posY = y
    ship.posXnew = x
    ship.posYnew = y
    ship.orient = -angle
    ship.latched = ship.accel === null
    handler.onShipLatch(ship)
  }

  const spawnLone = (ship, radius) => {
    let baseX = physics.VIEW_DISTANCE * maths.randomSign() * Math.random()
    let baseY = physics.VIEW_DISTANCE * maths.randomSign() * Math.random()
    
    let planets = physics.getPlanets(baseX, baseY)
    planets = planets.filter(planet =>
      Math.hypot(planet.x, planet.y) < radius - planet.radius)
    if (planets.length < 1) {
      ship.posX = baseX
      ship.posY = baseY
      ship.orient = 0
      return
    }

    const planet = planets[0 | (planets.length * Math.random())]
    latchToPlanetWithAngle(ship, planet, Math.random() * 2 * Math.PI)
  }

  const spawn = (ship, radius, bullets) => {
    const playerKeys = Object.keys(ships)
    const playerCount = playerKeys.length
    let baseX = 0
    let baseY = 0
    if (playerCount < 1) {
      return spawnLone(ship, radius)
    }

    let tries = 64
    
    while (--tries > 0) {
      const randShip = ships[playerKeys[(playerCount * Math.random()) | 0]]
      baseX = randShip.posX
      baseY = randShip.posY
      baseX += physics.VIEW_DISTANCE * maths.randomSign()
      baseY += physics.VIEW_DISTANCE * maths.randomSign()
      if (Math.hypot(baseX, baseY) < radius - physics.PLANET_CHUNK_SIZE / 8) {
        break
      }
      if (tries < 8) {
        if (Math.hypot(baseX, baseY) < radius) {
          break
        }
      }
    }

    let planets = physics.getPlanets(baseX, baseY)
    planets = planets.filter(planet =>
      Math.hypot(planet.x, planet.y) < radius - (planet.radius - 3))
    if (planets.length < 1) {
      ship.posX = baseX + physics.VIEW_DISTANCE * maths.randomSign()
      ship.posY = baseY + physics.VIEW_DISTANCE * maths.randomSign()
      ship.orient = 0
      return
    }
    
    planets.forEach(planet => {
      planet.playerDist = Math.min.call(null, 
        getShips().map(ship => 
          Math.hypot(ship.posX - planet.x, ship.posY - planet.y)))
      planet.bulletDist = Math.min.call(null, 
        bullets.getBullets().map(bullet => 
          Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y)))
    })

    const ideal = planets.find(planet => 
      planet.playerDist > physics.VIEW_DISTANCE 
      && planet.bulletDist > physics.MAX_BULLET_DISTANCE)

    if (ideal) {
      latchToPlanetWithAngle(ship, ideal, Math.random() * 2 * Math.PI)
      return
    }

    const testPlanet = (a, b) => (
      a.playerDist + a.bulletDist * 1.5 > b.playerDist + b.bulletDist * 1.5
    )
    const mostIdeal = planets.reduce((a, b) => 
      (testPlanet(a, b) ? a : b)
    )

    // pick optimal angle
    const angleOffset = Math.random() * 2 * Math.PI
    let minimalScore = 0
    let angle = 0
    for (let i = 0; i < 8; ++i) {
      const testAngle = angleOffset + i * Math.PI / 4
      const [x, y] = computePlanetPoint(mostIdeal, testAngle)
      const score = Math.min.call(null, 
        getShips().map(ship => 
          Math.hypot(ship.posX - x, ship.posY - y)))
        + Math.min.call(null, 
          bullets.getBullets().map(bullet => 
            Math.hypot(bullet.posX - x, bullet.posY - y)))
      if (minimalScore < score) {
        minimalScore = score
        angle = testAngle
      }
    }

    latchToPlanetWithAngle(ship, mostIdeal, angle)
  }

  const doFire = (ship) => {
    if (!ship || ship.dead !== false) {
      return false
    }

    if (ship.fireWaitTicks <= 0) {
      handler.addProjectile(ship, 'bullet', { speedFactor: ship.latched ? 1.25 : 1 })
      ship.fireWaitTicks = ship.firingInterval
      return true
    }
    return false
  }

  const shipAcceleration = (delta, radius, radiusGoal) => {
    const now = chron.timeMs()
    const shipList = getShips()
    for (let i = 0, shipCount = shipList.length; i < shipCount; ++i) {
      const ship = shipList[i]
      let doAccel = false
      let doBrake = false
  
      if (ship.accel != null && ship.brake != null) {
        if (ship.accel > ship.brake) {
          doAccel = true
        } else {
          doBrake = true
        }
      } else if (ship.accel != null) {
        doAccel = true
      } else if (ship.brake != null) {
        doBrake = true
      }
  
      if (doAccel) {
        physics.accel(ship, now - ship.accel)
        ship.latched = false
      } else if (doBrake) {
        physics.brake(ship)
      }
      if (ship.firing) {
        if (doFire(ship) && !ship.latched) {
          physics.recoil(ship)
        }
      }
  
      physics.inertia(ship)
      if (!ship.latched) {
        physics.rubberband(ship, radius)
      } else {
        ship.velX = ship.velY = 0
        if (Math.hypot(ship.posX, ship.posY) > (radius + 10) 
          && radiusGoal < radius) {
          ship.latched = false
          ship.velX += Math.sin(-ship.orient)
          ship.velY += Math.cos(-ship.orient)
        }
      }
      if (ship.latched && ship.health < 1) {
        ship.health = Math.min(1, ship.health + ship.healthMul * ship.healRate * 1 / (20 * physics.TICKS_PER_SECOND))
      }
      if (physics.hasRegen(ship)) {
        ship.health = Math.min(1, ship.health + ship.healthMul * ship.healRate * 1.5 / (20 * physics.TICKS_PER_SECOND))
      }
      ship.fireWaitTicks = Math.max(0, ship.fireWaitTicks - (physics.hasOverdrive(ship) ? 2 : 1))
      ship.regen = Math.max(0, ship.regen - physics.MS_PER_TICK)
      ship.overdrive = Math.max(0, ship.overdrive - physics.MS_PER_TICK)
      ship.rubbership = Math.max(0, ship.rubbership - physics.MS_PER_TICK)
      
      if (!ship.latched) {
        physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
      }
    }
  }

  const premoveShips = (delta) => {
    const shipList = getShips()
    const shipCount = shipList.length

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i]
      ship1.posXnew = ship1.posX + delta * ship1.velX
      ship1.posYnew = ship1.posY + delta * ship1.velY
    }
  }

  const moveShips = (delta, powerups) => {
    const shipList = getShips()
    const powerupList = powerups.getPowerups()
    const shipCount = shipList.length
    const powerupCount = powerupList.length
    const dist = physics.ACTUAL_MAX_SHIP_VELOCITY + 1

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i]

      for (let j = 0; j < powerupCount; ++j) {
        const pup = powerupList[j]
        if (Math.abs(ship1.posX - pup.posX) < 3
          && Math.abs(ship1.posY - pup.posY) < 3) {
          const t = geom.lineIntersectCircleFirstDepth(
            [ship1.posX, ship1.posY],
            [ship1.posXnew, ship1.posYnew],
            pup.posX, pup.posY, pup.pickupRadius)
          if (0 <= t && t <= 1) {
            powerups.updateClosestPlayer(pup, ship1, t)
          }
        }
      }

      for (let j = 0; j < shipCount; ++j) {
        const ship2 = shipList[j]
        if (i == j || ship1.dead || ship2.dead) {
          continue
        }

        if (Math.abs(ship1.posX - ship2.posX) < dist &&
          Math.abs(ship1.posY - ship2.posY) < dist) {
          const t = geom.closestSynchroDistance(
            [ship1.posX, ship1.posY],
            [ship1.posXnew, ship1.posYnew],
            [ship2.posX, ship2.posY],
            [ship2.posXnew, ship2.posYnew])
          if (0 <= t && t <= 1) {
            ship1.posX = geom.lerp1D(ship1.posX, t, ship1.posXnew)
            ship1.posY = geom.lerp1D(ship1.posY, t, ship1.posYnew)
            ship2.posX = geom.lerp1D(ship2.posX, t, ship2.posXnew)
            ship2.posY = geom.lerp1D(ship2.posY, t, ship2.posYnew)
            testShipShipCollision(ship1, ship2)
          }
        }
      }

      const planets = physics.getPlanets(ship1.posX, ship1.posY)
      for (let j = 0; j < planets.length; ++j)  {
        const planet = planets[j]
        const search = planet.radius + SHIP_RADIUS
        const searchSquare = search ** 2;
        [ship1.posX, ship1.posY] = geom.lineClosestPointToPoint(
          ship1.posX, ship1.posY, ship1.posXnew, ship1.posYnew,
          planet.x, planet.y
        )

        if (Math.abs(ship1.posX - planet.x) < search 
          && Math.abs(ship1.posY - planet.y) < search) {
          if (maths.squarePair(ship1.posX - planet.x, ship1.posY - planet.y) 
            < searchSquare) {
            if (!ship1.dead) {
              handleShipPlanetCollision(ship1, planet)
            }
            break
          }
        }
      }
    }

    for (let i = 0; i < shipCount; ++i) {
      const ship = shipList[i]
      ship.posX = ship.posXnew
      ship.posY = ship.posYnew
    }
  }

  const handleShipShipCollision = (ship1, ship2) => {
    const dx = ship1.velX - ship2.velX
    const dy = ship1.velY - ship2.velY
    const damage = 5 * Math.hypot(dx, dy) ** 0.25
      / (physics.ACTUAL_MAX_SHIP_VELOCITY / 4)
    const dmg1 = damage * (physics.hasRubbership(ship1) ? 0 : 1)
    const dmg2 = damage * (physics.hasRubbership(ship2) ? 0 : 1)

    if (dmg1 >= 0.1) {
      ship1.health -= dmg1 * ship1.healthMul
    }

    if (dmg2 >= 0.1) {
      ship2.health -= dmg2 * ship2.healthMul
    }

    // elastic collision
    [ship1.velX, ship2.velX] = [ship2.velX, ship1.velX];
    [ship1.velY, ship2.velY] = [ship2.velY, ship1.velY]
    
    if (ship1.health <= 0) {
      if (ship2.health > 0) {
        ++ship2.score
      }
      handler.onShipKilledByCrash(ship1, ship2)
      killShip(ship1)
    }

    if (ship2.health <= 0) {
      if (ship1.health > 0) {
        ++ship1.score
      }
      handler.onShipKilledByCrash(ship2, ship1)
      killShip(ship2)
    }
  }

  const testShipShipCollision = (ship1, ship2) => {
    if (Math.abs(ship1.posX - ship2.posX) < SHIP_RECT_RADIUS &&
        Math.abs(ship1.posY - ship2.posY) < SHIP_RECT_RADIUS) {
      const [p1, p2, p3] = geom.getCollisionPoints(ship1)
      const [q1, q2,   , q4] = geom.getShipPoints(ship2)
      if (geom.testTriangleCollision(p1, p2, p3, q1, q2, q4)) {
        handleShipShipCollision(ship1, ship2)
      }
    }
  }

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY)
    let dist = Math.hypot(planet.x - ship.posX, planet.y - ship.posY)
    const d = 1 - (dist / (planet.radius - 1))
    const col_mul = geom.getPlanetDamageMultiplier(
      Math.sin(-ship.orient), Math.cos(-ship.orient),
      ship.posX - planet.x, ship.posY - planet.y)
    if (!col_mul) return
    const col_vmul = geom.getPlanetDamageSpeedMultiplier(ship.velX, ship.velY,
      ship.posX - planet.x, ship.posY - planet.y)
    let damage = Math.max(v * col_mul * col_vmul, d) / physics.MAX_SHIP_VELOCITY * ship.planetDamageMul 
      * (physics.hasRubbership(ship) ? 0 : 1)

    if (!ship.accel 
      && v > 0 
      && v * col_mul < physics.LATCH_VELOCITY * (ship.brake !== null ? 1.75 : 1)) {
      latchToPlanet(ship, planet)
      return
    }

    if (col_mul < 0.2 && ship.accel !== null) {
      damage *= 0.2
    }

    let offx = ship.posX - planet.x
    let offy = ship.posY - planet.y;
    [offx, offy] = geom.normalize(offx, offy)
    const radius = planet.radius + SHIP_RADIUS

    ship.posX = planet.x + offx * (radius + 0.5)
    ship.posY = planet.y + offy * (radius + 0.5)

    ship.velX = -ship.velX + offx * v * 2
    ship.velY = -ship.velY + offy * v * 2
    if (v > 0)
      ([ship.velX, ship.velY] = geom.normalize(ship.velX, ship.velY, v))

    if (damage >= 0.05) {
      damageShip(ship, damage, null, null, (ship) => {
        if (ship.lastDamageAt && chron.timeMs() - ship.lastDamageAt < 2500) {
          const by = getShipById(ship.lastDamageBy)
          if (by) ++by.score
        }
        handler.onShipKilledByPlanet(ship)
        killShip(ship)
      })
    }

    if (ship.dead) {
      return
    }
  
    dist = Math.hypot(planet.x - ship.posX, planet.y - ship.posY)
    if (dist < planet.radius - 0.05)
      latchToPlanet(ship, planet)

    /*if (!physics.hasRubbership(ship) && damage < 0.4 && col_mul < 1.7) {
      latchToPlanet(ship, planet)
    }*/
  }

  const deleteShip = (ship) => {
    ship.dead = true
    removeShipById(ship._id)
  }

  const damageShip = (ship, damage, bullet, shooter, onDeath) => {
    if (ship.dead) return
    ship.health -= damage * ship.healthMul
    if (shooter) {
      ship.lastDamageAt = chron.timeMs()
      ship.lastDamageBy = shooter._id
    }
    if (ship.health <= 0) {
      if (shooter) {
        ++shooter.score
      }
      onDeath(ship, bullet)
    }
  }

  const killShip = (ship) => {
    deleteShip(ship)
    handler.onShipKilled(ship)
  }

  return {
    getShips,
    getShipById,
    getShipCount,
    damageShip,
    removeShipById,
    newPlayerShip,
    premoveShips,
    moveShips,
    killShip,
    deleteShip,
    shipAcceleration
  }
}

module.exports = {
  system: shipSystemFactory,
  fields: shipFields,
}
