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
  health: 1,                  // 0 = no health, 1 = max health

  name: '',
  score: 0,
  accel: null,
  brake: null,
  firing: false,
  latched: false,
  lastFired: 0,

  dead: false,
  _id: shipCounter.next()
})

const newBullet = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0,                    // distance taken
  shooter: null,
  shooterName: '',

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
    const existing = Object.keys(ships).length
    rubberbandRadiusGoal = physics.getRubberbandRadius(existing)
    if (existing == 0) {
      physics.newPlanetSeed()
    }

    spawn(ship)
    ships[ship._id] = ship
    return ship
  }
  
  const welcome = (ship, ws) => {
    ws.send(`leaderboard ${JSON.stringify(leaderboard)}`)
    ship
  }

  const randomSign = () => {
    return 2 * ((2 * Math.random()) | 0) - 1
  }

  const isValidSpawn = (ship, allowCloseSpawn) => {
    const d = Math.hypot(ship.posX, ship.posY)
    const min = physics.VIEW_DISTANCE
    const radius = Math.min(rubberbandRadius, rubberbandRadiusGoal) - 10
    if (d > radius) {
      return false
    }

    if (allowCloseSpawn) {
      return true
    }

    for (const otherId of Object.keys(ships)) {
      const other = ships[otherId]
      if (Math.hypot(ship.posX - other.posX, ship.posY - other.posY) < min) {
        return false
      }
    }

    for (const bulletId of Object.keys(bullets)) {
      const bullet = bullets[bulletId]
      if (Math.hypot(ship.posX - bullet.posX, ship.posY - bullet.posY) < (min / 2)) {
        return false
      }
    }

    return true
  }

  const spawn = (ship) => {
    let baseX = 0
    let baseY = 0
    const max_tries = 32
    let tries = max_tries
    while (tries > 0) {
      if (ships.length) {
        const randShip = ships[(ships.length * Math.random()) | 0]
        baseX = randShip.posX
        baseY = randShip.posY
        baseX += physics.VIEW_DISTANCE * randomSign() * (Math.random() * 2)
        baseY += physics.VIEW_DISTANCE * randomSign() * (Math.random() * 2)
      } else {
        baseX = rubberbandRadius * randomSign() * Math.random() * 0.5
        baseY = rubberbandRadius * randomSign() * Math.random() * 0.5
      }
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
      if (isValidSpawn(ship, tries < 4)) {
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
    players.sort((a, b) => b[1] - a[1])
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
    const dist = physics.MAX_SHIP_VELOCITY + 1
    for (const id of Object.keys(ships)) {
      const ship = ships[id]
      ship.posXnew = ship.posX + mul * ship.velX
      ship.posYnew = ship.posY + mul * ship.velY
    }

    for (const id1 of Object.keys(ships)) {
      const ship1 = ships[id1]
      for (const id2 of Object.keys(ships)) {
        if (id1 == id2) {
          continue
        }
        const ship2 = ships[id2]
        if (Math.abs(ship1.posX - ship2.posX) < dist &&
          Math.abs(ship1.posY - ship2.posY) < dist) {
          const t = geom.closestSynchroDistance(
            [ship1.posX, ship1.posY],
            [ship1.posXnew, ship1.posYnew],
            [ship2.posX, ship2.posY],
            [ship2.posXnew, ship2.posYnew])
          if (0 <= t && t <= 1) {
            ship1.posX = ship1.posX + t * ship1.velX
            ship1.posY = ship1.posY + t * ship1.velY
            ship2.posX = ship2.posX + t * ship2.velX
            ship2.posY = ship2.posY + t * ship2.velY
            testShipShipCollision(ship1, ship2)
          }
        }
      }
    }

    for (const id of Object.keys(ships)) {
      const ship = ships[id]
      ship.posX = ship.posXnew
      ship.posY = ship.posYnew
      ships[id] = ship
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

      const newX = bullet.posX + mul * bullet.velX
      const newY = bullet.posY + mul * bullet.velY

      for (const shipId of shipIds) {
        const ship = ships[shipId]
        // 1 unit = ship length from "head" to "tail"
        if (ship && !ship.dead && bullet.shooter !== ship._id &&
            Math.abs(ship.posX - bullet.posX) < physics.BULLET_VELOCITY &&
            Math.abs(ship.posY - bullet.posY) < physics.BULLET_VELOCITY) {
          const [p1, p2, p3] = geom.getCollisionPoints(ship)
          if (geom.lineIntersectsTriangle([bullet.posX, bullet.posY],
            [newX, newY], p1, p2, p3)) {
            handleShipBulletCollision(ship, bullet)
            break // one collision per bullet at most
          }
        }
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
      bullet.dist += mul * physics.BULLET_VELOCITY
      bullets[id] = bullet
    }
  }

  const testShipShipCollision = (ship1, ship2) => {
    const [p1, p2, p3] = geom.getCollisionPoints(ship1)
    if (Math.abs(ship1.posX - ship2.posX) < 2 &&
        Math.abs(ship1.posY - ship2.posY) < 2) {
      const [q1, q2,   , q4] = geom.getRealShipPoints(ship2)
      if (geom.pointInTriangle(q1, q2, q4, p1)
        || geom.pointInTriangle(q1, q2, q4, p2)
        || geom.pointInTriangle(q1, q2, q4, p3)) {
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
    const damage = Math.hypot(dx, dy) / (physics.MAX_SHIP_VELOCITY / 3)

    if (damage >= 0.1) {
      ship1.health -= damage
      ship2.health -= damage
    }

    // elastic collision
    [ship1.velX, ship2.velX] = [ship2.velX, ship1.velX];
    [ship1.velY, ship2.velY] = [ship2.velY, ship1.velY]
    
    if (ship1.health <= 0) {
      lastSocket[ship1._id].send(`defeated_collision ${ship2.name}`)
      killShip(ship1)
    } else {
      ships[ship1._id] = ship1
    }

    if (ship2.health <= 0) {
      lastSocket[ship2._id].send(`defeated_collision ${ship1.name}`)
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
    ship.health -= 0.4
    if (ship.health <= 0) {
      lastSocket[ship._id].send(`defeated ${bullet.shooterName}`)
      if (shooter) {
        ++shooter.score
        ships[bullet.shooter] = shooter
      }
      killShip(ship)
    } else {
      ships[ship._id] = ship
    }
    killBullet(bullet)
  }

  const latchPlanet = (ship, planet) => {
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY) + Math.PI
    latchPlanetWithAngle(ship, planet, planetAngle)
  }

  const latchPlanetWithAngle = (ship, planet, angle) => {
    const x = planet.x + (planet.radius + 1.175) * Math.sin(angle)
    const y = planet.y + (planet.radius + 1.175) * Math.cos(angle)
    ship.velX = 0
    ship.velY = 0
    ship.posX = x
    ship.posY = y
    ship.orient = -angle
    ship.latched = ship.accel === null
    ships[ship._id] = ship
    if (lastSocket[ship._id]) {
      lastSocket[ship._id].send(`set_orient ${-angle}`)
    }
  }

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY)
    const playerAngle = Math.atan2(ship.velX, ship.velY)
    const planetAngle = Math.atan2(planet.x - ship.posX,
      planet.y - ship.posY)
    const diffAngle = playerAngle - planetAngle + Math.PI
    const col_mul = geom.getPlanetAngleMultiplier(ship.orient, playerAngle)
    const col_vel = (physics.MAX_SHIP_VELOCITY / 2) * col_mul
    const damage = Math.pow(v / col_vel, 1.25)
    if (!ship.accel 
      && v > 0 
      && v < (physics.LATCH_VELOCITY * (ship.brake !== null ? 2.5 : 1)) 
      && Math.hypot(ship.posX, ship.posY) < Math.min(rubberbandRadius, rubberbandRadiusGoal)) {
      latchPlanet(ship, planet)
      return
    }

    const dist = Math.hypot(ship.posX - planet.x, ship.posY - planet.y)
    if (dist < (planet.radius - 1)) {
      ship.posX = planet.x + (ship.posX - planet.x) / (planet.radius / dist)
      ship.posY = planet.y + (ship.posY - planet.y) / (planet.radius / dist)
    }

    if (damage > 0.05) {
      ship.health -= damage
    }

    if (ship.health <= 0) {
      lastSocket[ship._id].send('defeated_planet')
      killShip(ship)
      return
    }

    ship.velX = v * Math.sin(diffAngle)
    ship.velY = v * Math.cos(diffAngle)
    ships[ship._id] = ship
    ship.posX += (v / 8) * (ship.posX - planet.x)
    ship.posY += (v / 8) * (ship.posY - planet.y)

    ships[ship._id] = ship
    if (damage < 0.4 && col_mul < 1.7) {
      latchPlanet(ship, planet)
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
      ship.latched = false
    } else if (doBrake) {
      physics.brake(ship)
    }
    if (ship.firing) {
      if (doFire(ship)) {
        physics.recoil(ship)
      }
    }

    physics.inertia(ship)
    if (!ship.latched) {
      physics.rubberband(ship, rubberbandRadius)
    } else {
      ship.velX = ship.velY = 0
    }
    if (ship.latched && ship.health < 1) {
      ship.health = Math.min(1, ship.health + 1 / (20 * physics.TICKS_PER_SECOND))
    }
    
    if (!ship.latched) {
      physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
    }
    ships[ship._id] = ship
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
    const md = (physics.VIEW_DISTANCE + 3)
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
        ws.send(`data ${JSON.stringify([self, nearbyShips, nearbyBullets, 
          Object.keys(ships).length, rubberbandRadius, physics.getPlanetSeed()])}`)
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

    moveBullets(1)
    moveShips(1)

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
  
  const doFire = (ship) => {
    if (!ship || ship.dead !== false) {
      return false
    }

    const now = chron.timeMs()
    if ((now - ship.lastFired) >= physics.DELAY_BETWEEN_BULLETS_MS) {
      const [p1, , , ] = geom.getRealShipPoints(ship)

      let bullet = newBullet()
      bullet = {
        ...bullet,
        posX: p1[0],
        posY: p1[1],
        velX: physics.BULLET_VELOCITY * Math.sin(-ship.orient),
        velY: physics.BULLET_VELOCITY * Math.cos(-ship.orient),
        dist: 0,
        shooter: ship._id,
        shooterName: ship.name
      }
      bullets[bullet._id] = bullet

      ship.lastFired = now
      ships[ship._id] = ship
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

    if (ship.orient != angle && ship.accel !== null) {
      ship.accel = chron.timeMs()
    }
    if (!ship.latched) {
      ship.orient = angle
    }
    
    if (accel && ship.accel === null) {
      ship.accel = chron.timeMs()
      ship.latched = false
    } else if (!accel && ship.accel !== null) {
      ship.accel = null
    }
    if (brake && ship.brake === null) {
      ship.brake = chron.timeMs()
    } else if (!brake && ship.brake !== null) {
      ship.brake = null
    }

    ship.firing = firing

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
    handleNick
  }
}

module.exports = gameFactory
