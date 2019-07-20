const PSON = require('pson')
const serial = require('./utils/serial')(PSON)
const geom = require('./utils/geom')
const chron = require('./utils/chron')
const physics = require('./physics')
const NS_PER_TICK = BigInt(1000 ** 3) / BigInt(physics.TICKS_PER_SECOND)
const Counter = require('./utils/counter')
const shipCounter = new Counter()
const bulletCounter = new Counter()
const powerupCounter = new Counter()

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

const newBullet = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0,                    // distance taken
  shooter: null,
  shooterName: '',
  isHit: false,
  canPickUp: true,
  type: 'bullet',
  damage: 1,

  dead: false,
  _id: bulletCounter.next()
})

const newPowerup = () => ({
  posX: 0, posY: 0,           // position X, Y
  despawn: chron.timeMs() + 15000,
  pickupRadius: 3.5,
  pickupDist: 100,
  pickupPlayer: null,
  
  dead: false,
  _id: powerupCounter.next()
})

const gameFactory = (wss) => {
  let ships = {}
  let bullets = {}
  let powerups = {}
  let lastTick = null
  let lastSocket = {}
  let leaderboard = []
  let nearbyBullets = {}
  let rubberbandRadius = 150
  let rubberbandRadiusGoal = 150
  let nextPowerup = null

  const announce = (obj) => {
    wss.clients.forEach((ws) => {
      serial.send(ws, obj)
    })
  }

  const newPlayer = () => {
    const ship = newShip()
    const existing = Object.keys(ships).length
    rubberbandRadiusGoal = physics.getRubberbandRadius(existing)
    if (existing == 0) {
      physics.newPlanetSeed()
      rubberbandRadius = rubberbandRadiusGoal
    }

    spawn(ship)
    ships[ship._id] = ship
    return ship
  }
  
  const welcome = (ship, ws) => {
    serial.send(ws, serial.e_data(ship, 
      [], 
      Object.values(bullets).filter(bullet => bullet.type === 'mine'), 
      Object.keys(ships).length, 
      rubberbandRadius, 
      physics.getPlanetSeed()))
    serial.send(ws, serial.e_board(leaderboard))
    ship
  }

  const randomSign = () => {
    return 2 * ((2 * Math.random()) | 0) - 1
  }

  const spawnLone = (ship) => {
    const sphere = Math.min(rubberbandRadius, rubberbandRadiusGoal)
    let baseX = physics.VIEW_DISTANCE * randomSign() * Math.random()
    let baseY = physics.VIEW_DISTANCE * randomSign() * Math.random()
    
    let planets = physics.getPlanets(baseX, baseY)
    planets = planets.filter(planet =>
      Math.hypot(planet.x, planet.y) < sphere - planet.radius)
    if (planets.length < 1) {
      ship.posX = baseX
      ship.posY = baseY
      ship.orient = 0
      return
    }

    const planet = planets[0 | (planets.length * Math.random())]
    latchPlanetWithAngle(ship, planet, Math.random() * 2 * Math.PI)
  }

  const spawn = (ship) => {
    const playerKeys = Object.keys(ships)
    const playerCount = playerKeys.length
    const sphere = Math.min(rubberbandRadius, rubberbandRadiusGoal)
    let baseX = 0
    let baseY = 0
    if (playerCount < 1) {
      return spawnLone(ship)
    }

    let tries = 64
    
    while (--tries > 0) {
      const randShip = ships[playerKeys[(playerCount * Math.random()) | 0]]
      baseX = randShip.posX
      baseY = randShip.posY
      baseX += physics.VIEW_DISTANCE * randomSign()
      baseY += physics.VIEW_DISTANCE * randomSign()
      if (Math.hypot(baseX, baseY) < sphere - physics.PLANET_CHUNK_SIZE / 8) {
        break
      }
      if (tries < 8) {
        if (Math.hypot(baseX, baseY) < sphere) {
          break
        }
      }
    }

    let planets = physics.getPlanets(baseX, baseY)
    planets = planets.filter(planet =>
      Math.hypot(planet.x, planet.y) < sphere - (planet.radius - 3))
    if (planets.length < 1) {
      ship.posX = baseX + physics.VIEW_DISTANCE * randomSign()
      ship.posY = baseY + physics.VIEW_DISTANCE * randomSign()
      ship.orient = 0
      return
    }
    
    planets.forEach(planet => {
      planet.playerDist = Math.min.call(null, 
        Object.values(ships).map(ship => 
          Math.hypot(ship.posX - planet.x, ship.posY - planet.y)))
      planet.bulletDist = Math.min.call(null, 
        Object.values(bullets).map(bullet => 
          Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y)))
    })

    const ideal = planets.find(planet => 
      planet.playerDist > physics.VIEW_DISTANCE 
      && planet.bulletDist > physics.MAX_BULLET_DISTANCE)

    if (ideal) {
      latchPlanetWithAngle(ship, ideal, Math.random() * 2 * Math.PI)
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
        Object.values(ships).map(ship => 
          Math.hypot(ship.posX - x, ship.posY - y)))
        + Math.min.call(null, 
          Object.values(bullets).map(bullet => 
            Math.hypot(bullet.posX - x, bullet.posY - y)))
      if (minimalScore < score) {
        minimalScore = score
        angle = testAngle
      }
    }

    latchPlanetWithAngle(ship, mostIdeal, angle)
  }

  const updateLeaderboard = () => {
    const players = Object.values(ships)
      .filter(ship => ship.score > 0)
      .map(ship => [ship.name, ship.score])
    players.sort((a, b) => b[1] - a[1])
    leaderboard = players.slice(0, 10)
    announce(serial.e_board(leaderboard))
  }

  const getShipFromId = (id) => {
    return ships[id]
  }

  const leavePlayer = (ship) => {
    deleteShip(ship)
    rubberbandRadiusGoal = physics.getRubberbandRadius(Object.keys(ships).length)
  }

  const moveShips = (mul) => {
    const shipList = Object.values(ships)
    const powerupList = Object.values(powerups)
    const shipCount = shipList.length
    const powerupCount = powerupList.length
    const dist = physics.MAX_SHIP_VELOCITY + 1

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i]
      ship1.posXnew = ship1.posX + mul * ship1.velX
      ship1.posYnew = ship1.posY + mul * ship1.velY

      for (let j = 0; j < powerupCount; ++j) {
        const pup = powerupList[j]
        if (Math.abs(ship1.posX - pup.posX) < 3
          && Math.abs(ship1.posY - pup.posY) < 3) {
          const t = geom.lineIntersectCircleFirstDepth(
            [ship1.posX, ship1.posY],
            [ship1.posXnew, ship1.posYnew],
            pup.posX, pup.posY, pup.pickupRadius)
          if (0 <= t && t <= 1) {
            if (pup.pickupDist > t) {
              powerups[pup._id].pickupDist = t
              powerups[pup._id].pickupPlayer = ship1._id
            }
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
          if (0 <= t && t <= mul) {
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

  const moveBullets = (mul) => {
    const shipList = Object.values(ships)
    const powerupList = Object.values(powerups)
    const bulletList = Object.values(bullets)
    const shipCount = shipList.length
    const powerupCount = powerupList.length
    const bulletCount = bulletList.length

    for (let i = 0; i < bulletCount; ++i) {
      const bullet = bulletList[i]
      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        killBullet(bullet)
        return
      }

      if (bullet.type == 'bullet' || bullet.type == 'laser') {
        physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))

        const newX = bullet.posX + mul * bullet.velX
        const newY = bullet.posY + mul * bullet.velY

        let collisionShip = null
        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j]
          if (ship._id !== bullet.shooter
            && Math.abs(ship.posX - bullet.posX) < bullet.velocity
            && Math.abs(ship.posY - bullet.posY) < bullet.velocity) {
            const [p1, p2, p3] = geom.getCollisionPoints(ship)
            if (geom.lineIntersectsTriangle([bullet.posX, bullet.posY],
              [newX, newY], p1, p2, p3)) {
              collisionShip = ship
              break
            }
          }
        }

        if (collisionShip) {
          handleShipBulletCollision(collisionShip, bullet)
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
          handlePowerupBulletCollision(collisionPowerup, bullet)
        }
        
        const planets = physics.getPlanets(newX, newY)
        for (const planet of planets) {
          if (Math.hypot(planet.x - newX, planet.y - newY) < planet.radius) {
            killBullet(bullet)
            return
          }
        }

        bullet.posX = newX
        bullet.posY = newY
        bullet.dist += mul * bullet.velocity
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
            if (Math.abs(ship.posX - bullet.posX) > 15 ||
              Math.abs(ship.posY - bullet.posY) > 15) {
              return
            }

            let damage = 2 / Math.sqrt(Math.hypot(
              ship.posX - bullet.posX, ship.posY - bullet.posY))

            if (damage < 0.05) {
              damage = 0
            }

            const shooter = ships[bullet.shooter]
            if (shooter && shooter._id !== ship._id) {
              ship.health -= damage * ship.healthMul
              
              if (ship.health <= 0) {
                serial.send(lastSocket[ship._id], serial.e_killed(bullet.shooterName))
                if (shooter) {
                  ++shooter.score
                }
                killShip(ship)
              }
            }
          })

          announce(serial.e_minexpl(bullet))
          killBullet(bullet)
          return
        }

        bullet.dist += physics.MAX_BULLET_DISTANCE / (physics.MINE_LIFETIME * physics.TICKS_PER_SECOND)
      }
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

  const findShipPlanetCollisions = () => {
    Object.values(ships).forEach(ship => {
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

  const killShip = (ship) => {
    announce(serial.e_killship(ship))
    deleteShip(ship)
  }

  const deleteShip = (ship) => {
    ship.dead = true
    const shipId = ship._id
    delete ships[ship._id]
    
    const projList = Object.values(bullets)
    const projCount = projList.length
    for (let i = 0; i < projCount; ++i) {
      const bullet = projList[i]
      if (bullet.type === 'mine' && bullet.shooter === shipId) {
        killBullet(bullet)
      }
    }

    updateLeaderboard()
  }

  const killBullet = (bullet) => {
    bullet.dead = true
    announce(serial.e_killproj(bullet))
    delete bullets[bullet._id]
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
      serial.send(lastSocket[ship1._id], serial.e_crashed(ship2.name))
      if (ship2.health > 0 && 
        Math.hypot(ship2.velX, ship2.velY)
        > Math.hypot(ship1.velX, ship1.velY)) {
        ++ship2.score
      }
      killShip(ship1)
    } else {
      ships[ship1._id] = ship1
    }

    if (ship2.health <= 0) {
      serial.send(lastSocket[ship2._id], serial.e_crashed(ship1.name))
      if (ship1.health > 0 && 
        Math.hypot(ship1.velX, ship1.velY)
        > Math.hypot(ship2.velX, ship2.velY)) {
        ++ship1.score
      }
      killShip(ship2)
    } else {
      ships[ship2._id] = ship2
    }
  }

  const handleShipBulletCollision = (ship, bullet) => {
    if (bullet.dead) {
      return
    }
    const shooter = ships[bullet.shooter]
    ship.health -= 0.115 * ship.healthMul * bullet.damage
    if (shooter && shooter.absorber) {
      shooter.health += 0.01 * shooter.healthMul
    }
    if (ship.health <= 0) {
      serial.send(lastSocket[ship._id], serial.e_killed(bullet.shooterName))
      if (shooter) {
        ++shooter.score
      }
      killShip(ship)
    }
    if (bullet.type !== 'laser') {
      killBullet(bullet)
    }
  }

  const handlePowerupBulletCollision = (powerup, bullet) => {
    if (bullet.dead) {
      return
    }
    const shooter = ships[bullet.shooter]
    if (shooter) {
      applyPowerup(shooter, powerup)
    }
    if (bullet.type !== 'laser') {
      killBullet(bullet)
    }
  }

  const latchPlanet = (ship, planet) => {
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY) + Math.PI
    latchPlanetWithAngle(ship, planet, planetAngle)
  }

  const computePlanetPoint = (planet, angle) => {
    return [planet.x + (planet.radius + 1.4) * Math.sin(angle),
      planet.y + (planet.radius + 1.4) * Math.cos(angle)]
  }

  const latchPlanetWithAngle = (ship, planet, angle) => {
    const [x, y] = computePlanetPoint(planet, angle)
    ship.velX = 0
    ship.velY = 0
    ship.posX = x
    ship.posY = y
    ship.orient = -angle
    ship.latched = ship.accel === null
    if (lastSocket[ship._id]) {
      serial.send(lastSocket[ship._id], serial.e_orient(-angle))
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
      latchPlanet(ship, planet)
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
      serial.send(lastSocket[ship._id], serial.e_hitpl())
      killShip(ship)
      return
    }

    ship.velX = v * Math.sin(diffAngle)
    ship.velY = v * Math.cos(diffAngle)
    ship.posX += (v / 8) * (ship.posX - planet.x)
    ship.posY += (v / 8) * (ship.posY - planet.y)

    if (!physics.hasRubbership(ship) && damage < 0.4 && col_mul < 1.7) {
      latchPlanet(ship, planet)
    }
  }

  const shipAcceleration = () => {
    const now = chron.timeMs()
    const shipList = Object.values(ships)
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
        physics.rubberband(ship, rubberbandRadius)
      } else {
        ship.velX = ship.velY = 0
        if (Math.hypot(ship.posX, ship.posY) > (rubberbandRadius + 10) 
          && rubberbandRadiusGoal < rubberbandRadius) {
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

  const announceNearby = () => {
    const md = (physics.VIEW_DISTANCE + 3)
    const shipList = Object.values(ships)
    const shipCount = shipList.length
    for (let i = 0; i < shipCount; ++i) {
      const self = shipList[i]
      const nearbyShips = []
      for (let j = 0; j < shipCount; ++j) {
        const ship = shipList[j]
        if (i != j
          && Math.abs(ship.posX - self.posX) < md
          && Math.abs(ship.posY - self.posY) < md) {
          nearbyShips.push(ship)
        }
      }

      const ws = lastSocket[self._id]
      if (ws) {
        let nb = nearbyBullets[self._id] || []
        for (let j = 0; j < nb.length; ++j) {
          nb[j] = bullets[nb[j]]
        }
        serial.send(ws, serial.e_data(self, nearbyShips, nb, 
          shipCount, rubberbandRadius, physics.getPlanetSeed()))
      }
      delete nearbyBullets[self._id]
    }
  }

  const trySpawnPowerup = (playerCount) => {
    let tries = playerCount * 4
    let count = 0
    while (tries > 0) {
      const r = Math.sqrt(Math.random()) 
        * (Math.min(rubberbandRadius, rubberbandRadiusGoal) + 5)
      const theta = Math.random() * 2 * Math.PI

      const x = Math.sin(theta) * r
      const y = Math.cos(theta) * r
      
      const playerDist = Math.min.apply(null, Object.values(ships).map(
        ship => Math.hypot(ship.posX - x, ship.posY - y)
      ))
      const inPlanet = Math.min.apply(null, physics.getPlanets(x, y).map(
        planet => Math.hypot(planet.x - x, planet.y - y) - planet.radius
      )) <= 2
      const tooClose = Math.min.apply(null, Object.values(powerups).map(
        powerup => Math.hypot(powerup.x - x, powerup.y - y) - 4
      )) <= 0

      if (Math.random() < 0.2 && playerDist >= 30 && !inPlanet && !tooClose) {
        let powerup = newPowerup()
        powerup = {
          ...powerup,
          posX: x,
          posY: y
        }
        powerups[powerup._id] = powerup
        announce(serial.e_addpup(powerup))
        ++count
      }
      --tries
    }
    return count
  }

  const setNextPowerupTime = (division) => {
    const playerCount = Math.max(1, Object.keys(ships).length)
    nextPowerup = chron.timeMs() + (1000 * (10 + 18 * Math.random()) / Math.pow(playerCount, 0.125) / division)
  }

  const maybeSpawnPowerup = () => {
    const playerCount = Math.max(1, Object.keys(ships).length)
    let division = 1
    if (nextPowerup != null && chron.timeMs() >= nextPowerup) {
      division = trySpawnPowerup(playerCount) > 0 ? 1 : 8
      setNextPowerupTime(division)
    } else if (nextPowerup == null) {
      setNextPowerupTime(division)
    }
  }

  const applyPowerup = (ship, powerup) => {
    const ITEM_COUNT = 9
    const item = 0 | (ITEM_COUNT * Math.random())
    switch (item) {
    case 0:
      if (ship.item === null) {
        ship.item = 'laser'
      }
      break
    case 1:
      if (ship.item === null) {
        ship.item = 'reheal'
      }
      break
    case 2:
      if (ship.item === null) {
        ship.item = 'bomb'
      }
      break
    case 3:
      if (ship.item === null) {
        ship.item = 'mine'
      }
      break
    case 4:
      if (ship.item === null) {
        ship.item = 'orion'
      }
      break
    case 5:
      ship.rubbership = 30 * 1000
      break
    case 6:
      ship.regen = 10 * 1000
      break
    case 7:
      ship.overdrive = 10 * 1000
      break
    case 8:
      if (ship.item === null) {
        ship.item = 'spread'
      }
      break
    }
    removePowerup(powerup)
  }

  const removePowerup = (powerup) => {
    delete powerups[powerup._id]
    announce(serial.e_delpup(powerup))
  }

  const updatePowerups = () => {
    const now = chron.timeMs()
    Object.values(powerups).forEach((powerup) => {
      if (now >= powerup.despawn) {
        removePowerup(powerup)
        return
      }

      if (powerup.pickupPlayer !== null) {
        const ship = ships[powerup.pickupPlayer]
        if (ship !== null && !ship.dead) {
          applyPowerup(ship, powerup)
          return
        } else {
          powerup.pickupDist = 10000
          powerup.pickupPlayer = null
        }
      }
    })
  }

  const updateRubberband = () => {
    if (rubberbandRadiusGoal > rubberbandRadius) {
      rubberbandRadius = Math.min(rubberbandRadiusGoal, rubberbandRadius + 0.2)
    } else if (rubberbandRadiusGoal < rubberbandRadius) {
      rubberbandRadius = Math.max(rubberbandRadiusGoal, rubberbandRadius - 0.03)
    }
  }

  const oneTick = () => {
    shipAcceleration()
    maybeSpawnPowerup()
    findShipPlanetCollisions()

    moveBullets(1)
    moveShips(1)
    updatePowerups()

    updateRubberband()
    announceNearby()
  }

  const deltaTick = () => {
    const timeNow = process.hrtime.bigint()

    if (lastTick === null) {
      lastTick = timeNow
    } else {
      while (timeNow - lastTick > NS_PER_TICK) {
        oneTick()
        lastTick += NS_PER_TICK
      }
    }
  }

  const setLastSocket = (ship, ws) => {
    lastSocket[ship._id] = ws
  }

  const disconnectSocket = (ws) => {
    Object.keys(ships)
      .filter(shipId => lastSocket[shipId] === ws)
      .forEach(shipId => {
        delete lastSocket[shipId]
        deleteShip({ _id: shipId })
      })
  }
  
  const addProjectile = (ship, type, extras) => {
    const filt = physics.MAX_BULLET_DISTANCE + physics.VIEW_DISTANCE * 2
    const [p1, , , ] = geom.getShipPoints(ship)
    const { 
      extraDist, 
      orientOffset, 
      speedFactor,
      damageFactor, 
      rangeSub,
      canPickUp } = { 
      extraDist: 0,
      orientOffset: 0,
      speedFactor: 1,
      damageFactor: 1,
      rangeSub: 0,
      canPickUp: true,
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
      velocity: physics.BULLET_VELOCITY * ship.bulletSpeedMul * speedFactor,
      velX: typeSpeedMul * physics.BULLET_VELOCITY * Math.sin(-ship.orient + orientOffset) * ship.bulletSpeedMul,
      velY: typeSpeedMul * physics.BULLET_VELOCITY * Math.cos(-ship.orient + orientOffset) * ship.bulletSpeedMul,
      dist: rangeSub,
      damage: damageFactor,
      canPickUp: canPickUp,
      shooter: ship._id,
      shooterName: ship.name
    }
    bullets[bullet._id] = bullet

    for (const shipId in ships) {
      const ship = ships[shipId]
      if (Math.abs(bullet.posX - ship.posX) < filt
        && Math.abs(bullet.posY - ship.posY) < filt) {
        if (!nearbyBullets.hasOwnProperty(ship._id)) {
          nearbyBullets[ship._id] = []
        }
        nearbyBullets[ship._id].push(bullet._id)
      }
    }
  }

  const doFire = (ship) => {
    if (!ship || ship.dead !== false) {
      return false
    }

    if (ship.fireWaitTicks <= 0) {
      addProjectile(ship, 'bullet')
      ship.fireWaitTicks = ship.firingInterval
      return true
    }
    return false
  }

  const handleControl = (ship, angle, accel, brake, firing) => {
    if (!ship || ship.dead !== false) {
      return
    }

    if (!isFinite(angle)) {
      return
    }

    const now = chron.timeMs()
    if (ship.orient != angle && ship.accel !== null) {
      if (ship.highAgility) {
        ship.accel = now / 16 + ship.accel * 15 / 16
      } else {
        ship.accel = now
      }
    }
    if (!ship.latched) {
      ship.orient = angle
    }
    
    if (accel && ship.accel === null) {
      ship.accel = now
      ship.latched = false
    } else if (!accel && ship.accel !== null) {
      ship.accel = null
    }
    if (brake && ship.brake === null) {
      ship.brake = now
    } else if (!brake && ship.brake !== null) {
      ship.brake = null
    }

    ship.firing = firing
  }

  const applyPerk = (ship, perk) => {
    switch (perk) {
    case 'fastershots': {
      ship.bulletSpeedMul = 1.2
      break
    }
    case 'fasterrate': {
      ship.firingInterval = 3
      break
    }
    case 'healthboost': {
      ship.healthMul = 0.75
      break
    }
    case 'movespeed': {
      ship.highAgility = true
      ship.speedMul = 0.9
      break
    }
    case 'planetbouncer': {
      ship.planetDamageMul = 0.5
      break
    }
    case 'regen': {
      ship.absorber = true
      break
    }
    case 'fastheal': {
      ship.healRate = 1.5 
      break
    }
    }
  }

  const handleUseItem = (ship) => {
    switch (ship.item) {
    case 'laser':
      ship.item = null
      addProjectile(ship, 'laser', { speedFactor: 2.5, damageFactor: 4 })
      break
    case 'reheal':
      ship.item = null
      ship.health = 1
      break
    case 'bomb':
      ship.item = null
      for (let i = 0; i < 12; ++i) {
        addProjectile(ship, 'bullet', { canPickUp: false, orientOffset: i * Math.PI / 6, damageFactor: 2 })
      }
      break
    case 'mine':
      if (!ship.latched) {
        ship.item = null
        addProjectile(ship, 'mine', { extraDist: -2 })
      }
      break
    case 'spread':
      ship.item = null
      for (let i = -2; i <= 2; ++i) {
        addProjectile(ship, 'bullet', { extraDist: 0, orientOffset: i * 0.29 - 0.05, damageFactor: 0.5, rangeSub: 15 })
        addProjectile(ship, 'bullet', { extraDist: 0.5, orientOffset: i * 0.29 + 0.05, damageFactor: 0.5, rangeSub: 15 })
      }
      break
    case 'orion':
      ship.item = null
      for (let i = 0; i < 5; ++i) {
        physics.accel(ship, 5000)
      }
      for (let i = -3; i <= 3; ++i) {
        addProjectile(ship, 'bullet', { extraDist: 0, orientOffset: Math.PI + i * 0.15 - 0.05, damageFactor: 0.75, rangeSub: 25 })
        addProjectile(ship, 'bullet', { extraDist: 0.5, orientOffset: Math.PI + i * 0.15 + 0.05, damageFactor: 0.75, rangeSub: 25 })
      }
      break
    }
  }

  const handleNick = (ship, nick, perk) => {
    if (!ship || ship.dead !== false) {
      return
    }
    
    nick = nick.slice(0, 20).trim()
    if (!ship.name) {
      if (!nick) {
        nick = 'null'
      }
      ship.name = nick
      console.log(`joined player ${nick}`)

      // perk
      applyPerk(ship, perk)
    }
  }

  return { 
    newPlayer, 
    welcome,
    leavePlayer,
    getShipFromId, 
    deltaTick,
    setLastSocket,
    disconnectSocket,
    handleControl,
    handleUseItem,
    handleNick
  }
}

module.exports = gameFactory
