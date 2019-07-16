const geom = require('./utils/geom')
const chron = require('./utils/chron')
const physics = require('./physics')
const NS_PER_TICK = BigInt(1000 ** 3) / BigInt(physics.TICKS_PER_SECOND)
const Counter = require('./utils/counter')
const shipCounter = new Counter()
const bulletCounter = new Counter()

const newShip = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  orient: 0,                  // radians, clockwise from 0 = up

  name: '',
  score: 0,
  accel: null,
  brake: null,
  lastFired: 0,

  dead: false,
  _id: shipCounter.next()
})

const newBullet = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0,                    // distance taken
  shooter: null,

  dead: false,
  _id: bulletCounter.next()
})

const makeShipPublic = (ship) => {
  const newShip = { ...ship }
  delete newShip.lastFired
  delete newShip.dead
  return newShip
}

const makeBulletPublic = (bullet) => {
  const newBullet = { ...bullet }
  delete newBullet.dist
  delete newBullet.dead
  return newBullet
}

const gameFactory = (wss) => {
  let ships = {}
  let bullets = {}
  let lastTick = null
  let lastSocket = {}
  let leaderboard = []
  let rubberbandRadius = 150
  let rubberbandRadiusGoal = 150

  const announce = (message) => {
    wss.clients.forEach((ws) => {
      ws.send(message)
    })
  }

  const newPlayer = () => {
    const ship = newShip()
    spawn(ship)
    ships[ship._id] = ship
    rubberbandRadiusGoal = physics.getRubberbandRadius(Object.keys(ships).length)
    return ship
  }
  
  const welcome = (ship, ws) => {
    ws.send(`leaderboard ${JSON.stringify(leaderboard)}`)
    ship
  }

  const randomSign = () => {
    return 2 * ((2 * Math.random()) | 0) - 1
  }

  const isValidSpawn = (ship) => {
    const d = Math.hypot(ship.posX, ship.posY)
    const min = physics.MAX_BULLET_DISTANCE * 3 / 2
    if (d > Math.min(rubberbandRadius, rubberbandRadiusGoal)) {
      return false
    }

    for (const otherId of Object.keys(ships)) {
      const other = ships[otherId]
      if (Math.hypot(ship.posX - other.posX, ship.posY - other.posY) < min) {
        return false
      }
    }

    return true
  }

  const spawn = (ship) => {
    let baseX = 0
    let baseY = 0
    let tries = 32
    while (tries > 0) {
      if (ships.length) {
        const randShip = ships[(ships.length * Math.random()) | 0]
        baseX = randShip.posX
        baseY = randShip.posY
      }
      baseX += physics.MAX_BULLET_DISTANCE * randomSign()
      baseY += physics.MAX_BULLET_DISTANCE * randomSign()
      const planets = physics.getPlanets(baseX, baseY)
      if (planets.length) {
        const planet = planets[(planets.length * Math.random()) | 0]
        latchPlanetWithAngle(ship, planet, Math.random() * 2 * Math.PI)
      } else {
        ship.posX = baseX
        ship.posY = baseY
        ship.orient = 0
      }
      --tries
      if (isValidSpawn(ship)) {
        break
      }
    }
  }

  const updateLeaderboard = () => {
    const players = []
    for (const shipId of Object.keys(ships)) {
      const ship = ships[shipId]
      if (ship.score > 0) {
        players.push([ship.name, ship.score])
      }
    }
    players.sort((a, b) => a[1] - b[1])
    leaderboard = players.slice(0, 10)
    announce(`leaderboard ${JSON.stringify(leaderboard)}`)
  }

  const getShipFromId = (id) => {
    return ships[id]
  }

  const leavePlayer = (ship) => {
    deleteShip(ship)
    updateLeaderboard()
    rubberbandRadiusGoal = physics.getRubberbandRadius(Object.keys(ships).length)
  }

  const moveShips = (mul) => {
    for (const id of Object.keys(ships)) {
      const ship = ships[id]
      ship.posX += mul * ship.velX
      ship.posY += mul * ship.velY
      ships[id] = ship
    }
  }

  const checkBulletCollision = (shipIds, bullet) => {
    const planets = physics.getPlanets(bullet.posX, bullet.posY)
    for (const shipId of shipIds) {
      const ship = ships[shipId]
      // 1 unit = ship length from "head" to "tail"
      if (ship && !ship.dead && bullet.shooter !== ship._id &&
          Math.abs(ship.posX - bullet.posX) < 4 &&
          Math.abs(ship.posY - bullet.posY) < 4) {
        const [p1, p2, p3] = geom.getCollisionPoints(ship)
        const d1 = Math.hypot(p1[0] - bullet.posX, p1[1] - bullet.posY)
        const d2 = Math.hypot(p2[0] - bullet.posX, p2[1] - bullet.posY)
        const d3 = Math.hypot(p3[0] - bullet.posX, p3[1] - bullet.posY)

        // triangle checks
        if (d1 < 1.2 || d2 < 0.6 || d3 < 0.6) {
          handleShipBulletCollision(ship, bullet)
          break // one collision per bullet at most
        }
      }
    }
    for (const planet of planets) {
      if (Math.hypot(planet.x - bullet.posX, planet.y - bullet.posY) < 
        planet.radius) {
        killBullet(bullet)
        return
      }
    }
  }

  const moveBullets = (mul) => {
    const shipIds = Object.keys(ships)
    for (const id of Object.keys(bullets)) {
      const bullet = bullets[id]

      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        killBullet(bullet)
        continue
      }

      physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))

      bullet.posX += mul / 4 * bullet.velX
      bullet.posY += mul / 4 * bullet.velY

      checkBulletCollision(shipIds, bullet)

      bullet.posX += mul / 4 * bullet.velX
      bullet.posY += mul / 4 * bullet.velY

      checkBulletCollision(shipIds, bullet)

      bullet.posX += mul / 4 * bullet.velX
      bullet.posY += mul / 4 * bullet.velY

      checkBulletCollision(shipIds, bullet)

      bullet.posX += mul / 2 * bullet.velX
      bullet.posY += mul / 2 * bullet.velY
      bullet.dist += mul * physics.BULLET_VELOCITY
      bullets[id] = bullet

      checkBulletCollision(shipIds, bullet)
    }
  }

  const findShipShipCollisions = () => {
    const shipIds = Object.keys(ships)
    const collisions = []

    for (const shipId1 of shipIds) {
      const ship1 = ships[shipId1]
      const [p1, p2, p3] = geom.getCollisionPoints(ship1)
      for (const shipId2 of shipIds) {
        if (shipId1 == shipId2) {
          continue
        }
        const ship2 = ships[shipId2]
        
        if (Math.abs(ship1.posX - ship2.posX) < 2 &&
            Math.abs(ship1.posY - ship2.posY) < 2) {
          const [q1, q2,   , q4] = geom.getRealShipPoints(ship2)
          if (geom.pointInTriangle(q1, q2, q4, p1)
            || geom.pointInTriangle(q1, q2, q4, p2)
            || geom.pointInTriangle(q1, q2, q4, p3)) {
            collisions.push([ship1, ship2])
          }
        } 
      }
    }

    for (const [ship1, ship2] of collisions) { 
      if (!ship1.dead && !ship2.dead) {
        handleShipShipCollision(ship1, ship2)
      }
    }
  }

  const findShipPlanetCollisions = () => {
    const shipIds = Object.keys(ships)
    const collisions = []

    for (const shipId of shipIds) {
      const ship = ships[shipId]
      const planets = physics.getPlanets(ship.posX, ship.posY)
      for (const planet of planets)  {
        if (Math.hypot(ship.posX - planet.x, ship.posY - planet.y) <
          (planet.radius + 1)) {
          collisions.push([ship, planet])
          break
        }
      }
    }
    
    for (const [ship, planet] of collisions) { 
      if (!ship.dead) {
        handleShipPlanetCollision(ship, planet)
      }
    }
  }

  const killShip = (ship) => {
    announce(`kill_ship ${ship._id}`)
    deleteShip(ship)
    updateLeaderboard()
  }

  const deleteShip = (ship) => {
    ship.dead = true
    delete ships[ship._id]
  }

  const killBullet = (bullet) => {
    bullet.dead = true
    announce(`remove_bullet ${bullet._id}`)
    delete bullets[bullet._id]
  }

  const handleShipShipCollision = (ship1, ship2) => {
    const dx = ship1.velX - ship2.velX
    const dy = ship1.velY - ship2.velY
    if (Math.hypot(dx, dy) > (physics.MAX_SHIP_VELOCITY / 4)) {
      lastSocket[ship1._id].send(`defeated_collision ${ship2.name}`)
      lastSocket[ship2._id].send(`defeated_collision ${ship1.name}`)
      killShip(ship1)
      killShip(ship2)
    } else {
      // elastic collision
      [ship1.velX, ship2.velX] = [ship2.velX, ship1.velX];
      [ship1.velY, ship2.velY] = [ship2.velY, ship1.velY]
    }
  }

  const handleShipBulletCollision = (ship, bullet) => {
    const shooter = ships[bullet.shooter]
    if (shooter) {
      lastSocket[ship._id].send(`defeated ${shooter.name}`)
      ++shooter.score
      ships[bullet.shooter] = shooter
    }
    killShip(ship)
    killBullet(bullet)
  }

  const latchPlanet = (ship, planet) => {
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY) + Math.PI
    latchPlanetWithAngle(ship, planet, planetAngle)
  }

  const latchPlanetWithAngle = (ship, planet, angle) => {
    ship.velX = 0
    ship.velY = 0
    ship.posX = planet.x + (planet.radius + 1.125) * Math.sin(angle)
    ship.posY = planet.y + (planet.radius + 1.125) * Math.cos(angle)
    ship.orient = -angle
    if (lastSocket[ship._id]) {
      lastSocket[ship._id].send(`set_orient ${-angle}`)
    }
  }

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY)
    if (v > (physics.MAX_SHIP_VELOCITY / 3)) {
      lastSocket[ship._id].send('defeated_planet')
      killShip(ship)
    } else if (!ship.accel && v > 0 && v < physics.LATCH_VELOCITY) {
      latchPlanet(ship, planet)
    } else {
      // slow collision
      const playerAngle = Math.atan2(ship.velX, ship.velY)
      const planetAngle = Math.atan2(planet.x - ship.posX,
        planet.y - ship.posY)
      const diffAngle = playerAngle - planetAngle + Math.PI
      ship.velX = v * Math.sin(diffAngle) * 0.9
      ship.velY = v * Math.cos(diffAngle) * 0.9
      ships[ship._id] = ship
      ship.posX += (v / 8) * (ship.posX - planet.x)
      ship.posY += (v / 8) * (ship.posY - planet.y)
    }
  }

  const shipAccelerationOne = (now, ship) => {
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
    } else if (doBrake) {
      physics.brake(ship)
    }
    physics.inertia(ship)
    physics.rubberband(ship, rubberbandRadius)
    ships[ship._id] = ship
    
    physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
  }

  const shipAcceleration = () => {
    const now = chron.timeMs()
    for (var id of Object.keys(ships)) {
      shipAccelerationOne(now, ships[id])
    }
  }

  const announceNearby = () => {
    const shipIds = Object.keys(ships)
    const bulletIds = Object.keys(bullets)
    const md = (physics.MAX_BULLET_DISTANCE + 2)
    for (const selfId of shipIds) {
      const self = ships[selfId]
      const nearbyShips = []
      const nearbyBullets = []

      for (const shipId of shipIds) {
        const ship = ships[shipId]
        if (selfId !== shipId &&
            Math.abs(self.posX - ship.posX) < md &&
            Math.abs(self.posY - ship.posY) < md) {
          nearbyShips.push(makeShipPublic(ship))
        }
      }
      
      for (const bulletId of bulletIds) {
        const bullet = bullets[bulletId]
        if (Math.abs(self.posX - bullet.posX) < md &&
            Math.abs(self.posY - bullet.posY) < md) {
          nearbyBullets.push(makeBulletPublic(bullet))
        }
      }

      const ws = lastSocket[self._id]
      if (ws) {
        ws.send(`you ${JSON.stringify(self)}`)
        ws.send(`nearby ${JSON.stringify([nearbyShips, nearbyBullets])}`)
        ws.send(`players ${JSON.stringify([Object.keys(ships).length, 
          rubberbandRadius])}`)
      }
    }
  }

  const updateRubberband = () => {
    if (rubberbandRadiusGoal > rubberbandRadius) {
      rubberbandRadius = Math.min(rubberbandRadiusGoal, rubberbandRadius + 0.2)
    } else if (rubberbandRadiusGoal < rubberbandRadius) {
      rubberbandRadius = Math.max(rubberbandRadiusGoal, rubberbandRadius - 0.05)
    }
  }

  const oneTick = () => {
    shipAcceleration()
    findShipPlanetCollisions()
    
    moveShips(0.25)
    findShipShipCollisions()

    moveShips(0.25)
    findShipShipCollisions()

    moveBullets(1)
    
    moveShips(0.25)
    findShipShipCollisions()

    moveShips(0.25)
    findShipShipCollisions()

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

  const handleFire = (ship) => {
    if (!ship || ship.dead !== false) {
      return
    }

    const now = chron.timeMs()
    if ((now - ship.lastFired) >= physics.DELAY_BETWEEN_BULLETS_MS) {
      const [p1, , , ] = geom.getShipPoints(ship)

      let bullet = newBullet()
      bullet = {
        ...bullet,
        posX: p1[0] + ship.posX,
        posY: p1[1] + ship.posY,
        velX: physics.BULLET_VELOCITY * Math.sin(-ship.orient),
        velY: physics.BULLET_VELOCITY * Math.cos(-ship.orient),
        dist: 0,
        shooter: ship._id
      }
      bullets[bullet._id] = bullet

      ship.lastFired = now
      ships[ship._id] = ship
    }
  }

  const handleControl = (ship, angle, accel, brake) => {
    if (!ship || ship.dead !== false) {
      return
    }

    if (!isFinite(angle)) {
      return
    }

    if (ship.orient != angle && ship.accel !== null) {
      ship.accel = chron.timeMs()
    }
    ship.orient = angle
    
    if (accel && ship.accel === null) {
      ship.accel = chron.timeMs()
    } else if (!accel && ship.accel !== null) {
      ship.accel = null
    }
    if (brake && ship.brake === null) {
      ship.brake = chron.timeMs()
    } else if (!brake && ship.brake !== null) {
      ship.brake = null
    }

    ships[ship._id] = ship
  }

  const handleNick = (ship, args) => {
    if (!ship || ship.dead !== false) {
      return
    }
    
    let name = args.slice(0, 20).trim()
    if (!ship.name) {
      if (!name) {
        name = 'null'
      }
      ship.name = name
      console.log(`joined player ${name}`)
      ships[ship._id] = ship
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
    handleFire,
    handleNick
  }
}

module.exports = gameFactory
