const serial = require('./utils/serial')
const physics = require('./game/physics')
const chron = require('./utils/chron')
const NS_PER_TICK = BigInt(1000 ** 3) / BigInt(physics.TICKS_PER_SECOND)
const shipSystemFactory = require('./game/ship').system
const bulletSystemFactory = require('./game/bullet').system
const powerupSystemFactory = require('./game/powerup').system

const gameFactory = (wss) => {
  let ships
  let bullets
  let powerups
  let lastTick = null
  let lastSocket = {}
  let leaderboard = []
  let nearbyBullets = {}
  let rubberbandRadius = 150
  let rubberbandRadiusGoal = 150

  const announce = (obj) => {
    wss.clients.forEach((ws) => {
      serial.send(ws, obj)
    })
  }

  const newPlayer = () => {
    const existing = ships.getShipCount()
    rubberbandRadiusGoal = physics.getRubberbandRadius(existing)
    if (existing == 0) {
      physics.newPlanetSeed()
      rubberbandRadius = rubberbandRadiusGoal
      powerups.clear()
    }
    return ships.newPlayerShip(
      Math.min(rubberbandRadius, rubberbandRadiusGoal),
      bullets)
  }
  
  const welcome = (ship, ws) => {
    serial.send(ws, serial.e_data(ship, 
      [], 
      bullets.getBullets(),
      ships.getShipCount(), 
      rubberbandRadius, 
      physics.getPlanetSeed()))
    serial.send(ws, serial.e_addpups(powerups.getPowerups().filter(x => x)))
    serial.send(ws, serial.e_board(leaderboard))
  }

  const updateLeaderboard = () => {
    const players = ships.getShips()
      .filter(ship => ship.score > 0 && !ship.dead)
      .map(ship => [ship.name, ship.score])
    players.sort((a, b) => b[1] - a[1])
    leaderboard = players.slice(0, 10)
    announce(serial.e_board(leaderboard))
  }

  const getShipById = (id) => {
    return ships.getShipById(id)
  }

  const leavePlayer = (ship) => {
    deleteShip(ship)
    rubberbandRadiusGoal = physics.getRubberbandRadius(ships.getShipCount())
    updateLeaderboard()
  }

  const onShipLatch = (ship) => {
    if (lastSocket[ship._id]) {
      serial.send(lastSocket[ship._id], serial.e_orient(ship.orient))
    }
  }

  const onShipKilled = (ship) => {
    announce(serial.e_killship(ship))
    bullets.removeMinesBy(ship)
  }

  const onShipKilledByCrash = (ship, into) => {
    ship.dead = true
    updateLeaderboard()
    serial.send(lastSocket[ship._id], serial.e_crashed(into.name))
    announce(serial.e_deathc(ship.name, into.name))
  }

  const onShipKilledByPlanet = ship => {
    ship.dead = true
    updateLeaderboard()
    serial.send(lastSocket[ship._id], serial.e_hitpl())
    announce(serial.e_deathp(ship.name))
  }

  const killShipByBullet = (ship, bullet) => {
    ship.dead = true
    updateLeaderboard()
    serial.send(lastSocket[ship._id], serial.e_killed(bullet.shooterName))
    announce(serial.e_deathk(ship.name, bullet.shooterName))
    ships.killShip(ship)
  }

  const deleteShip = (ship) => {
    ships.deleteShip(ship)
  }

  const onBulletDeleted = (bullet) => {
    announce(serial.e_killproj(bullet._id))
  }

  const onMineExplode = (bullet) => {
    announce(serial.e_minexpl(bullet))
  }

  const onPowerupSpawned = (powerup) => {
    announce(serial.e_addpup(powerup))
  }

  const onPowerupDeleted = (powerup) => {
    announce(serial.e_delpup(powerup._id))
  }

  const announceNearby = () => {
    const md = (physics.VIEW_DISTANCE + 3)
    const shipList = ships.getShips()
    const shipCount = shipList.length
    for (let i = 0; i < shipCount; ++i) {
      const self = shipList[i]
      const ws = lastSocket[self._id]
      if (ws) {
        const nearbyShips = []
        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j]
          if (i != j
            && Math.abs(ship.posX - self.posX) < md
            && Math.abs(ship.posY - self.posY) < md) {
            nearbyShips.push(ship)
          }
        }

        serial.send(ws, serial.e_data(self, nearbyShips, 
          bullets.getBulletsById(nearbyBullets[self._id] || []).filter(x => x), 
          shipCount, rubberbandRadius, physics.getPlanetSeed()))
      }
      delete nearbyBullets[self._id]
    }
  }

  const updateRubberband = delta => {
    if (rubberbandRadiusGoal > rubberbandRadius) {
      rubberbandRadius = Math.min(rubberbandRadiusGoal, rubberbandRadius + 0.2 * delta)
    } else if (rubberbandRadiusGoal < rubberbandRadius) {
      rubberbandRadius = Math.max(rubberbandRadiusGoal, rubberbandRadius - 0.03 * delta)
    }
  }

  const oneTick = () => {
    const delta = physics.TICK_DELTA
    const radius = Math.min(rubberbandRadius, rubberbandRadiusGoal)
    ships.shipAcceleration(delta, rubberbandRadius, rubberbandRadiusGoal)
    powerups.maybeSpawnPowerup(ships, radius)

    ships.premoveShips(delta)
    bullets.moveBullets(delta, ships, powerups)
    ships.moveShips(delta, powerups)
    powerups.updatePowerups(ships)

    updateRubberband(delta)
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
    ships.getShips()
      .filter(shipId => lastSocket[shipId] === ws)
      .forEach(shipId => {
        delete lastSocket[shipId]
        deleteShip({ _id: shipId })
      })
  }
  
  const handleControl = (ship, angle, accel, brake, firing) => {
    if (!ship || ship.dead !== false) {
      return
    }

    if (!isFinite(angle)) {
      return
    }

    const now = chron.timeMs()
    /*if (ship.orient != angle && ship.accel !== null) {
      physics.onTurn(ship, now)
    }*/
    if (!ship.latched) {
      ship.orient = angle
    }
    
    if (accel && ship.accel === null) {
      ship.accel = now
      if (ship.latched) {
        ship.thrustBoost = 5 // quicker launch off a planet
      }
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
    case 'fastershots':
      ship.bulletSpeedMul = 1.2
      break
    case 'fasterrate':
      ship.firingInterval = 3.25
      break
    case 'healthboost':
      ship.healthMul = 0.75
      break
    case 'movespeed':
      ship.highAgility = true
      ship.speedMul = 0.9
      break
    case 'planetbouncer':
      ship.planetDamageMul = 0.5
      break
    case 'regen':
      ship.absorber = true
      break
    case 'fastheal':
      ship.healRate = 1.5 
      break
    }
  }

  const addProjectile = (ship, type, extras) => {
    const bullet = bullets.addProjectile(ship, type, extras)
    const filt = physics.MAX_BULLET_DISTANCE + physics.VIEW_DISTANCE * 2
    const shipList = ships.getShips()
    for (let i = 0; i < shipList.length; ++i) {
      const ship = shipList[i]
      if (Math.abs(bullet.posX - ship.posX) < filt
        && Math.abs(bullet.posY - ship.posY) < filt) {
        if (!Object.prototype.hasOwnProperty.call(nearbyBullets, ship._id)) {
          nearbyBullets[ship._id] = []
        }
        nearbyBullets[ship._id].push(bullet._id)
      }
    }
  }

  const handleUseItem = (ship) => {
    switch (ship.item) {
    case 'laser':
      ship.item = null
      addProjectile(ship, 'laser', { speedFactor: 4, damageFactor: 4, noShear: true })
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
        addProjectile(ship, 'mine', { extraDist: -2, noShear: true })
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
      for (let i = -3; i <= 3; ++i) {
        addProjectile(ship, 'bullet', { extraDist: 0, orientOffset: Math.PI + i * 0.15 - 0.05, damageFactor: 0.75, rangeSub: 25 })
        addProjectile(ship, 'bullet', { extraDist: 0.5, orientOffset: Math.PI + i * 0.15 + 0.05, damageFactor: 0.75, rangeSub: 25 })
      }
      for (let i = 0; i < 50; ++i) {
        physics.accel(ship, 1000)
      }
      break
    case 'knockout':
      ship.item = null
      addProjectile(ship, 'knockout', { rangeSub: 30, speedFactor: 0.75, damageFactor: 0.125, punch: 50 })
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

  ships = shipSystemFactory({
    addProjectile,
    onShipLatch,
    onShipKilled,
    onShipKilledByCrash,
    onShipKilledByPlanet
  })
  bullets = bulletSystemFactory({
    killShipByBullet,
    onMineExplode,
    onBulletDeleted
  })
  powerups = powerupSystemFactory({
    onPowerupSpawned,
    onPowerupDeleted
  })

  return { 
    newPlayer, 
    welcome,
    leavePlayer,
    getShipById, 
    deltaTick,
    setLastSocket,
    disconnectSocket,
    handleControl,
    handleUseItem,
    handleNick
  }
}

module.exports = gameFactory
