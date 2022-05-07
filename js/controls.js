const chron = require('../src/utils/chron')

module.exports = (canvas, self, state, cursor, callbacks) => {
  let firing = false
  let accel = false
  let brake = false
  let turnLeft = false
  let turnRight = false

  const isAccelerating = () => accel
  const isBraking = () => brake
  const isFiring = () => firing
  const isTurningLeft = () => turnLeft
  const isTurningRight = () => turnRight

  const accelerate = flag => {
    if (accel !== flag) {
      accel = flag
      if (!flag)
        self.accel = null
      resendControls()
    }
  }

  const reset = () => {
    accel = false
    brake = false
    turnLeft = false
    turnRight = false
    firing = false
  }

  const resendControls = () => callbacks.resendControls()

  const unpress = () => {
    reset()
    self.accel = null
    resendControls()
  }

  const handleMouseDown = (e) =>{
    if (!state.mouseLocked && !document.hidden && !state.dead) {
      callbacks.tryLockMouse(e)
    }
    handleMouseMove(e)
  }
  
  const handleMouseUp = (e) => {
    handleMouseMove(e)
  }
  
  const handleMouseMove = (e) => {
    const leftButton = (e.buttons & 1) !== 0
    const rightButton = (e.buttons & 2) !== 0
  
    if (leftButton && !firing) {
      firing = true
      resendControls()
    } else if (!leftButton && firing) {
      firing = false
      resendControls()
    }
  
    if (rightButton) {
      callbacks.useItem()
    }
  
    if (state.mouseLocked) {
      cursor.addPosition(e.movementX, e.movementY)
      const mcx = document.body.clientWidth / 2
      const mcy = document.body.clientHeight / 2
      const radius = Math.hypot(cursor.getX() - mcx, mcy - cursor.getY())
      if (!self.latched && radius > 2) {
        self.orient = Math.atan2(cursor.getX() - mcx, mcy - cursor.getY())
        resendControls()
      }
    }
  }
  
  document.addEventListener('pointerlockchange', () => {
    state.mouseLocked = document.pointerLockElement === canvas
  })
  
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType == 'mouse') {
      handleMouseDown(e)
    }
  })
  
  canvas.addEventListener('pointerup', (e) => {
    if (e.pointerType == 'mouse') {
      handleMouseUp(e)
    }
  })
  
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType == 'mouse') {
      handleMouseMove(e)
    }
  })
  
  document.getElementById('btnfire').addEventListener('pointerdown', () => {
    firing = true
    resendControls()
  })
  document.getElementById('btnfire').addEventListener('pointerover', (e) => {
    if (e.pressure > 0) {
      firing = true
      resendControls()
    }
  })
  
  document.getElementById('btnfire').addEventListener('pointerout', () => {
    firing = false
    resendControls()
  })
  document.getElementById('btnfire').addEventListener('pointerup', () => {
    firing = false
    resendControls()
  })
  
  document.getElementById('btnbrake').addEventListener('pointerdown', () => {
    brake = true
    resendControls()
  })
  document.getElementById('btnbrake').addEventListener('pointerover', (e) => {
    if (e.pressure > 0) {
      brake = true
      resendControls()
    }
  })
  
  document.getElementById('btnbrake').addEventListener('pointerout', () => {
    brake = false
    resendControls()
  })
  document.getElementById('btnbrake').addEventListener('pointerup', () => {
    brake = false
    resendControls()
  })
  
  document.getElementById('btnconsume').addEventListener('pointerdown', () => {
    callbacks.useItem()
  })
  document.getElementById('btnconsume').addEventListener('pointerover', (e) => {
    if (e.pressure > 0) {
      callbacks.useItem()
    }
  })
  
  if (!window.PointerEvent) {
    canvas.addEventListener('mousedown', (e) => {
      handleMouseDown(e)
    })
    
    canvas.addEventListener('mouseup', (e) => {
      handleMouseUp(e)
    })
    
    canvas.addEventListener('mousemove', (e) => {
      handleMouseMove(e)
    })
  }
  
  window.addEventListener('keydown', (e) => {
    if (!state.token || state.dead) {
      return
    }
  
    if (e.code == 'KeyW') {
      accel = true
      self.accel = chron.timeMs()
      resendControls()
    } else if (e.code == 'KeyS') {
      brake = true
      resendControls()
    } else if (e.code == 'KeyA') {
      turnLeft = true
    } else if (e.code == 'KeyD') {
      turnRight = true
    } else if (e.code == 'KeyQ') {
      callbacks.useItem()
    } else if (e.code == 'Space') {
      firing = true
      resendControls()
    }
  }, true)
  
  window.addEventListener('keyup', (e) => {
    if (!state.token || state.dead) {
      return
    }
  
    if (e.code == 'KeyW') {
      accel = false
      self.accel = null
      resendControls()
    } else if (e.code == 'KeyS') {
      brake = false
      resendControls()
    } else if (e.code == 'KeyA') {
      turnLeft = false
    } else if (e.code == 'KeyD') {
      turnRight = false
    } else if (e.code == 'KeyZ') {
      callbacks.nextZoom(e.shiftKey ? -1 : 1)
    } else if (e.code == 'Space') {
      firing = false
      resendControls()
    }
  }, true)
  
  return {
    accelerate,
    resendControls,
    isAccelerating,
    isBraking,
    isFiring,
    isTurningLeft,
    isTurningRight,
    reset,
    unpress
  }
}
