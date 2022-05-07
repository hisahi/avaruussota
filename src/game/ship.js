const geom = require('../utils/geom')
const chron = require('../utils/chron')
const physics = require('./physics')
const maths = require('../utils/maths')
const Counter = require('../utils/counter')
const shipCounter = new Counter()

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

  dead: false,
  _id: shipCounter.next()
})

const shipFields = [
  '_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'orient', 'health',
  'name', 'score', 'accel', 'brake', 'firing', 'latched', 'fireWaitTicks',
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
      handler.addProjectile(ship, 'bullet')
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

  const moveShips = (delta, powerups) => {
    const shipList = getShips()
    const powerupList = powerups.getPowerups()
    const shipCount = shipList.length
    const powerupCount = powerupList.length
    const dist = physics.MAX_SHIP_VELOCITY + 1

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i]
      ship1.posXnew = ship1.posX + delta * ship1.velX
      ship1.posYnew = ship1.posY + delta * ship1.velY

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
          if (0 <= t && t <= delta) {
            ship1.posX = ship1.posX + t * ship1.velX
            ship1.posY = ship1.posY + t * ship1.velY
            ship2.posX = ship2.posX + t * ship2.velX
            ship2.posY = ship2.posY + t * ship2.velY
            testShipShipCollision(ship1, ship2)
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
    const damage = 0.4 * Math.sqrt(Math.hypot(dx, dy))
      / (physics.MAX_SHIP_VELOCITY / 4)
    const dmg1 = damage * (physics.hasRubbership(ship1) ? 0.5 : 1)
    const dmg2 = damage * (physics.hasRubbership(ship2) ? 0.5 : 1)

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
      if (ship2.health > 0 && 
        Math.hypot(ship2.velX, ship2.velY)
        > Math.hypot(ship1.velX, ship1.velY)) {
        ++ship2.score
      }
      handler.onShipKilledByCrash(ship1, ship2)
      killShip(ship1)
    }

    if (ship2.health <= 0) {
      if (ship1.health > 0 && 
        Math.hypot(ship1.velX, ship1.velY)
        > Math.hypot(ship2.velX, ship2.velY)) {
        ++ship1.score
      }
      handler.onShipKilledByCrash(ship2, ship1)
      killShip(ship2)
    }
  }

  const testShipShipCollision = (ship1, ship2) => {
    const [p1, p2, p3] = geom.getCollisionPoints(ship1)
    if (Math.abs(ship1.posX - ship2.posX) < 2 &&
        Math.abs(ship1.posY - ship2.posY) < 2) {
      const [q1, q2,   , q4] = geom.getShipPoints(ship2)
      if (geom.pointInTriangle(q1, q2, q4, p1)
        || geom.pointInTriangle(q1, q2, q4, p2)
        || geom.pointInTriangle(q1, q2, q4, p3)) {
        handleShipShipCollision(ship1, ship2)
      }
    }
  }

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY)
    const playerAngle = Math.atan2(ship.velX, ship.velY)
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY)
    const diffAngle = playerAngle - planetAngle + Math.PI
    const col_mul = geom.getPlanetAngleMultiplier(ship.orient, playerAngle)
    const col_vel = (physics.MAX_SHIP_VELOCITY / 1.5) * col_mul
    let damage = v / col_vel * ship.planetDamageMul 
      * (physics.hasRubbership(ship) ? 0 : 1)

    if (!ship.accel 
      && v > 0 
      && v < physics.LATCH_VELOCITY * (ship.brake !== null ? 1.5 : 1)) {
      latchToPlanet(ship, planet)
      return
    }

    const dist = Math.hypot(ship.posX - planet.x, ship.posY - planet.y)
    if (dist < (planet.radius - 1.5)) {
      ship.posX = planet.x + (ship.posX - planet.x) / ((planet.radius + 2) / dist)
      ship.posY = planet.y + (ship.posY - planet.y) / ((planet.radius + 2) / dist)
    }

    if (col_mul < 1.2 && ship.accel !== null) {
      damage *= 0.2
    }

    if (damage > 0.05) {
      ship.health -= damage * ship.healthMul
    }

    if (ship.health <= 0) {
      handler.onShipKilledByPlanet(ship)
      killShip(ship)
      return
    }

    ship.velX = v * Math.sin(diffAngle)
    ship.velY = v * Math.cos(diffAngle)
    ship.posX += (v / 8) * (ship.posX - planet.x)
    ship.posY += (v / 8) * (ship.posY - planet.y)

    if (!physics.hasRubbership(ship) && damage < 0.4 && col_mul < 1.7) {
      latchToPlanet(ship, planet)
    }
  }

  const findShipPlanetCollisions = () => {
    getShips().forEach(ship => {
      const planets = physics.getPlanets(ship.posX, ship.posY)
      for (const planet of planets)  {
        const search = planet.radius + 1.35
        if (Math.abs(ship.posX - planet.x) < search 
          && Math.abs(ship.posY - planet.y) < search) {
          if (Math.hypot(ship.posX - planet.x, ship.posY - planet.y) 
            < search) {
            if (!ship.dead) {
              handleShipPlanetCollision(ship, planet)
            }
            break
          }
        }
      }
    })
  }

  const deleteShip = (ship) => {
    ship.dead = true
    removeShipById(ship._id)
  }

  const killShip = (ship) => {
    deleteShip(ship)
    handler.onShipKilled(ship)
  }

  return {
    getShips,
    getShipById,
    getShipCount,
    removeShipById,
    newPlayerShip,
    moveShips,
    killShip,
    deleteShip,
    findShipPlanetCollisions,
    shipAcceleration
  }
}

module.exports = {
  system: shipSystemFactory,
  fields: shipFields,
}
