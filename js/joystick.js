const chron = require('../src/utils/chron')
const jouter = document.getElementById('joystickouter')
const jbase = document.getElementById('joystickbase')
const jstick = document.getElementById('joystick')

module.exports = (self, state, controls) => {
  const applyPosition = () => {
    if (state.dead || self === null) {
      return
    }

    const hjbw = jbase.offsetWidth / 2
    const hjbh = jbase.offsetHeight / 2
    let x = (jstick.offsetLeft + (jstick.offsetWidth / 2) - (jbase.offsetLeft + hjbw)) / hjbw * Math.sqrt(2)
    let y = (jstick.offsetTop + (jstick.offsetHeight / 2) - (jbase.offsetTop + hjbh)) / hjbh * Math.sqrt(2)
    if (x > 1) x = 1
    if (x < -1) x = -1
    if (y > 1) y = 1
    if (y < -1) y = -1

    const h = Math.hypot(x, y)
    
    const willAccel = h > 0.8
    let shouldUpdateAccelStart = willAccel != controls.isAccelerating()

    if (!self.latched && h > 0.01) {
      const angle = Math.atan2(x, -y)
      shouldUpdateAccelStart |= self.orient != angle
      self.orient = angle 
    }

    controls.accelerate(willAccel)
    if (shouldUpdateAccelStart) {
      if (willAccel) {
        self.accel = chron.timeMs()
      } else {
        self.accel = null
      }
      controls.resendControls()
    }
  }

  const resetJoystickCenter = () => {
    jstick.style.top = jbase.offsetTop + (jbase.offsetHeight / 2) - (jstick.offsetHeight / 2) + 'px'
    jstick.style.left = jbase.offsetLeft + (jbase.offsetWidth / 2) - (jstick.offsetWidth / 2) + 'px'
    applyPosition()
  }

  jbase.addEventListener('pointerdown', (e) => {
    jstick.style.left = e.clientX - (jstick.offsetWidth / 2) + 'px'
    jstick.style.top = e.clientY - (jstick.offsetHeight / 2) + 'px'
    applyPosition()
  })

  jbase.addEventListener('pointermove', (e) => {
    if (e.pressure > 0 || e.buttons & 1) {
      jstick.style.left = e.clientX - (jstick.offsetWidth / 2) + 'px'
      jstick.style.top = e.clientY - (jstick.offsetHeight / 2) + 'px'
      applyPosition()
    }
  })

  jbase.addEventListener('pointerout', (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()
  })

  jstick.addEventListener('pointerout', (e) => {
    e.stopPropagation()
    e.stopImmediatePropagation()
  })

  jouter.addEventListener('pointerout', () => {
    resetJoystickCenter()
  })

  jouter.addEventListener('pointerup', () => {
    resetJoystickCenter()
  })

  return {
    applyPosition,
    resetJoystickCenter
  }
}
