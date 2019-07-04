const modelShip = require('./models/ship')
const modelBullet = require('./models/bullet')
const geom = require('./utils/geom')
const chron = require('./utils/chron')
const physics = require('./physics')
const NS_PER_TICK = BigInt(1000 ** 3) / BigInt(physics.TICKS_PER_SECOND)

const gameFactory = (wss) => {
  let lastTick = null
  let lastSocket = {}

  const newPlayer = async () => {
    const ship = await modelShip.create()
    spawn(ship)
    return ship
  }

  const spawn = async (ship) => {
    // eventually on planets a short but sufficient distance away
    // from other players
    ship.posX = 0
    ship.posY = 0
    ship.orient = 0
  }

  const getShipFromId = async (id) => {
    return await modelShip.getOne({ _id: id })
  }

  const announce = async (message) => {
    wss.clients.forEach((ws) => {
      ws.send(message)
    })
  }

  const moveShips = async (mul, ships) => {
    for (const ship of ships) {
      ship.posX += mul * ship.velX
      ship.posY += mul * ship.velY
      physics.inertia(ship)
      await modelShip.put(ship)
    }
  }

  const moveBullets = async (mul, bullets) => {
    for (const bullet of bullets) {
      bullet.posX += mul * bullet.velX
      bullet.posY += mul * bullet.velY
      bullet.dist += mul * physics.BULLET_VELOCITY
      await modelBullet.put(bullet)
    }
  }

  const removeDistantBullets = async (bullets) => {
    for (const bullet of bullets) {
      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        killBullet(bullet)
      }
    }
  }

  const findShipShipCollisions = async (ships, collision) => {
    const collisions = []

    for (const ship1 of ships) {
      for (const ship2 of ships) {
        if (ship1._id == ship2._id) {
          continue
        }
        
        if (Math.abs(ship1.posX - ship2.posX) < 3 &&
            Math.abs(ship1.posY - ship2.posY) < 3) {
          const [p1, p2, p3, p4] = geom.getShipPoints(ship1)
          const [q1, q2,   , q4] = geom.getShipPoints(ship2)
          // triangle checks
          const t1 = geom.pointInTriangle(p1, p2, p4, q1)
          const t2 = geom.pointInTriangle(p1, p2, p4, q2)
          const t3 = geom.pointInTriangle(p3, p2, p4, q1)
          const t4 = geom.pointInTriangle(p1, p2, p4, q4)
          if ((t1 && !t3) || t2 || t4) {
            collisions.push([ship1, ship2])
          }
        }
      }
    }

    for (const [ship1, ship2] of collisions) { 
      if (!ship1.dead && !ship2.dead) {
        await collision(ship1, ship2)
      }
    }
  }

  const findShipBulletCollisions = async (ships, bullets, collision) => {
    const collisions = []
    
    for (const bullet of bullets) {
      for (const ship of ships) {
        // 1 unit = ship length from "head" to "tail"
        if (bullet.shooter != ship._id &&
            Math.abs(ship.posX - bullet.posX) < 3 &&
            Math.abs(ship.posY - bullet.posY) < 3) {
          const [p1, p2, p3, p4] = geom.getShipPoints(ship)
          // triangle checks
          const t1 = geom.pointInTriangle(p1, p2, p4, [ship.posX, ship.posY])
          const t2 = geom.pointInTriangle(p3, p2, p4, [ship.posX, ship.posY])
          if (t1 && !t2) {
            collisions.push([ship, bullet])
            break // one collision per bullet at most
          }
        }
      }
    }

    for (const [ship, bullet] of collisions) { 
      if (!ship.dead && !bullet.dead) {
        await collision(ship, bullet)
      }
    }
  }

  const findShipPlanetCollisions = async (ships, planets, collision) => {
    ships, planets, collision /// TODO
  }

  const getPlanets = async () => {
    return [] /// TODO
  }

  const killShip = async (ship) => {
    announce(`kill_ship ${ship._id}`)
    await deleteShip(ship)
  }

  const deleteShip = async (ship) => {
    ship.dead = true
    await modelShip.remove(ship)
  }

  const killBullet = async (bullet) => {
    bullet.dead = true
    announce(`remove_bullet ${bullet._id}`)
    await modelBullet.remove(bullet)
  }

  const handleShipShipCollision = async (ship1, ship2) => {
    const dx = ship1.velX - ship2.velX
    const dy = ship1.velY - ship2.velY
    if (Math.hypot(dx, dy) > (physics.MAX_SHIP_VELOCITY / 4)) {
      await killShip(ship1)
      await killShip(ship2)
    } else {
      // elastic collision
      [ship1.velX, ship2.velX] = [ship2.velX, ship1.velX];
      [ship1.velY, ship2.velY] = [ship2.velY, ship1.velY]
    }
  }

  const handleShipBulletCollision = async (ship, bullet) => {
    await killShip(ship)
    await killBullet(bullet)
  }

  const handleShipPlanetCollision = async (ship, planet) => {
    if (Math.hypot(ship.velX, ship.velY) > (physics.MAX_SHIP_VELOCITY / 4)) {
      await killShip(ship)
    } else {
      // collision
      const dx = ship.posX - planet.posX
      const dy = ship.posY - planet.posY
      dx, dy /// TODO: reflect velocity over normal of (dx, dy)
    }
  }

  const shipAcceleration = async () => {
    const now = chron.timeMs()
    const ships = await modelShip.getAll()
    for (const ship of ships) {
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
        await modelShip.put(ship)
      } else if (doBrake) {
        physics.brake(ship)
        await modelShip.put(ship)
      }
    }
  }

  const announceNearby = async () => {
    const md = (physics.MAX_BULLET_DISTANCE + 2)
    const ships = await modelShip.getAll()
    const bullets = await modelBullet.getAll()
    for (const self of ships) {
      const nearbyShips = []
      const nearbyBullets = []

      for (const ship of ships) {
        if (self._id !== ship._id &&
            Math.abs(self.posX - ship.posX) < md &&
            Math.abs(self.posY - ship.posY) < md) {
          nearbyShips.push(modelShip.makePublic(ship))
        }
      }
      
      for (const bullet of bullets) {
        if (Math.abs(self.posX - bullet.posX) < md &&
            Math.abs(self.posY - bullet.posY) < md) {
          nearbyBullets.push(modelBullet.makePublic(bullet))
        }
      }

      const ws = lastSocket[self._id]
      if (ws) {
        ws.send(`you ${JSON.stringify(self)}`)
        ws.send(`nearby ${JSON.stringify([nearbyShips, nearbyBullets])}`)
      }
    }
  }

  const oneTick = async () => {
    await shipAcceleration()
    
    for (let i = 0; i < 2; ++i) {
      const ships = await modelShip.getAll()
      const bullets = await modelBullet.getAll()
      const planets = getPlanets()

      await moveShips(.5, ships)
      await moveBullets(.5, bullets)
      await removeDistantBullets(bullets)
      await findShipShipCollisions(ships, handleShipShipCollision)
      await findShipBulletCollisions(ships, bullets, handleShipBulletCollision)
      await findShipPlanetCollisions(ships, planets, handleShipPlanetCollision)
    }

    await announceNearby()
  }

  const deltaTick = async () => {
    const timeNow = process.hrtime.bigint()

    if (lastTick === null) {
      lastTick = timeNow
    } else {
      while (timeNow - lastTick > NS_PER_TICK) {
        await oneTick()
        lastTick += NS_PER_TICK
      }
    }
  }

  const setLastSocket = async (ship, ws) => {
    lastSocket[ship._id] = ws
  }

  const disconnectSocket = async (ws) => {
    const removing = []
    for (const shipId of Object.keys(lastSocket)) {
      if (lastSocket[shipId] === ws) {
        removing.push(shipId)
      }
    }
    for (const shipId of removing) {
      delete lastSocket[shipId]
      deleteShip({ _id: shipId })
    }
  }

  const handleAccelOn = async (ship) => {
    ship.accel = chron.timeMs()
    await modelShip.put(ship)
  }

  const handleAccelOff = async (ship) => {
    ship.accel = null
    await modelShip.put(ship)
  }

  const handleBrakeOn = async (ship) => {
    ship.brake = chron.timeMs()
    await modelShip.put(ship)
  }

  const handleBrakeOff = async (ship) => {
    ship.brake = null
    await modelShip.put(ship)
  }

  const handleFire = async (ship) => {
    const now = chron.timeMs()
    if ((now - ship.lastFired) >= physics.DELAY_BETWEEN_BULLETS_MS) {
      const [p1, , , ] = geom.getShipPoints(ship)

      const bullet = await modelBullet.create(ship, {
        posX: p1[0],
        posY: p1[1],
        velX: physics.BULLET_VELOCITY * Math.sin(ship.orient),
        velY: physics.BULLET_VELOCITY * -Math.cos(ship.orient),
        dist: 0
      })

      ship.lastFired = now
      await modelShip.put(ship)
    }
  }

  const handleTurn = async (ship, angle) => {
    ship.orient = angle
    if (ship.accel !== null) {
      ship.accel = chron.timeMs()
    }
    await modelShip.put(ship)
  }

  return { 
    newPlayer, 
    getShipFromId, 
    deltaTick,
    setLastSocket,
    disconnectSocket,
    handleAccelOn,
    handleAccelOff,
    handleBrakeOn,
    handleBrakeOff,
    handleFire,
    handleTurn
  }
}

module.exports = gameFactory
