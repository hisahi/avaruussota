const physics = require('../src/game/physics')
const chron = require('../src/utils/chron')

module.exports = (self, objects, controls) => {
  const serverTick = (delta, rubber) => {
    if (controls.isAccelerating()) {
      physics.accel(self, chron.timeMs() - self.accel)
    }
    if (controls.isBraking()) {
      physics.brake(self)
    }
    if (controls.isFiring() 
      && self.fireWaitTicks <= 0
      && !self.latched) {
      physics.recoil(self)
    }
    physics.inertia(self)
    if (!self.latched) {
      physics.rubberband(self, rubber)
      objects.planets = physics.getPlanets(self.posX, self.posY)
      physics.gravityShip(self, objects.planets)
    }

    for (const ship of objects.ships) {
      if (!ship.latched) {
        physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY))
      }
    }

    for (const bullet of objects.bullets) {
      if (bullet.type !== 'mine') {
        if (bullet.type !== 'laser') {
          bullet.posX = bullet.syncPosX
          bullet.posY = bullet.syncPosY
          physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY))
        }
        bullet.posX = bullet.syncPosX = bullet.syncPosX + bullet.velX * delta
        bullet.posY = bullet.syncPosY = bullet.syncPosY + bullet.velY * delta
      }
    }
  }

  return {
    serverTick
  }
}
