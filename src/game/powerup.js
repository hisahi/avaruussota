const chron = require('../utils/chron')
const physics = require('./physics')
const Counter = require('../utils/counter')
const powerupCounter = new Counter()

const newPowerup = () => ({
  posX: 0, posY: 0,           // position X, Y
  despawn: chron.timeMs() + 15000,
  pickupRadius: 3.5,
  pickupDist: 100,
  pickupPlayer: null,
  
  dead: false,
  _id: powerupCounter.next()
})

const powerupFields = [
  '_id', 'dead', 'posX', 'posY', 'despawn',
  'pickupRadius', 'pickupDist', 'pickupPlayer'
]

const powerupSystemFactory = handler => {
  let powerups = {}
  let nextPowerup = null

  const getPowerups = () => Object.values(powerups)

  const trySpawnPowerup = (playerCount, ships, radius) => {
    let tries = playerCount * 4
    let count = 0
    while (tries > 0) {
      const r = Math.sqrt(Math.random()) * (radius + 5)
      const theta = Math.random() * 2 * Math.PI

      const x = Math.sin(theta) * r
      const y = Math.cos(theta) * r
      
      const playerDist = Math.min.apply(null, ships.getShips().map(
        ship => Math.hypot(ship.posX - x, ship.posY - y)
      ))
      const inPlanet = Math.min.apply(null, physics.getPlanets(x, y).map(
        planet => Math.hypot(planet.x - x, planet.y - y) - planet.radius
      )) <= 2
      const tooClose = Math.min.apply(null, getPowerups().map(
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
        handler.onPowerupSpawned(powerup)
        ++count
      }
      --tries
    }
    return count
  }

  const setNextPowerupTime = (ships, division) => {
    const playerCount = Math.max(1, ships.getShipCount())
    nextPowerup = chron.timeMs() + (1000 * (10 + 18 * Math.random()) / Math.pow(playerCount, 0.125) / division)
  }

  const maybeSpawnPowerup = (ships, radius) => {
    const playerCount = Math.max(1, ships.getShipCount())
    let division = 1
    if (nextPowerup != null && chron.timeMs() >= nextPowerup) {
      division = trySpawnPowerup(playerCount, ships, radius) > 0 ? 1 : 8
      setNextPowerupTime(ships, division)
    } else if (nextPowerup == null) {
      setNextPowerupTime(ships, division)
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

  const updateClosestPlayer = (powerup, ship, t) => {
    if (powerup.pickupDist > t) {
      powerups[powerup._id].pickupDist = t
      powerups[powerup._id].pickupPlayer = ship._id
    }
  }

  const removePowerup = (powerup) => {
    delete powerups[powerup._id]
    handler.onPowerupDeleted(powerup)
  }

  const updatePowerups = (ships) => {
    const now = chron.timeMs()
    getPowerups().forEach((powerup) => {
      if (now >= powerup.despawn) {
        removePowerup(powerup)
        return
      }

      if (powerup.pickupPlayer !== null) {
        const ship = ships.getShipById(powerup.pickupPlayer)
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

  return {
    getPowerups,
    applyPowerup,
    updateClosestPlayer,
    maybeSpawnPowerup,
    removePowerup,
    updatePowerups
  }
}

module.exports = {
  system: powerupSystemFactory,
  fields: powerupFields,
}
