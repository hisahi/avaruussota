const modelShip = require('./models/ship')
const modelBullet = require('./models/bullet')
const geom = require('./utils/geom')

const TICKS_PER_SECOND = 25
const NS_PER_TICK = BigInt(1000 ** 3) / BigInt(TICKS_PER_SECOND)
const MAX_VELOCITY = 8 / TICKS_PER_SECOND

let lastTick = null

const announce = async (message) => {
  // announce to all sockets
  message /// TODO
}

const moveShips = async (mul, ships) => {
  for (const ship of ships) {
    ship.posX += mul * ship.velX
    ship.posY += mul * ship.velY
    await modelShip.put(ship)
  }
}

const moveBullets = async (mul, bullets) => {
  for (const bullet of bullets) {
    bullet.posX += mul * bullet.velX
    bullet.posY += mul * bullet.velY
    await modelBullet.put(bullet)
  }
}

const findShipShipCollisions = async (ships, collision) => {
  ships, collision /// TODO
}

const findShipBulletCollisions = async (ships, bullets, collision) => {
  const collisions = []
  
  for (const bullet of bullets) {
    for (const ship of ships) {
      // 1 unit = ship length from "head" to "tail"
      if (Math.abs(ship.posX - bullet.posX) < 3 &&
          Math.abs(ship.posY - bullet.posY) < 3) {
        const [p1, p2, p3, p4] = ship.points()
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
    await collision(ship, bullet)
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
  await modelShip.remove(ship)
}

const killBullet = async (bullet) => {
  announce(`remove_bullet ${bullet._id}`)
  await modelBullet.remove(bullet)
}

const handleShipShipCollision = async (ship1, ship2) => {
  const dx = ship1.velX - ship2.velX
  const dy = ship1.velY - ship2.velY
  if ((dx ** 2 + dy ** 2) > (MAX_VELOCITY / 2) ** 2) {
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
  if ((ship.velX ** 2 + ship.velY ** 2) > (MAX_VELOCITY / 2) ** 2) {
    await killShip(ship)
  } else {
    // collision
    const dx = ship.posX - planet.posX
    const dy = ship.posY - planet.posY
    dx, dy /// TODO
  }
}

const oneTick = async () => {
  for (let i = 0; i < 2; ++i) {
    const ships = await modelShip.getAll()
    const bullets = await modelBullet.getAll()
    const planets = getPlanets()

    await findShipShipCollisions(ships, handleShipShipCollision)
    await findShipBulletCollisions(ships, bullets, handleShipBulletCollision)
    await findShipPlanetCollisions(ships, planets, handleShipPlanetCollision)
    await moveShips(.5, ships)
    await moveBullets(.5, bullets)
  }
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

module.exports = { deltaTick }
