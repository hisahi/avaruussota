/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/common.js":
/*!**********************!*\
  !*** ./js/common.js ***!
  \**********************/
/***/ ((module) => {

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

module.exports = {
  isMobile
};

/***/ }),

/***/ "./js/controls.js":
/*!************************!*\
  !*** ./js/controls.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const chron = __webpack_require__(/*! ../src/utils/chron */ "./src/utils/chron.js");

module.exports = (canvas, self, state, cursor, callbacks) => {
  let firing = false;
  let accel = false;
  let brake = false;
  let turnLeft = false;
  let turnRight = false;

  const isAccelerating = () => accel;

  const isBraking = () => brake;

  const isFiring = () => firing;

  const isTurningLeft = () => turnLeft;

  const isTurningRight = () => turnRight;

  const accelerate = flag => {
    if (accel !== flag) {
      accel = flag;
      if (!flag) self.accel = null;
      resendControls();
    }
  };

  const reset = () => {
    accel = false;
    brake = false;
    turnLeft = false;
    turnRight = false;
    firing = false;
  };

  const resendControls = () => callbacks.resendControls();

  const unpress = () => {
    reset();
    self.accel = null;
    resendControls();
  };

  const handleMouseDown = e => {
    if (!state.mouseLocked && !document.hidden && !state.dead) {
      callbacks.tryLockMouse(e);
    }

    handleMouseMove(e);
  };

  const handleMouseUp = e => {
    handleMouseMove(e);
  };

  const handleMouseMove = e => {
    const leftButton = (e.buttons & 1) !== 0;
    const rightButton = (e.buttons & 2) !== 0;

    if (leftButton && !firing) {
      firing = true;
      resendControls();
    } else if (!leftButton && firing) {
      firing = false;
      resendControls();
    }

    if (rightButton) {
      callbacks.useItem();
    }

    if (state.mouseLocked) {
      cursor.addPosition(e.movementX, e.movementY);
      const mcx = document.body.clientWidth / 2;
      const mcy = document.body.clientHeight / 2;
      const radius = Math.hypot(cursor.getX() - mcx, mcy - cursor.getY());

      if (!self.latched && radius > 2) {
        self.orient = Math.atan2(cursor.getX() - mcx, mcy - cursor.getY());
        resendControls();
      }
    }
  };

  document.addEventListener('pointerlockchange', () => {
    state.mouseLocked = document.pointerLockElement === canvas;
  });
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType == 'mouse') {
      handleMouseDown(e);
    }
  });
  canvas.addEventListener('pointerup', e => {
    if (e.pointerType == 'mouse') {
      handleMouseUp(e);
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType == 'mouse') {
      handleMouseMove(e);
    }
  });
  document.getElementById('btnfire').addEventListener('pointerdown', () => {
    firing = true;
    resendControls();
  });
  document.getElementById('btnfire').addEventListener('pointerover', e => {
    if (e.pressure > 0) {
      firing = true;
      resendControls();
    }
  });
  document.getElementById('btnfire').addEventListener('pointerout', () => {
    firing = false;
    resendControls();
  });
  document.getElementById('btnfire').addEventListener('pointerup', () => {
    firing = false;
    resendControls();
  });
  document.getElementById('btnbrake').addEventListener('pointerdown', () => {
    brake = true;
    resendControls();
  });
  document.getElementById('btnbrake').addEventListener('pointerover', e => {
    if (e.pressure > 0) {
      brake = true;
      resendControls();
    }
  });
  document.getElementById('btnbrake').addEventListener('pointerout', () => {
    brake = false;
    resendControls();
  });
  document.getElementById('btnbrake').addEventListener('pointerup', () => {
    brake = false;
    resendControls();
  });
  document.getElementById('btnconsume').addEventListener('pointerdown', () => {
    callbacks.useItem();
  });
  document.getElementById('btnconsume').addEventListener('pointerover', e => {
    if (e.pressure > 0) {
      callbacks.useItem();
    }
  });

  if (!window.PointerEvent) {
    canvas.addEventListener('mousedown', e => {
      handleMouseDown(e);
    });
    canvas.addEventListener('mouseup', e => {
      handleMouseUp(e);
    });
    canvas.addEventListener('mousemove', e => {
      handleMouseMove(e);
    });
  }

  window.addEventListener('keydown', e => {
    if (!state.token || state.dead) {
      return;
    }

    if (e.code == 'KeyW') {
      accel = true;
      self.accel = chron.timeMs();
      resendControls();
    } else if (e.code == 'KeyS') {
      brake = true;
      resendControls();
    } else if (e.code == 'KeyA') {
      turnLeft = true;
    } else if (e.code == 'KeyD') {
      turnRight = true;
    } else if (e.code == 'KeyQ') {
      callbacks.useItem();
    } else if (e.code == 'Space') {
      firing = true;
      resendControls();
    }
  }, true);
  window.addEventListener('keyup', e => {
    if (!state.token || state.dead) {
      return;
    }

    if (e.code == 'KeyW') {
      accel = false;
      self.accel = null;
      resendControls();
    } else if (e.code == 'KeyS') {
      brake = false;
      resendControls();
    } else if (e.code == 'KeyA') {
      turnLeft = false;
    } else if (e.code == 'KeyD') {
      turnRight = false;
    } else if (e.code == 'KeyZ') {
      callbacks.nextZoom(e.shiftKey ? -1 : 1);
    } else if (e.code == 'Space') {
      firing = false;
      resendControls();
    }
  }, true);
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
  };
};

/***/ }),

/***/ "./js/cursor.js":
/*!**********************!*\
  !*** ./js/cursor.js ***!
  \**********************/
/***/ ((module) => {

let cursorX = -10;
let cursorY = -10;

const setPosition = (x, y) => (cursorX = x, cursorY = y);

const addPosition = (x, y) => (cursorX += x, cursorY += y);

const getX = () => cursorX;

const getY = () => cursorY;

module.exports = {
  setPosition,
  addPosition,
  getX,
  getY
};

/***/ }),

/***/ "./js/draw.js":
/*!********************!*\
  !*** ./js/draw.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const LCG = __webpack_require__(/*! ../src/utils/lcg */ "./src/utils/lcg.js");

const geom = __webpack_require__(/*! ../src/utils/geom */ "./src/utils/geom.js");

const physics = __webpack_require__(/*! ../src/game/physics */ "./src/game/physics.js");

const fogCanvas = document.createElement('canvas');
const fogCtx = fogCanvas.getContext('2d');
const SQRT_H = Math.sqrt(0.5);
const GRID_SIZE = 10;
const PLANET_SPIN_SPEED = 0.02;
const MINE_X = [0, SQRT_H, 1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H];
const MINE_Y = [1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H, 0, SQRT_H];

module.exports = (canvas, self, objects, state, cursor) => {
  const ctx = canvas.getContext('2d');
  let damageGot = 0;
  let lcg = new LCG(0);
  let lines = [];
  let smokes = [];
  let bubbles = [];
  let planetAngle = 0;
  let damageAlpha = 0;
  let lastSmoke = {};
  let zoom = 1;
  let rubber = 150;
  let cx = 0;
  let cy = 0;
  let unitSize = 1;

  const reset = () => {
    lines = [];
    smokes = [];
    damageGot = 0;
    damageAlpha = 0;
  };

  const gotDamage = damage => {
    damageGot = performance.now() + damage * 700;
    damageAlpha = 0.8 * damage;
  };

  const setZoom = z => zoom = z;

  const setRubber = r => rubber = r;

  const checkSize = () => {
    ctx.canvas.width = window.innerWidth * window.devicePixelRatio;
    ctx.canvas.height = window.innerHeight * window.devicePixelRatio;
    cx = ctx.canvas.width / 2;
    cy = ctx.canvas.height / 2;
    unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) / physics.VIEW_DISTANCE * (zoom / 2);
    drawFog();
  };

  const addBubble = bubble => bubbles.push(bubble);

  const drawFog = () => {
    fogCanvas.width = ctx.canvas.width;
    fogCanvas.height = ctx.canvas.height;
    fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
    const bgradient = fogCtx.createRadialGradient(cx, cy, (physics.VIEW_DISTANCE - 1) * unitSize, cx, cy, (physics.VIEW_DISTANCE + 10) * unitSize);
    bgradient.addColorStop(0, 'rgba(0,0,0,0)');
    bgradient.addColorStop(0.5, 'rgba(0,0,0,0.2)');
    bgradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    fogCtx.beginPath();
    fogCtx.arc(cx, cy, (physics.VIEW_DISTANCE - 1) * unitSize, 0, 2 * Math.PI);
    fogCtx.rect(fogCtx.canvas.width, 0, -fogCtx.canvas.width, fogCtx.canvas.height);
    fogCtx.fillStyle = bgradient;
    fogCtx.fill();
  };

  const drawShip = ship => {
    const [p1, p2, p3, p4] = geom.getShipPoints(ship);
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let [x3, y3] = p3;
    let [x4, y4] = p4;
    let [x0, y0] = [0, 0];
    x0 = cx + (self.posX - ship.posX) * unitSize;
    x1 = cx + (self.posX - x1) * unitSize;
    x2 = cx + (self.posX - x2) * unitSize;
    x3 = cx + (self.posX - x3) * unitSize;
    x4 = cx + (self.posX - x4) * unitSize;
    y0 = cy + (self.posY - ship.posY) * unitSize;
    y1 = cy + (self.posY - y1) * unitSize;
    y2 = cy + (self.posY - y2) * unitSize;
    y3 = cy + (self.posY - y3) * unitSize;
    y4 = cy + (self.posY - y4) * unitSize;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.stroke();

    if (ship.accel !== null) {
      const [tp1, tp2, tp3, tp4, tp5] = geom.getThrusterPoints(ship);
      let [x1, y1] = tp1;
      let [x2, y2] = tp2;
      let [x3, y3] = tp3;
      let [x4, y4] = tp4;
      let [x5, y5] = tp5;
      let xo = (Math.random() - 0.5) * unitSize / 2;
      let yo = (Math.random() - 0.5) * unitSize / 2;
      x1 = cx + (self.posX - x1) * unitSize;
      x2 = cx + (self.posX - x2) * unitSize;
      x3 = cx + (self.posX - x3) * unitSize;
      x4 = cx + (self.posX - x4) * unitSize;
      x5 = cx + (self.posX - x5) * unitSize;
      y1 = cy + (self.posY - y1) * unitSize;
      y2 = cy + (self.posY - y2) * unitSize;
      y3 = cy + (self.posY - y3) * unitSize;
      y4 = cy + (self.posY - y4) * unitSize;
      y5 = cy + (self.posY - y5) * unitSize;
      x3 += xo;
      y3 += yo;
      x5 += xo / 2;
      y5 += yo / 2;
      ctx.strokeStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x5, y5);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.font = `${18 * window.devicePixelRatio}px monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(ship.name, x0, y0 - 3.75 * unitSize);
  };

  const drawBullet = bullet => {
    const x = cx + (self.posX - bullet.posX) * unitSize;
    const y = cy + (self.posY - bullet.posY) * unitSize;
    ctx.lineWidth = 1 * window.devicePixelRatio;

    if (bullet.type === 'bullet') {
      ctx.moveTo(x, y);
      ctx.arc(x, y, 0.3 * unitSize, 0, 2 * Math.PI);
    } else if (bullet.type === 'laser') {
      const x1 = cx + (self.posX - (bullet.posX + bullet.velX)) * unitSize;
      const y1 = cy + (self.posY - (bullet.posY + bullet.velY)) * unitSize;
      ctx.moveTo(x, y);
      ctx.lineTo(x1, y1);
    } else if (bullet.type === 'mine') {
      ctx.moveTo(x + 1.6 * unitSize, y);
      ctx.arc(x, y, 1.6 * unitSize, 0, 2 * Math.PI);

      for (let i = 0; i < 8; ++i) {
        const xo = unitSize * 0.8 * MINE_X[i];
        const yo = unitSize * 0.8 * MINE_Y[i];
        ctx.moveTo(x + 2 * xo, y + 2 * yo);
        ctx.lineTo(x + 3 * xo, y + 3 * yo);
      }

      ctx.moveTo(x, y);
    }
  };

  const drawLine = line => {
    const {
      x,
      y,
      angle,
      r,
      alpha
    } = line;
    const x1 = cx + unitSize * (self.posX - x - r * Math.cos(angle));
    const y1 = cy + unitSize * (self.posY - y - r * Math.sin(angle));
    const x2 = cx + unitSize * (self.posX - x + r * Math.cos(angle));
    const y2 = cy + unitSize * (self.posY - y + r * Math.sin(angle));
    ctx.strokeStyle = `rgba(192,192,192,${alpha * 0.01})`;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawPowerup = (powerup, color) => {
    const {
      posX,
      posY
    } = powerup;
    const sx = cx + (self.posX - posX) * unitSize;
    const sy = cy + (self.posY - posY) * unitSize;

    if (sx < -20 || sy < -20 || sx > ctx.canvas.width + 20 || sy > ctx.canvas.height + 20) {
      return;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, unitSize, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawSmoke = smoke => {
    const {
      x,
      y,
      radius,
      alpha
    } = smoke;
    const sx = cx + (self.posX - x) * unitSize;
    const sy = cy + (self.posY - y) * unitSize;
    ctx.fillStyle = `rgba(92,92,92,${alpha * 0.01})`;
    ctx.beginPath();
    ctx.arc(sx, sy, radius * unitSize, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawBubble = bubble => {
    const {
      x,
      y,
      radius,
      alpha
    } = bubble;
    const sx = cx + (self.posX - x) * unitSize;
    const sy = cy + (self.posY - y) * unitSize;
    ctx.lineWidth = window.devicePixelRatio * (1 + Math.max(0, alpha - 1));
    ctx.strokeStyle = `rgba(128,128,128,${Math.min(1, alpha) * 0.01})`;
    ctx.beginPath();
    ctx.arc(sx, sy, radius * unitSize, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const computePlanetAngle = (radius, sx, sy, angle) => {
    return [sx + Math.sin(angle) * radius * unitSize, sy + Math.cos(angle) * radius * unitSize];
  };

  const drawPlanet = planet => {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    const sx = cx + (self.posX - planet.x) * unitSize;
    const sy = cy + (self.posY - planet.y) * unitSize;

    if (sx < -planet.radius * unitSize || sy < -planet.radius * unitSize || sx > ctx.canvas.width + planet.radius * unitSize || sy > ctx.canvas.height + planet.radius * unitSize) {
      return;
    }

    lcg.reseed(planet.seed);
    const gon = Math.abs(lcg.randomInt()) % 19 + 12;
    let angle = lcg.randomOffset() * Math.PI * 2 + planetAngle * lcg.randomSign();
    let [x, y] = computePlanetAngle(planet.radius, sx, sy, angle);
    let fac = 2 * Math.PI / gon;
    ctx.moveTo(x, y);

    for (let i = 0; i <= gon; ++i) {
      [x, y] = computePlanetAngle(planet.radius, sx, sy, angle + i * fac);
      ctx.lineTo(x, y);
    }
  };

  const createLine = (x1, y1, x2, y2, xv, yv, tpf) => {
    const [x, y] = [(x1 + x2) / 2, (y1 + y2) / 2];
    const angle = Math.atan2(x2 - x1, y2 - y1);
    const r = Math.hypot(x2 - x1, y2 - y1) / 2;
    const vx = -0.05 + 0.1 * Math.random() + xv * tpf;
    const vy = -0.05 + 0.1 * Math.random() + yv * tpf;
    const vangle = -0.1 + 0.2 * Math.random();
    return {
      x,
      y,
      angle,
      alpha: 100,
      r,
      vx,
      vy,
      vangle
    };
  };

  const explosion = (ship, tpf) => {
    if (!ship) {
      return;
    }

    const [p1, p2, p3, p4] = geom.getShipPoints(ship);
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let [x3, y3] = p3;
    let [x4, y4] = p4;
    let [x5, y5] = [(x1 + x2) / 2, (y1 + y2) / 2];
    let [x6, y6] = [(x1 + x4) / 2, (y1 + y4) / 2];
    lines.push(createLine(x1, y1, x5, y5, ship.velX, ship.velY, tpf));
    lines.push(createLine(x5, y5, x2, y2, ship.velX, ship.velY, tpf));
    lines.push(createLine(x2, y2, x3, y3, ship.velX, ship.velY, tpf));
    lines.push(createLine(x3, y3, x4, y4, ship.velX, ship.velY, tpf));
    lines.push(createLine(x4, y4, x6, y6, ship.velX, ship.velY, tpf));
    lines.push(createLine(x6, y6, x1, y1, ship.velX, ship.velY, tpf));
  };

  const frame = (time, delta) => {
    const xm = (self.posX % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
    const ym = (self.posY % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // draw grid

    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.strokeStyle = '#333';
    ctx.beginPath();

    for (let x = xm * unitSize; x < ctx.canvas.width; x += GRID_SIZE * unitSize) {
      const dx = x | 0 + 0.5;
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx, ctx.canvas.height);
    }

    for (let y = ym * unitSize; y < ctx.canvas.height; y += GRID_SIZE * unitSize) {
      const dy = y | 0 + 0.5;
      ctx.moveTo(0, dy);
      ctx.lineTo(ctx.canvas.width, dy);
    }

    ctx.stroke();

    if (!self.dead) {
      // draw red mask
      if (rubber > 1) {
        const gradient = ctx.createRadialGradient(cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber - 1) * unitSize, cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber + physics.RUBBERBAND_BUFFER - 1) * unitSize);
        gradient.addColorStop(0, 'rgba(192,192,192,0)');
        gradient.addColorStop(1, 'rgba(192,192,192,0.25)');
        ctx.beginPath();
        ctx.arc(cx + self.posX * unitSize, cy + self.posY * unitSize, rubber * unitSize, 0, 2 * Math.PI);
        ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = gradient;
        ctx.fill();
      } // draw player ship


      ctx.lineWidth = 1.5 * window.devicePixelRatio;
      drawShip(self);

      if (self.health < 0.75) {
        const interval = 320 ** (self.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(self.velX, self.velY) / 6);

        if (!Object.prototype.hasOwnProperty.call(lastSmoke, self._id) || time - lastSmoke[self._id] > interval) {
          smokes.push({
            x: self.posX + 1.5 * Math.random() - 0.75,
            y: self.posY + 1.5 * Math.random() - 0.75,
            radius: 0.15 + (0.75 - self.health) + Math.random() * 0.3,
            alpha: 100 * Math.min(1, 1.4 - self.health)
          });
          lastSmoke[self._id] = time;
        }
      } // draw ships


      ctx.lineWidth = 1 * window.devicePixelRatio;

      for (const ship of objects.ships) {
        drawShip(ship);

        if (ship.health < 0.75) {
          const interval = 320 ** (ship.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(ship.velX, ship.velY) / 6);

          if (!Object.prototype.hasOwnProperty.call(lastSmoke, ship._id) || time - lastSmoke[ship._id] > interval) {
            smokes.push({
              x: ship.posX + 1.5 * Math.random() - 0.75,
              y: ship.posY + 1.5 * Math.random() - 0.75,
              radius: 0.15 + (0.75 - ship.health) + Math.random() * 0.3,
              alpha: 100 * Math.min(1, 1.4 - ship.health)
            });
            lastSmoke[ship._id] = time;
          }
        }
      }

      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#fff';
      ctx.beginPath(); // draw bullets

      for (const bullet of objects.bullets) {
        drawBullet(bullet);
      }

      ctx.stroke();
    }

    ctx.beginPath(); // draw planets

    for (const planet of objects.planets) {
      drawPlanet(planet);
    }

    ctx.stroke();

    if (objects.powerups.length) {
      const ctr = 0 | time % 300 / 15;
      const alp = time / 1000 % 1.0;
      const powerupColor = `rgba(${224 + ctr},255,${192 + ctr * 2},${Math.max(alp, 1 - alp)})`; // draw powerups

      for (const powerup of objects.powerups) {
        drawPowerup(powerup, powerupColor);
      }
    } // draw lines


    for (const line of lines) {
      drawLine(line);
      line.x += line.vx;
      line.y += line.vy;
      line.angle += line.vangle;
      line.vx *= 0.99;
      line.vy *= 0.99;
      line.vangle *= 0.99;
      line.alpha -= 1;
    }

    lines = lines.filter(line => line.alpha > 0); // draw smokes

    for (const smoke of smokes) {
      drawSmoke(smoke);
      smoke.radius += 0.015;
      smoke.alpha -= 1;
    }

    smokes = smokes.filter(smoke => smoke.alpha > 0);

    for (const shipid of Object.keys(lastSmoke)) {
      if (time - lastSmoke[shipid] >= 5000) {
        delete lastSmoke[shipid];
      }
    } // draw bubbles


    for (const bubble of bubbles) {
      drawBubble(bubble);
      bubble.radius += 0.05;
      bubble.alpha -= 1;
    }

    bubbles = bubbles.filter(bubble => bubble.alpha > 0);

    if (!self.dead) {
      ctx.drawImage(fogCanvas, 0, 0);

      if (damageAlpha > 0) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(128,0,0,${damageAlpha})`;
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fill();

        if (time > damageGot && damageAlpha > 0) {
          damageAlpha = Math.max(0, damageAlpha - delta / 800);
        }
      }
    }

    if (state.mouseLocked) {
      const cursorX = cursor.getX();
      const cursorY = cursor.getY();
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      ctx.moveTo(cursorX - 8.5, cursorY + 0.5);
      ctx.lineTo(cursorX + 9.5, cursorY + 0.5);
      ctx.moveTo(cursorX + 0.5, cursorY - 8.5);
      ctx.lineTo(cursorX + 0.5, cursorY + 9.5);
      ctx.stroke();
    }

    planetAngle += PLANET_SPIN_SPEED;
    planetAngle %= 2 * Math.PI;
  };

  window.addEventListener('resize', () => checkSize());
  return {
    reset,
    gotDamage,
    setZoom,
    setRubber,
    checkSize,
    addBubble,
    drawFog,
    drawShip,
    drawBullet,
    drawLine,
    drawPowerup,
    drawSmoke,
    drawBubble,
    drawPlanet,
    explosion,
    frame
  };
};

/***/ }),

/***/ "./js/joystick.js":
/*!************************!*\
  !*** ./js/joystick.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const chron = __webpack_require__(/*! ../src/utils/chron */ "./src/utils/chron.js");

const jouter = document.getElementById('joystickouter');
const jbase = document.getElementById('joystickbase');
const jstick = document.getElementById('joystick');

module.exports = (self, state, controls) => {
  const applyPosition = () => {
    if (state.dead || self === null) {
      return;
    }

    const hjbw = jbase.offsetWidth / 2;
    const hjbh = jbase.offsetHeight / 2;
    let x = (jstick.offsetLeft + jstick.offsetWidth / 2 - (jbase.offsetLeft + hjbw)) / hjbw * Math.sqrt(2);
    let y = (jstick.offsetTop + jstick.offsetHeight / 2 - (jbase.offsetTop + hjbh)) / hjbh * Math.sqrt(2);
    if (x > 1) x = 1;
    if (x < -1) x = -1;
    if (y > 1) y = 1;
    if (y < -1) y = -1;
    const h = Math.hypot(x, y);
    const willAccel = h > 0.8;
    let shouldUpdateAccelStart = willAccel != controls.isAccelerating();

    if (!self.latched && h > 0.01) {
      const angle = Math.atan2(x, -y);
      shouldUpdateAccelStart |= self.orient != angle;
      self.orient = angle;
    }

    controls.accelerate(willAccel);

    if (shouldUpdateAccelStart) {
      if (willAccel) {
        self.accel = chron.timeMs();
      } else {
        self.accel = null;
      }

      controls.resendControls();
    }
  };

  const resetJoystickCenter = () => {
    jstick.style.top = jbase.offsetTop + jbase.offsetHeight / 2 - jstick.offsetHeight / 2 + 'px';
    jstick.style.left = jbase.offsetLeft + jbase.offsetWidth / 2 - jstick.offsetWidth / 2 + 'px';
    applyPosition();
  };

  jbase.addEventListener('pointerdown', e => {
    jstick.style.left = e.clientX - jstick.offsetWidth / 2 + 'px';
    jstick.style.top = e.clientY - jstick.offsetHeight / 2 + 'px';
    applyPosition();
  });
  jbase.addEventListener('pointermove', e => {
    if (e.pressure > 0 || e.buttons & 1) {
      jstick.style.left = e.clientX - jstick.offsetWidth / 2 + 'px';
      jstick.style.top = e.clientY - jstick.offsetHeight / 2 + 'px';
      applyPosition();
    }
  });
  jbase.addEventListener('pointerout', e => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  jstick.addEventListener('pointerout', e => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  jouter.addEventListener('pointerout', () => {
    resetJoystickCenter();
  });
  jouter.addEventListener('pointerup', () => {
    resetJoystickCenter();
  });
  return {
    applyPosition,
    resetJoystickCenter
  };
};

/***/ }),

/***/ "./js/ui.js":
/*!******************!*\
  !*** ./js/ui.js ***!
  \******************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const common = __webpack_require__(/*! ./common */ "./js/common.js");

module.exports = callbacks => {
  let dialogOpacity = 0;
  document.getElementById('scoreanimation').style.animation = 'none';
  document.getElementById('scoreanimation').style.visibility = 'hidden';
  document.getElementById('powerupanimation').style.animation = 'none';
  document.getElementById('powerupanimation').style.visibility = 'hidden';

  const updateZoomText = zoom => {
    document.getElementById('btnzoom').textContent = `zoom: ${zoom * 100 | 0}%`;
  };

  const showDialog = () => {
    dialogOpacity = 0;
    document.getElementById('dialogbox').style.opacity = '0';
    document.getElementById('dialog').style.display = 'flex';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('finalscore').style.display = 'block';
    document.body.style.position = 'absolute';
    document.body.style.overflow = '';
  };

  const hideDialog = () => {
    document.getElementById('dialog').style.display = 'none';
    document.getElementById('stats').style.display = 'block';
    document.body.style.position = 'relative';
    document.body.style.overflow = 'hidden';
  };

  const hideLose = () => {
    document.getElementById('defeat').style.display = 'none';
    document.getElementById('defeatcrash').style.display = 'none';
    document.getElementById('defeatplanet').style.display = 'none';
    document.getElementById('defeatname').style.display = 'none';
    document.getElementById('disconnected').style.display = 'none';
    document.getElementById('finalscore').style.display = 'none';
  };

  const disconnect = () => {
    hideLose();
    document.getElementById('disconnected').style.display = 'inline';
  };

  const updateOpacity = delta => {
    if (dialogOpacity < 1) {
      dialogOpacity = Math.min(1, dialogOpacity + delta / 250);
      document.getElementById('dialogbox').style.opacity = dialogOpacity;
    }
  };

  const makeTd = text => {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  };

  const makeTableRow = lb => {
    const tr = document.createElement('tr');
    tr.appendChild(makeTd(lb[0]));
    tr.appendChild(makeTd(lb[1]));
    return tr;
  };

  const updateLeaderboard = leaderboard => {
    const leaderBoardTable = document.getElementById('leaderboard');
    const newBody = document.createElement('tbody');

    for (let i = 0; i < Math.min(10, leaderboard.length); ++i) {
      newBody.appendChild(makeTableRow(leaderboard[i]));
    }

    leaderBoardTable.replaceChild(newBody, leaderBoardTable.childNodes[0]);
  };

  const formatTime = sec => {
    sec = Math.floor(sec);
    return `${0 | sec / 60}:${('0' + sec % 60).slice(-2)}`;
  };

  const updateControls = state => {
    if (state.dead) {
      document.getElementById('mobilecontrols').style.display = 'none';
    } else {
      document.getElementById('mobilecontrols').style.display = common.isMobile() ? 'block' : 'none';
    }
  };

  const updatePowerup = (self, state) => {
    let resText = '';

    if (!state.dead) {
      if (self.item !== null) {
        if (common.isMobile()) {
          resText += `item: ${self.item} ([USE] to use)\n`;
        } else {
          resText += `item: ${self.item} ([Q] to use)\n`;
        }
      }

      if (self.rubbership > 0) {
        resText += `[${formatTime(self.rubbership / 1000)}] rubber ship\n`;
      }

      if (self.overdrive > 0) {
        resText += `[${formatTime(self.overdrive / 1000)}] overdrive\n`;
      }

      if (self.regen > 0) {
        resText += `[${formatTime(self.regen / 1000)}] regen\n`;
      }
    }

    document.getElementById('powerupstatus').textContent = resText.trim();
    document.getElementById('btnconsume').style.display = self.item !== null ? 'block' : 'none';
  };

  const updateOnlineStatus = text => {
    document.getElementById('onlinestatus').textContent = text;
  };

  const updateColors = (health, time) => {
    if (health < 0.3) {
      document.getElementById('yourscore').style.color = time % 1000 >= 500 ? '#f88' : '#fff';
      document.getElementById('healthbarhealth').style.background = (time + 100) % 800 >= 400 ? '#800' : '#c00';
    } else if (health < 0.7) {
      const t = (health - 0.3) / 0.4 * 204;
      document.getElementById('yourscore').style.color = '#fff';
      document.getElementById('healthbarhealth').style.background = `rgba(204,${t},${t})`;
    } else {
      document.getElementById('yourscore').style.color = '#fff';
      document.getElementById('healthbarhealth').style.background = '#ccc';
    }
  };

  const updateScore = (scoreNow, scoreWas) => {
    document.getElementById('yourscore').textContent = document.getElementById('scoreanimation').textContent = document.getElementById('finalscorenum').textContent = scoreNow;

    if (scoreNow > scoreWas) {
      document.getElementById('scoreanimation').style.visibility = 'visible';
      document.getElementById('scoreanimation').style.animation = 'none';
      document.getElementById('scoreanimation').style.animation = '';
    }
  };

  const updatePlayerCount = players => {
    document.getElementById('playerCountNum').textContent = players;
  };

  const updateHealthBar = health => {
    document.getElementById('healthbarhealth').style.width = `${Math.ceil(health * 200)}px`;
  };

  const addDeathLog = text => {
    const deathLog = document.getElementById('deathlog');
    if (deathLog.childElementCount > 5) deathLog.removeChild(deathLog.firstChild);
    const p = document.createElement('p');
    p.textContent = text;
    setTimeout(() => {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 5000);
    deathLog.appendChild(p);
  };

  const defeatedByPlayer = name => {
    hideLose();
    document.getElementById('defeat').style.display = 'inline';
    document.getElementById('defeatname').style.display = 'inline';
    document.getElementById('defeatname').innerHTML = name;
  };

  const defeatedByCrash = name => {
    hideLose();
    document.getElementById('defeatcrash').style.display = 'inline';
    document.getElementById('defeatname').style.display = 'inline';
    document.getElementById('defeatname').innerHTML = name;
  };

  const defeatedByPlanet = () => {
    hideLose();
    document.getElementById('defeatplanet').style.display = 'inline';
  };

  const showPowerupAnimation = () => {
    // document.getElementById('powerupanimation').style.visibility = 'visible'
    document.getElementById('powerupanimation').style.animation = 'none';
    document.getElementById('powerupanimation').style.animation = '';
  };

  const joiningGame = () => {
    document.getElementById('scoreanimation').style.animation = 'none';
    document.getElementById('scoreanimation').style.visibility = 'hidden';
    document.getElementById('powerupanimation').style.animation = 'none';
    document.getElementById('powerupanimation').style.visibility = 'hidden';
    document.getElementById('btnplay').blur();
    updateOnlineStatus('connecting');
  };

  document.getElementById('btnplay').addEventListener('click', e => {
    callbacks.tryLockMouse(e);
    callbacks.joinGame();
  });
  document.getElementById('btnfs').addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });
  document.getElementById('btnzoom').addEventListener('click', () => {
    callbacks.nextZoom(1);
  });
  return {
    updateZoomText,
    updatePowerup,
    showDialog,
    hideDialog,
    hideLose,
    disconnect,
    updateControls,
    updateOpacity,
    updateLeaderboard,
    updateOnlineStatus,
    updateColors,
    updateScore,
    updatePlayerCount,
    updateHealthBar,
    showPowerupAnimation,
    defeatedByPlayer,
    defeatedByCrash,
    defeatedByPlanet,
    joiningGame,
    addDeathLog
  };
};

/***/ }),

/***/ "./node_modules/js-cookie/dist/js.cookie.js":
/*!**************************************************!*\
  !*** ./node_modules/js-cookie/dist/js.cookie.js ***!
  \**************************************************/
/***/ (function(module) {

/*! js-cookie v3.0.1 | MIT */
;

(function (global, factory) {
   true ? module.exports = factory() : 0;
})(this, function () {
  'use strict';
  /* eslint-disable no-var */

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        target[key] = source[key];
      }
    }

    return target;
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */


  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }

      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function (value) {
      return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
    }
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init(converter, defaultAttributes) {
    function set(key, value, attributes) {
      if (typeof document === 'undefined') {
        return;
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }

      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var stringifiedAttributes = '';

      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue;
        } // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...


        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return document.cookie = key + '=' + converter.write(value, key) + stringifiedAttributes;
    }

    function get(key) {
      if (typeof document === 'undefined' || arguments.length && !key) {
        return;
      } // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.


      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};

      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');

        try {
          var foundKey = decodeURIComponent(parts[0]);
          jar[foundKey] = converter.read(value, foundKey);

          if (key === foundKey) {
            break;
          }
        } catch (e) {}
      }

      return key ? jar[key] : jar;
    }

    return Object.create({
      set: set,
      get: get,
      remove: function (key, attributes) {
        set(key, '', assign({}, attributes, {
          expires: -1
        }));
      },
      withAttributes: function (attributes) {
        return init(this.converter, assign({}, this.attributes, attributes));
      },
      withConverter: function (converter) {
        return init(assign({}, this.converter, converter), this.attributes);
      }
    }, {
      attributes: {
        value: Object.freeze(defaultAttributes)
      },
      converter: {
        value: Object.freeze(converter)
      }
    });
  }

  var api = init(defaultConverter, {
    path: '/'
  });
  /* eslint-enable no-var */

  return api;
});

/***/ }),

/***/ "./src/game/bullet.js":
/*!****************************!*\
  !*** ./src/game/bullet.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const geom = __webpack_require__(/*! ../utils/geom */ "./src/utils/geom.js");

const physics = __webpack_require__(/*! ./physics */ "./src/game/physics.js");

const Counter = __webpack_require__(/*! ../utils/counter */ "./src/utils/counter.js");

const bulletCounter = new Counter();
const BULLET_DAMAGE_MULTIPLIER = 0.115;

const newBullet = () => ({
  posX: 0,
  posY: 0,
  // position X, Y
  velX: 0,
  velY: 0,
  // velocity X, Y
  dist: 0,
  // distance taken
  velocity: 0,
  shooter: null,
  shooterName: '',
  isHit: false,
  canPickUp: true,
  type: 'bullet',
  damage: 1,
  dead: false,
  _id: bulletCounter.next()
});

const bulletFields = ['_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'dist', 'velocity', 'shooter', 'shooterName', 'isHit', 'canPickUp', 'type', 'damage'];

const bulletSystemFactory = handler => {
  let bullets = {};

  const getBullets = () => Object.values(bullets);

  const getBulletsById = ids => ids.map(id => bullets[id]);

  const removeBullet = bullet => {
    bullet.dead = true;
    delete bullets[bullet._id];
    handler.onBulletDeleted(bullet);
  };

  const handleShipBulletCollision = (ships, ship, bullet) => {
    if (bullet.dead) {
      return;
    }

    const shooter = ships.getShipById(bullet.shooter);
    ship.health -= BULLET_DAMAGE_MULTIPLIER * ship.healthMul * bullet.damage;

    if (shooter && shooter.absorber) {
      shooter.health += 0.01 * shooter.healthMul;
    }

    if (ship.health <= 0) {
      if (shooter) {
        ++shooter.score;
      }

      handler.killShipByBullet(ship, bullet);
    }

    if (bullet.type !== 'laser') {
      removeBullet(bullet);
    }
  };

  const handlePowerupBulletCollision = (ships, powerup, bullet, powerups) => {
    if (bullet.dead) {
      return;
    }

    const shooter = ships.getShipById(bullet.shooter);

    if (shooter) {
      powerups.applyPowerup(shooter, powerup);
    }

    if (bullet.type !== 'laser') {
      removeBullet(bullet);
    }
  };

  const removeMinesBy = ship => {
    const shipId = ship._id;
    const projList = getBullets();
    const projCount = projList.length;

    for (let i = 0; i < projCount; ++i) {
      const bullet = projList[i];

      if (bullet.type === 'mine' && bullet.shooter === shipId) {
        removeBullet(bullet);
      }
    }
  };

  const moveBullets = (delta, ships, powerups) => {
    const shipList = ships.getShips();
    const powerupList = powerups.getPowerups();
    const bulletList = getBullets();
    const shipCount = shipList.length;
    const powerupCount = powerupList.length;
    const bulletCount = bulletList.length;

    for (let i = 0; i < bulletCount; ++i) {
      const bullet = bulletList[i];

      if (bullet.dist > physics.MAX_BULLET_DISTANCE) {
        removeBullet(bullet);
        continue;
      }

      if (bullet.type == 'bullet' || bullet.type == 'laser') {
        physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY));
        const newX = bullet.posX + delta * bullet.velX;
        const newY = bullet.posY + delta * bullet.velY;
        let collisionShip = null;

        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j];

          if (ship._id !== bullet.shooter && Math.abs(ship.posX - bullet.posX) < bullet.velocity && Math.abs(ship.posY - bullet.posY) < bullet.velocity) {
            const [p1, p2, p3] = geom.getCollisionPoints(ship);

            if (geom.lineIntersectsTriangle([bullet.posX, bullet.posY], [newX, newY], p1, p2, p3)) {
              collisionShip = ship;
              break;
            }
          }
        }

        if (collisionShip) {
          handleShipBulletCollision(ships, collisionShip, bullet);
        }

        let collisionPowerup = null;

        if (bullet.canPickUp) {
          for (let j = 0; j < powerupCount; ++j) {
            const powerup = powerupList[j];

            if (Math.abs(powerup.posX - bullet.posX) < bullet.velocity && Math.abs(powerup.posY - bullet.posY) < bullet.velocity) {
              const r = powerup.pickupRadius * 0.35;
              const a1 = [powerup.posX - (bullet.posY - powerup.posY) * r, powerup.posY - (powerup.posX - bullet.posX) * r];
              const a2 = [powerup.posX + (bullet.posY - powerup.posY) * r, powerup.posY + (powerup.posX - bullet.posX) * r];

              if (geom.lineIntersectsLine([bullet.posX, bullet.posY], [newX, newY], a1, a2)) {
                collisionPowerup = powerup;
                break;
              }
            }
          }
        }

        if (collisionPowerup) {
          handlePowerupBulletCollision(ships, collisionPowerup, bullet, powerups);
        }

        let hitPlanet = false;
        const planets = physics.getPlanets(newX, newY);

        for (const planet of planets) {
          if (Math.hypot(planet.x - newX, planet.y - newY) < planet.radius) {
            hitPlanet = true;
            break;
          }
        }

        if (hitPlanet) {
          removeBullet(bullet);
          continue;
        }

        bullet.posX = newX;
        bullet.posY = newY;
        bullet.dist += delta * bullet.velocity;
      } else if (bullet.type == 'mine') {
        const r = 3 + 7 * Math.random() ** 3;
        let primerShip = null;

        for (let j = 0; j < shipCount; ++j) {
          const ship = shipList[j];

          if (!ship.dead && bullet.shooter !== ship._id && Math.hypot(ship.posX - bullet.posX, ship.posY - bullet.posY) < r) {
            primerShip = ship;
            break;
          }
        }

        if (primerShip || bullet.isHit) {
          // blow up the mine
          shipList.forEach(ship => {
            if (Math.abs(ship.posX - bullet.posX) > 15 || Math.abs(ship.posY - bullet.posY) > 15) {
              return;
            }

            let damage = 2 / Math.sqrt(Math.hypot(ship.posX - bullet.posX, ship.posY - bullet.posY));

            if (damage < 0.05) {
              damage = 0;
            }

            const shooter = ships.getShipById[bullet.shooter];

            if (shooter && shooter._id !== ship._id) {
              ship.health -= damage * ship.healthMul;

              if (ship.health <= 0) {
                if (shooter) {
                  ++shooter.score;
                }

                handler.killShipByBullet(ship, bullet);
              }
            }
          });
          handler.onMineExplode(bullet);
          removeBullet(bullet);
          continue;
        }

        bullet.dist += physics.MAX_BULLET_DISTANCE / (physics.MINE_LIFETIME * physics.TICKS_PER_SECOND);
      }
    }
  };

  const addProjectile = (ship, type, extras) => {
    const [p1,,,] = geom.getShipPoints(ship);
    const {
      extraDist,
      orientOffset,
      speedFactor,
      damageFactor,
      rangeSub,
      canPickUp
    } = {
      extraDist: 0,
      orientOffset: 0,
      speedFactor: 1,
      damageFactor: 1,
      rangeSub: 0,
      canPickUp: true,
      ...(extras || {})
    };
    let typeSpeedMul = 1;

    if (type == 'mine') {
      typeSpeedMul = 0;
    }

    let bullet = newBullet();
    bullet = { ...bullet,
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
    };
    bullets[bullet._id] = bullet;
    return bullet;
  };

  return {
    getBullets,
    getBulletsById,
    moveBullets,
    addProjectile,
    removeBullet,
    removeMinesBy
  };
};

module.exports = {
  system: bulletSystemFactory,
  fields: bulletFields
};

/***/ }),

/***/ "./src/game/physics.js":
/*!*****************************!*\
  !*** ./src/game/physics.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const GRAV = 6.67e-11;
const TICKS_PER_SECOND = 20;
const MS_PER_TICK = 1000 / TICKS_PER_SECOND;
const MAX_SHIP_VELOCITY = 48 / TICKS_PER_SECOND;
const MIN_SHIP_VELOCITY = 0.01;
const LATCH_VELOCITY = 0.3;
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 1.75;
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 1.5));
const VIEW_DISTANCE = 50;
const MAX_BULLET_DISTANCE = 70;
const RUBBERBAND_BUFFER = 80;
const MINE_LIFETIME = 60;
const INERTIA_MUL = 1; // (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))

const LCG = __webpack_require__(/*! ../utils/lcg */ "./src/utils/lcg.js");

const PLANET_CHUNK_SIZE = VIEW_DISTANCE * 1.6 + 1;
const lcg = new LCG(0);
let PLANET_SEED = 1340985553;

const getAccelMul = accelTimeMs => {
  // time in milliseconds
  return 0.0875 + 0.000025 * accelTimeMs;
};

const onTurn = (ship, now) => {
  if (ship.highAgility) {
    ship.accel = now / 16 + ship.accel * 15 / 16;
  } else {
    ship.accel = now;
  }
};

const checkMinVelocity = ship => {
  const v = Math.hypot(ship.velX, ship.velY);

  if (v <= MIN_SHIP_VELOCITY) {
    ship.velX = 0;
    ship.velY = 0;
  }
};

const checkMaxVelocity = ship => {
  const maxvel = MAX_SHIP_VELOCITY * healthToVelocity(ship.health) * ship.speedMul;
  const v = Math.hypot(ship.velX, ship.velY);

  if (v > maxvel) {
    ship.velX *= maxvel / v;
    ship.velY *= maxvel / v;
  }
};

const getPlanetSeed = () => {
  return PLANET_SEED;
};

const setPlanetSeed = seed => {
  PLANET_SEED = seed;
};

const newPlanetSeed = () => {
  PLANET_SEED = Math.floor(Math.random() * 2147483647);
}; // planet: x, y, radius, seed


const getPlanetsForChunk = (cx, cy) => {
  const r = PLANET_CHUNK_SIZE;
  const xb = (cx + 0.5) * r;
  const yb = (cy + 0.5) * r;
  lcg.reseed((PLANET_SEED ^ cx * 1173320513 ^ cy * 891693747) & 0xFFFFFFFF);
  const xo = lcg.randomOffset() * (r / 4);
  const yo = lcg.randomOffset() * (r / 4);
  const radius = r / 20 + r / 12 * lcg.random();
  const seed = lcg.randomInt();
  return [{
    x: xb + xo,
    y: yb + yo,
    radius,
    seed
  }];
};

const getPlanets = (x, y) => {
  const x0 = Math.floor(x / PLANET_CHUNK_SIZE);
  const y0 = Math.floor(y / PLANET_CHUNK_SIZE);
  const xu = [x0 - 2, x0 - 1, x0, x0 + 1, x0 + 2];
  const yu = [y0 - 2, y0 - 1, y0, y0 + 1, y0 + 2];
  let planets = [];

  for (const x of xu) {
    for (const y of yu) {
      planets = [...planets, ...getPlanetsForChunk(x, y)];
    }
  }

  return planets;
};

const hasOverdrive = ship => {
  return ship.overdrive > 0;
};

const hasRubbership = ship => {
  return ship.rubbership > 0;
};

const hasRegen = ship => {
  return ship.regen > 0;
};

const accel = (ship, accelTimeMs) => {
  let accelMul = getAccelMul(accelTimeMs) * healthToVelocity(ship.health) * (hasOverdrive(ship) ? 2 : 1);

  if (ship.speedMul !== 1) {
    accelMul *= Math.sqrt(ship.speedMul);
  }

  ship.velX += accelMul * Math.sin(-ship.orient);
  ship.velY += accelMul * Math.cos(-ship.orient);
  checkMaxVelocity(ship);
};

const inertia = ship => {
  ship.velX *= INERTIA_MUL;
  ship.velY *= INERTIA_MUL;
  checkMinVelocity(ship);
};

const brake = ship => {
  ship.velX *= BRAKE_MUL;
  ship.velY *= BRAKE_MUL;
  checkMinVelocity(ship);
};

const recoil = ship => {
  ship.velX -= 0.017 * Math.sin(-ship.orient);
  ship.velY -= 0.017 * Math.cos(-ship.orient);
  checkMaxVelocity(ship);
};

const gravityBullet = (bullet, planets) => {
  if (bullet.type == 'mine') {
    return;
  }

  for (const planet of planets) {
    const d = Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y);

    if (d > planet.radius + 1 && d < 10 + planet.radius * 3) {
      const dx = planet.x - bullet.posX;
      const dy = planet.y - bullet.posY;
      const r2 = Math.hypot(dx, dy) ** 2;
      const f = GRAV * 8e+9 / r2 * planet.radius;
      bullet.velX += f * dx;
      bullet.velY += f * dy;
    }
  }

  const d = Math.hypot(bullet.velX, bullet.velY);
  bullet.velX *= bullet.velocity / d;
  bullet.velY *= bullet.velocity / d;
};

const gravityShip = (ship, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y);
    const dv = Math.hypot(ship.velX, ship.velY);

    if (d > planet.radius + 1.5 + dv * 0.3 && d < 10 + planet.radius * 3) {
      const dx = planet.x - ship.posX;
      const dy = planet.y - ship.posY;
      const r2 = Math.hypot(dx, dy) ** 2;
      const f = GRAV * 8e+8 * planet.radius / r2 / (ship.accel !== null || ship.brake !== null ? 5 : 1);
      ship.velX += f * dx;
      ship.velY += f * dy;
    }
  }

  checkMaxVelocity(ship);
};

const getRubberbandRadius = playerCount => {
  return 75 * Math.pow(Math.max(playerCount, 1), 0.75);
};

const rubberband = (ship, radius) => {
  const distCenter = Math.hypot(ship.posX, ship.posY);

  if (distCenter > radius) {
    const maxRadius = radius + RUBBERBAND_BUFFER;
    const baseX = -ship.posX / Math.hypot(ship.posX, ship.posY);
    const baseY = -ship.posY / Math.hypot(ship.posX, ship.posY);

    if (distCenter > maxRadius) {
      ship.velX = ship.velY = 0;
    }

    ship.velX += baseX * 0.3 * MAX_SHIP_VELOCITY * (1.1 * (distCenter - radius) / (maxRadius - radius)) ** 8;
    ship.velY += baseY * 0.3 * MAX_SHIP_VELOCITY * (1.1 * (distCenter - radius) / (maxRadius - radius)) ** 8;
    checkMaxVelocity(ship);
  }
};

const healthToVelocity = health => {
  return 0.6 + 0.4 * health;
};

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  MS_PER_TICK,
  BULLET_VELOCITY,
  LATCH_VELOCITY,
  VIEW_DISTANCE,
  MAX_BULLET_DISTANCE,
  PLANET_CHUNK_SIZE,
  RUBBERBAND_BUFFER,
  MINE_LIFETIME,
  hasOverdrive,
  hasRubbership,
  hasRegen,
  accel,
  inertia,
  brake,
  recoil,
  onTurn,
  gravityBullet,
  gravityShip,
  rubberband,
  getPlanets,
  getPlanetSeed,
  setPlanetSeed,
  newPlanetSeed,
  getRubberbandRadius,
  healthToVelocity
};

/***/ }),

/***/ "./src/game/powerup.js":
/*!*****************************!*\
  !*** ./src/game/powerup.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const chron = __webpack_require__(/*! ../utils/chron */ "./src/utils/chron.js");

const physics = __webpack_require__(/*! ./physics */ "./src/game/physics.js");

const Counter = __webpack_require__(/*! ../utils/counter */ "./src/utils/counter.js");

const powerupCounter = new Counter();

const newPowerup = () => ({
  posX: 0,
  posY: 0,
  // position X, Y
  despawn: chron.timeMs() + 15000,
  pickupRadius: 3.5,
  pickupDist: 100,
  pickupPlayer: null,
  dead: false,
  _id: powerupCounter.next()
});

const powerupFields = ['_id', 'dead', 'posX', 'posY', 'despawn', 'pickupRadius', 'pickupDist', 'pickupPlayer'];

const powerupSystemFactory = handler => {
  let powerups = {};
  let nextPowerup = null;

  const getPowerups = () => Object.values(powerups);

  const trySpawnPowerup = (playerCount, ships, radius) => {
    let tries = playerCount * 4;
    let count = 0;

    while (tries > 0) {
      const r = Math.sqrt(Math.random()) * (radius + 5);
      const theta = Math.random() * 2 * Math.PI;
      const x = Math.sin(theta) * r;
      const y = Math.cos(theta) * r;
      const playerDist = Math.min.apply(null, ships.getShips().map(ship => Math.hypot(ship.posX - x, ship.posY - y)));
      const inPlanet = Math.min.apply(null, physics.getPlanets(x, y).map(planet => Math.hypot(planet.x - x, planet.y - y) - planet.radius)) <= 2;
      const tooClose = Math.min.apply(null, getPowerups().map(powerup => Math.hypot(powerup.x - x, powerup.y - y) - 4)) <= 0;

      if (Math.random() < 0.2 && playerDist >= 30 && !inPlanet && !tooClose) {
        let powerup = newPowerup();
        powerup = { ...powerup,
          posX: x,
          posY: y
        };
        powerups[powerup._id] = powerup;
        handler.onPowerupSpawned(powerup);
        ++count;
      }

      --tries;
    }

    return count;
  };

  const setNextPowerupTime = (ships, division) => {
    const playerCount = Math.max(1, ships.getShipCount());
    nextPowerup = chron.timeMs() + 1000 * (10 + 18 * Math.random()) / Math.pow(playerCount, 0.125) / division;
  };

  const maybeSpawnPowerup = (ships, radius) => {
    const playerCount = Math.max(1, ships.getShipCount());
    let division = 1;

    if (nextPowerup != null && chron.timeMs() >= nextPowerup) {
      division = trySpawnPowerup(playerCount, ships, radius) > 0 ? 1 : 8;
      setNextPowerupTime(ships, division);
    } else if (nextPowerup == null) {
      setNextPowerupTime(ships, division);
    }
  };

  const applyPowerup = (ship, powerup) => {
    const ITEM_COUNT = 9;
    const item = 0 | ITEM_COUNT * Math.random();

    switch (item) {
      case 0:
        if (ship.item === null) {
          ship.item = 'laser';
        }

        break;

      case 1:
        if (ship.item === null) {
          ship.item = 'reheal';
        }

        break;

      case 2:
        if (ship.item === null) {
          ship.item = 'bomb';
        }

        break;

      case 3:
        if (ship.item === null) {
          ship.item = 'mine';
        }

        break;

      case 4:
        if (ship.item === null) {
          ship.item = 'orion';
        }

        break;

      case 5:
        ship.rubbership = 30 * 1000;
        break;

      case 6:
        ship.regen = 10 * 1000;
        break;

      case 7:
        ship.overdrive = 10 * 1000;
        break;

      case 8:
        if (ship.item === null) {
          ship.item = 'spread';
        }

        break;
    }

    removePowerup(powerup);
  };

  const updateClosestPlayer = (powerup, ship, t) => {
    if (powerup.pickupDist > t) {
      powerups[powerup._id].pickupDist = t;
      powerups[powerup._id].pickupPlayer = ship._id;
    }
  };

  const removePowerup = powerup => {
    delete powerups[powerup._id];
    handler.onPowerupDeleted(powerup);
  };

  const updatePowerups = ships => {
    const now = chron.timeMs();
    getPowerups().forEach(powerup => {
      if (now >= powerup.despawn) {
        removePowerup(powerup);
        return;
      }

      if (powerup.pickupPlayer !== null) {
        const ship = ships.getShipById(powerup.pickupPlayer);

        if (ship !== null && !ship.dead) {
          applyPowerup(ship, powerup);
          return;
        } else {
          powerup.pickupDist = 10000;
          powerup.pickupPlayer = null;
        }
      }
    });
  };

  return {
    getPowerups,
    applyPowerup,
    updateClosestPlayer,
    maybeSpawnPowerup,
    removePowerup,
    updatePowerups
  };
};

module.exports = {
  system: powerupSystemFactory,
  fields: powerupFields
};

/***/ }),

/***/ "./src/game/ship.js":
/*!**************************!*\
  !*** ./src/game/ship.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const geom = __webpack_require__(/*! ../utils/geom */ "./src/utils/geom.js");

const chron = __webpack_require__(/*! ../utils/chron */ "./src/utils/chron.js");

const physics = __webpack_require__(/*! ./physics */ "./src/game/physics.js");

const maths = __webpack_require__(/*! ../utils/maths */ "./src/utils/maths.js");

const Counter = __webpack_require__(/*! ../utils/counter */ "./src/utils/counter.js");

const shipCounter = new Counter();

const newShip = () => ({
  posX: 0,
  posY: 0,
  // position X, Y
  velX: 0,
  velY: 0,
  // velocity X, Y
  orient: 0,
  // radians, clockwise from 0 = up
  health: 1,
  // 0 = no health, 1 = max health
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
});

const shipFields = ['_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'orient', 'health', 'name', 'score', 'accel', 'brake', 'firing', 'latched', 'fireWaitTicks', 'firingInterval', 'bulletSpeedMul', 'healthMul', 'speedMul', 'planetDamageMul', 'highAgility', 'absorber', 'healRate', 'item', 'rubbership', 'regen', 'overdrive'];

const shipSystemFactory = handler => {
  let ships = {};

  const getShips = () => Object.values(ships);

  const getShipById = id => ships[id];

  const getShipCount = () => Object.keys(ships).length;

  const removeShipById = id => delete ships[id];

  const newPlayerShip = (radius, bullets) => {
    const ship = newShip();
    spawn(ship, radius, bullets);
    ships[ship._id] = ship;
    return ship;
  };

  const latchToPlanet = (ship, planet) => {
    const planetAngle = Math.atan2(planet.x - ship.posX, planet.y - ship.posY) + Math.PI;
    latchToPlanetWithAngle(ship, planet, planetAngle);
  };

  const computePlanetPoint = (planet, angle) => {
    return [planet.x + (planet.radius + 1.4) * Math.sin(angle), planet.y + (planet.radius + 1.4) * Math.cos(angle)];
  };

  const latchToPlanetWithAngle = (ship, planet, angle) => {
    const [x, y] = computePlanetPoint(planet, angle);
    ship.velX = 0;
    ship.velY = 0;
    ship.posX = x;
    ship.posY = y;
    ship.orient = -angle;
    ship.latched = ship.accel === null;
    handler.onShipLatch(ship);
  };

  const spawnLone = (ship, radius) => {
    let baseX = physics.VIEW_DISTANCE * maths.randomSign() * Math.random();
    let baseY = physics.VIEW_DISTANCE * maths.randomSign() * Math.random();
    let planets = physics.getPlanets(baseX, baseY);
    planets = planets.filter(planet => Math.hypot(planet.x, planet.y) < radius - planet.radius);

    if (planets.length < 1) {
      ship.posX = baseX;
      ship.posY = baseY;
      ship.orient = 0;
      return;
    }

    const planet = planets[0 | planets.length * Math.random()];
    latchToPlanetWithAngle(ship, planet, Math.random() * 2 * Math.PI);
  };

  const spawn = (ship, radius, bullets) => {
    const playerKeys = Object.keys(ships);
    const playerCount = playerKeys.length;
    let baseX = 0;
    let baseY = 0;

    if (playerCount < 1) {
      return spawnLone(ship, radius);
    }

    let tries = 64;

    while (--tries > 0) {
      const randShip = ships[playerKeys[playerCount * Math.random() | 0]];
      baseX = randShip.posX;
      baseY = randShip.posY;
      baseX += physics.VIEW_DISTANCE * maths.randomSign();
      baseY += physics.VIEW_DISTANCE * maths.randomSign();

      if (Math.hypot(baseX, baseY) < radius - physics.PLANET_CHUNK_SIZE / 8) {
        break;
      }

      if (tries < 8) {
        if (Math.hypot(baseX, baseY) < radius) {
          break;
        }
      }
    }

    let planets = physics.getPlanets(baseX, baseY);
    planets = planets.filter(planet => Math.hypot(planet.x, planet.y) < radius - (planet.radius - 3));

    if (planets.length < 1) {
      ship.posX = baseX + physics.VIEW_DISTANCE * maths.randomSign();
      ship.posY = baseY + physics.VIEW_DISTANCE * maths.randomSign();
      ship.orient = 0;
      return;
    }

    planets.forEach(planet => {
      planet.playerDist = Math.min.call(null, getShips().map(ship => Math.hypot(ship.posX - planet.x, ship.posY - planet.y)));
      planet.bulletDist = Math.min.call(null, bullets.getBullets().map(bullet => Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y)));
    });
    const ideal = planets.find(planet => planet.playerDist > physics.VIEW_DISTANCE && planet.bulletDist > physics.MAX_BULLET_DISTANCE);

    if (ideal) {
      latchToPlanetWithAngle(ship, ideal, Math.random() * 2 * Math.PI);
      return;
    }

    const testPlanet = (a, b) => a.playerDist + a.bulletDist * 1.5 > b.playerDist + b.bulletDist * 1.5;

    const mostIdeal = planets.reduce((a, b) => testPlanet(a, b) ? a : b); // pick optimal angle

    const angleOffset = Math.random() * 2 * Math.PI;
    let minimalScore = 0;
    let angle = 0;

    for (let i = 0; i < 8; ++i) {
      const testAngle = angleOffset + i * Math.PI / 4;
      const [x, y] = computePlanetPoint(mostIdeal, testAngle);
      const score = Math.min.call(null, getShips().map(ship => Math.hypot(ship.posX - x, ship.posY - y))) + Math.min.call(null, bullets.getBullets().map(bullet => Math.hypot(bullet.posX - x, bullet.posY - y)));

      if (minimalScore < score) {
        minimalScore = score;
        angle = testAngle;
      }
    }

    latchToPlanetWithAngle(ship, mostIdeal, angle);
  };

  const doFire = ship => {
    if (!ship || ship.dead !== false) {
      return false;
    }

    if (ship.fireWaitTicks <= 0) {
      handler.addProjectile(ship, 'bullet');
      ship.fireWaitTicks = ship.firingInterval;
      return true;
    }

    return false;
  };

  const shipAcceleration = (delta, radius, radiusGoal) => {
    const now = chron.timeMs();
    const shipList = getShips();

    for (let i = 0, shipCount = shipList.length; i < shipCount; ++i) {
      const ship = shipList[i];
      let doAccel = false;
      let doBrake = false;

      if (ship.accel != null && ship.brake != null) {
        if (ship.accel > ship.brake) {
          doAccel = true;
        } else {
          doBrake = true;
        }
      } else if (ship.accel != null) {
        doAccel = true;
      } else if (ship.brake != null) {
        doBrake = true;
      }

      if (doAccel) {
        physics.accel(ship, now - ship.accel);
        ship.latched = false;
      } else if (doBrake) {
        physics.brake(ship);
      }

      if (ship.firing) {
        if (doFire(ship) && !ship.latched) {
          physics.recoil(ship);
        }
      }

      physics.inertia(ship);

      if (!ship.latched) {
        physics.rubberband(ship, radius);
      } else {
        ship.velX = ship.velY = 0;

        if (Math.hypot(ship.posX, ship.posY) > radius + 10 && radiusGoal < radius) {
          ship.latched = false;
          ship.velX += Math.sin(-ship.orient);
          ship.velY += Math.cos(-ship.orient);
        }
      }

      if (ship.latched && ship.health < 1) {
        ship.health = Math.min(1, ship.health + ship.healthMul * ship.healRate * 1 / (20 * physics.TICKS_PER_SECOND));
      }

      if (physics.hasRegen(ship)) {
        ship.health = Math.min(1, ship.health + ship.healthMul * ship.healRate * 1.5 / (20 * physics.TICKS_PER_SECOND));
      }

      ship.fireWaitTicks = Math.max(0, ship.fireWaitTicks - (physics.hasOverdrive(ship) ? 2 : 1));
      ship.regen = Math.max(0, ship.regen - physics.MS_PER_TICK);
      ship.overdrive = Math.max(0, ship.overdrive - physics.MS_PER_TICK);
      ship.rubbership = Math.max(0, ship.rubbership - physics.MS_PER_TICK);

      if (!ship.latched) {
        physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY));
      }
    }
  };

  const moveShips = (delta, powerups) => {
    const shipList = getShips();
    const powerupList = powerups.getPowerups();
    const shipCount = shipList.length;
    const powerupCount = powerupList.length;
    const dist = physics.MAX_SHIP_VELOCITY + 1;

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i];
      ship1.posXnew = ship1.posX + delta * ship1.velX;
      ship1.posYnew = ship1.posY + delta * ship1.velY;

      for (let j = 0; j < powerupCount; ++j) {
        const pup = powerupList[j];

        if (Math.abs(ship1.posX - pup.posX) < 3 && Math.abs(ship1.posY - pup.posY) < 3) {
          const t = geom.lineIntersectCircleFirstDepth([ship1.posX, ship1.posY], [ship1.posXnew, ship1.posYnew], pup.posX, pup.posY, pup.pickupRadius);

          if (0 <= t && t <= 1) {
            powerups.updateClosestPlayer(pup, ship1, t);
          }
        }
      }

      for (let j = 0; j < shipCount; ++j) {
        const ship2 = shipList[j];

        if (i == j || ship1.dead || ship2.dead) {
          continue;
        }

        if (Math.abs(ship1.posX - ship2.posX) < dist && Math.abs(ship1.posY - ship2.posY) < dist) {
          const t = geom.closestSynchroDistance([ship1.posX, ship1.posY], [ship1.posXnew, ship1.posYnew], [ship2.posX, ship2.posY], [ship2.posXnew, ship2.posYnew]);

          if (0 <= t && t <= delta) {
            ship1.posX = ship1.posX + t * ship1.velX;
            ship1.posY = ship1.posY + t * ship1.velY;
            ship2.posX = ship2.posX + t * ship2.velX;
            ship2.posY = ship2.posY + t * ship2.velY;
            testShipShipCollision(ship1, ship2);
          }
        }
      }
    }

    for (let i = 0; i < shipCount; ++i) {
      const ship = shipList[i];
      ship.posX = ship.posXnew;
      ship.posY = ship.posYnew;
    }
  };

  const handleShipShipCollision = (ship1, ship2) => {
    const dx = ship1.velX - ship2.velX;
    const dy = ship1.velY - ship2.velY;
    const damage = 0.4 * Math.sqrt(Math.hypot(dx, dy)) / (physics.MAX_SHIP_VELOCITY / 4);
    const dmg1 = damage * (physics.hasRubbership(ship1) ? 0.5 : 1);
    const dmg2 = damage * (physics.hasRubbership(ship2) ? 0.5 : 1);

    if (dmg1 >= 0.1) {
      ship1.health -= dmg1 * ship1.healthMul;
    }

    if (dmg2 >= 0.1) {
      ship2.health -= dmg2 * ship2.healthMul;
    } // elastic collision


    [ship1.velX, ship2.velX] = [ship2.velX, ship1.velX];
    [ship1.velY, ship2.velY] = [ship2.velY, ship1.velY];

    if (ship1.health <= 0) {
      if (ship2.health > 0 && Math.hypot(ship2.velX, ship2.velY) > Math.hypot(ship1.velX, ship1.velY)) {
        ++ship2.score;
      }

      handler.onShipKilledByCrash(ship1, ship2);
      killShip(ship1);
    }

    if (ship2.health <= 0) {
      if (ship1.health > 0 && Math.hypot(ship1.velX, ship1.velY) > Math.hypot(ship2.velX, ship2.velY)) {
        ++ship1.score;
      }

      handler.onShipKilledByCrash(ship2, ship1);
      killShip(ship2);
    }
  };

  const testShipShipCollision = (ship1, ship2) => {
    const [p1, p2, p3] = geom.getCollisionPoints(ship1);

    if (Math.abs(ship1.posX - ship2.posX) < 2 && Math.abs(ship1.posY - ship2.posY) < 2) {
      const [q1, q2,, q4] = geom.getShipPoints(ship2);

      if (geom.pointInTriangle(q1, q2, q4, p1) || geom.pointInTriangle(q1, q2, q4, p2) || geom.pointInTriangle(q1, q2, q4, p3)) {
        handleShipShipCollision(ship1, ship2);
      }
    }
  };

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY);
    const playerAngle = Math.atan2(ship.velX, ship.velY);
    const planetAngle = Math.atan2(planet.x - ship.posX, planet.y - ship.posY);
    const diffAngle = playerAngle - planetAngle + Math.PI;
    const col_mul = geom.getPlanetAngleMultiplier(ship.orient, playerAngle);
    const col_vel = physics.MAX_SHIP_VELOCITY / 1.5 * col_mul;
    let damage = v / col_vel * ship.planetDamageMul * (physics.hasRubbership(ship) ? 0 : 1);

    if (!ship.accel && v > 0 && v < physics.LATCH_VELOCITY * (ship.brake !== null ? 1.5 : 1)) {
      latchToPlanet(ship, planet);
      return;
    }

    const dist = Math.hypot(ship.posX - planet.x, ship.posY - planet.y);

    if (dist < planet.radius - 1.5) {
      ship.posX = planet.x + (ship.posX - planet.x) / ((planet.radius + 2) / dist);
      ship.posY = planet.y + (ship.posY - planet.y) / ((planet.radius + 2) / dist);
    }

    if (col_mul < 1.2 && ship.accel !== null) {
      damage *= 0.2;
    }

    if (damage > 0.05) {
      ship.health -= damage * ship.healthMul;
    }

    if (ship.health <= 0) {
      handler.onShipKilledByPlanet(ship);
      killShip(ship);
      return;
    }

    ship.velX = v * Math.sin(diffAngle);
    ship.velY = v * Math.cos(diffAngle);
    ship.posX += v / 8 * (ship.posX - planet.x);
    ship.posY += v / 8 * (ship.posY - planet.y);

    if (!physics.hasRubbership(ship) && damage < 0.4 && col_mul < 1.7) {
      latchToPlanet(ship, planet);
    }
  };

  const findShipPlanetCollisions = () => {
    getShips().forEach(ship => {
      const planets = physics.getPlanets(ship.posX, ship.posY);

      for (const planet of planets) {
        const search = planet.radius + 1.35;

        if (Math.abs(ship.posX - planet.x) < search && Math.abs(ship.posY - planet.y) < search) {
          if (Math.hypot(ship.posX - planet.x, ship.posY - planet.y) < search) {
            if (!ship.dead) {
              handleShipPlanetCollision(ship, planet);
            }

            break;
          }
        }
      }
    });
  };

  const deleteShip = ship => {
    ship.dead = true;
    removeShipById(ship._id);
  };

  const killShip = ship => {
    deleteShip(ship);
    handler.onShipKilled(ship);
  };

  return {
    getShips,
    getShipById,
    getShipCount,
    removeShipById,
    newPlayerShip,
    moveShips,
    killShip,
    deleteShip,
    findShipPlanetCollisions,
    shipAcceleration
  };
};

module.exports = {
  system: shipSystemFactory,
  fields: shipFields
};

/***/ }),

/***/ "./src/utils/chron.js":
/*!****************************!*\
  !*** ./src/utils/chron.js ***!
  \****************************/
/***/ ((module) => {

const timeMs = () => new Date().getTime();

module.exports = {
  timeMs
};

/***/ }),

/***/ "./src/utils/counter.js":
/*!******************************!*\
  !*** ./src/utils/counter.js ***!
  \******************************/
/***/ ((module) => {

class Counter {
  constructor() {
    this.counter = BigInt(0);
  }

  next() {
    const val = this.counter.toString(16).padStart(16, '0');
    this.counter = BigInt.asUintN(64, this.counter + BigInt(1));
    return val;
  }

}

module.exports = Counter;

/***/ }),

/***/ "./src/utils/geom.js":
/*!***************************!*\
  !*** ./src/utils/geom.js ***!
  \***************************/
/***/ ((module) => {

const pointInTriangle = (p1, p2, p3, p) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [xp, yp] = p;
  const c1 = ((y2 - y3) * (xp - x3) + (x3 - x2) * (yp - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
  const c2 = ((y3 - y1) * (xp - x3) + (x1 - x3) * (yp - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
  const c3 = 1 - c1 - c2;
  return c1 > 0 && c2 > 0 && c3 > 0;
};

const getDirectionSign = (a, b) => {
  let s = Math.sign(b[0] - a[0]);

  if (s == 0) {
    s = Math.sign(b[1] - a[1]);
  }

  return s;
};

const collinearLinesIntersect = (a1, a2, b1, b2) => {
  let a = 0;
  let b = ((a2[0] - a1[0]) * (a2[0] - a1[0]) + (a2[1] - a1[1]) * (a2[1] - a1[1])) * getDirectionSign(a2, a1);
  let c = ((b1[0] - a1[0]) * (b1[0] - a1[0]) + (b1[1] - a1[1]) * (b1[1] - a1[1])) * getDirectionSign(b1, a1);
  let d = ((b2[0] - a1[0]) * (b2[0] - a1[0]) + (b2[1] - a1[1]) * (b2[1] - a1[1])) * getDirectionSign(b2, a1);
  if (a >= b) [a, b] = [b, a];
  if (c >= d) [c, d] = [d, c];
  return b >= c && d >= a;
};

const lineIntersectsLine = (a1, a2, b1, b2) => {
  const d = 1 / ((a2[0] - a1[0]) * (b2[1] - b1[1]) - (a2[1] - a1[1]) * (b2[0] - b1[0]));

  if (!isFinite(d)) {
    // collinear
    return collinearLinesIntersect(a1, a2, b1, b2);
  }

  const n = d * ((a1[1] - b1[1]) * (b2[0] - b1[0]) - (a1[0] - b1[0]) * (b2[1] - b1[1]));
  const m = d * ((a1[1] - b1[1]) * (a2[0] - a1[0]) - (a1[0] - b1[0]) * (a2[1] - a1[1]));
  return 0 <= n && n <= 1 && 0 <= m && m <= 1;
};

const lineIntersectsTriangle = (l1, l2, t1, t2, t3) => {
  return lineIntersectsLine(l1, l2, t1, t2) || lineIntersectsLine(l1, l2, t2, t3) || lineIntersectsLine(l1, l2, t3, t1);
};

const lineIntersectCircleFirstDepth = (a1, a2, x, y, radius) => {
  for (let i = 0; i <= 8; ++i) {
    const s = i / 8;

    if (Math.hypot(a1[0] + s * a2[0] - x, a1[1] + s * a2[1] - y) < radius) {
      return s;
    }
  }

  return Number.NaN;
};

const closestSynchroDistance = (a1, a2, b1, b2) => {
  const A = a1[0] - b1[0];
  const B = a2[0] - a1[0] - (b2[0] - b1[0]);
  const C = a1[1] - b1[1];
  const D = a2[1] - a1[1] - (b2[1] - b1[1]);

  if (B == 0 && D == 0) {
    return 0;
  }

  return -(A * B + C * D) / (B * B + D * D);
};

const wrapRadianAngle = angle => {
  return (angle + Math.PI) % (2 * Math.PI) - Math.PI;
};

const getPlanetAngleMultiplier = (orient, vel) => {
  let diff = Math.abs((orient - vel + Math.PI) % (2 * Math.PI));

  if (Math.abs(diff) > Math.PI) {
    diff = 2 * Math.PI - Math.PI;
  }

  const sc = diff / Math.PI;
  return 1 + sc;
};

const withinBoundingSquare = (x, y, center, d) => {
  return Math.min(Math.abs(x - center), Math.abs(y - center)) <= d;
};

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c];

const rotatePointOffset = (s, c, x, y, xo, yo) => [xo + x * c - y * s, yo + x * s + y * c];

const getShipPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0, +2, ship.posX, ship.posY), rotatePointOffset(s, c, +1.5, -2, ship.posX, ship.posY), rotatePointOffset(s, c, 0, -1.25, ship.posX, ship.posY), rotatePointOffset(s, c, -1.5, -2, ship.posX, ship.posY)];
};

const getCollisionPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0, +2.6, ship.posX, ship.posY), rotatePointOffset(s, c, +1.87, -2.6, ship.posX, ship.posY), rotatePointOffset(s, c, -1.87, -2.6, ship.posX, ship.posY)];
};

const getThrusterPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0, -1.25, ship.posX, ship.posY), rotatePointOffset(s, c, +0.75, -1.75, ship.posX, ship.posY), rotatePointOffset(s, c, 0, -3.75, ship.posX, ship.posY), rotatePointOffset(s, c, -0.75, -1.75, ship.posX, ship.posY), rotatePointOffset(s, c, 0, -2.75, ship.posX, ship.posY)];
};

module.exports = {
  pointInTriangle,
  rotatePoint,
  lineIntersectsLine,
  lineIntersectCircleFirstDepth,
  closestSynchroDistance,
  lineIntersectsTriangle,
  wrapRadianAngle,
  withinBoundingSquare,
  getPlanetAngleMultiplier,
  getShipPoints,
  getCollisionPoints,
  getThrusterPoints
};

/***/ }),

/***/ "./src/utils/lcg.js":
/*!**************************!*\
  !*** ./src/utils/lcg.js ***!
  \**************************/
/***/ ((module) => {

const LCG_A = 535426113;
const LCG_C = 2258250855;
const SC = 2.0 ** -30;

class Generator {
  constructor(seed) {
    this.seed = seed & 0xFFFFFFFF;
  }

  reseed(seed) {
    this.seed = seed & 0xFFFFFFFF;
  }

  randomInt() {
    const val = this.seed;
    this.seed = LCG_A * val + LCG_C & 0xFFFFFFFF;
    return val;
  }

  random() {
    return (this.randomInt() & 0x3FFFFFFF) * SC;
  }

  randomOffset() {
    return 2 * this.random() - 1;
  }

  randomSign() {
    return 2 * (this.randomInt() & 1) - 1;
  }

}

module.exports = Generator;

/***/ }),

/***/ "./src/utils/maths.js":
/*!****************************!*\
  !*** ./src/utils/maths.js ***!
  \****************************/
/***/ ((module) => {

const randomSign = () => {
  return 2 * (2 * Math.random() | 0) - 1;
};

module.exports = {
  randomSign
};

/***/ }),

/***/ "./src/utils/serial.js":
/*!*****************************!*\
  !*** ./src/utils/serial.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const shipFields = (__webpack_require__(/*! ../game/ship */ "./src/game/ship.js").fields);

const bulletFields = (__webpack_require__(/*! ../game/bullet */ "./src/game/bullet.js").fields);

const powerupFields = (__webpack_require__(/*! ../game/powerup */ "./src/game/powerup.js").fields);

const serializeFrom = (object, fields) => fields.map(field => object[field]);

const deserializeFrom = (array, fields) => {
  const object = {};

  for (let i = 0; i < array.length; ++i) {
    object[fields[i]] = array[i];
  }

  return object;
};

const serializeBullet = obj => serializeFrom(obj, bulletFields);

const deserializeBullet = arr => deserializeFrom(arr, bulletFields);

const serializePowerup = obj => serializeFrom(obj, powerupFields);

const deserializePowerup = arr => deserializeFrom(arr, powerupFields);

const serializeShip = obj => serializeFrom(obj, shipFields);

const deserializeShip = arr => deserializeFrom(arr, shipFields);
/*const encode = (data) => pson.encode(data)
const decode = (data) => pson.decode(data)
const recv = (data) => ByteBuffer.wrap(data)
const send = (ws, data) => ws.send(data.buffer)*/

/*
const encode = (data) => JSON.stringify(data)
const decode = (data) => JSON.parse(data)
const recv = (data) => data
const send = (ws, data) => ws.send(data)
*/


const C_ping = 0;
const C_join = 1;
const C_ctrl = 2;
const C_quit = 3;
const C_useitem = 4;
const C_pong = 128;
const C_token = 129;
const C_data = 130;
const C_board = 131;
const C_killship = 132;
const C_killproj = 133;
const C_orient = 134;
const C_unauth = 135;
const C_addpup = 136;
const C_delpup = 137;
const C_minexpl = 138;
const C_deathk = 139;
const C_deathc = 140;
const C_deathp = 141;
const C_crashed = 192;
const C_killed = 193;
const C_hitpl = 194;
const keyDictionary = {
  'cmd': 0,
  'token': 1,
  'you': 2,
  'ships': 3,
  'projs': 4,
  'count': 5,
  'rubber': 6,
  'seed': 7,
  'board': 8,
  'ship': 9,
  'proj': 10,
  'orient': 11,
  'nick': 12,
  'perk': 13,
  'time': 14,
  'angle': 15,
  'accel': 16,
  'brake': 17,
  'firing': 18,
  'powerup': 19,
  'by': 20
};
const reverseKeyDictionary = {};

for (const key of Object.keys(keyDictionary)) {
  reverseKeyDictionary[keyDictionary[key]] = key;
}

const encodeKeys = data => {
  const result = {};

  for (const key of Object.keys(data)) {
    const encoded = keyDictionary[key];
    if (encoded === undefined) result[key] = data[key];else result[encoded] = data[key];
  }

  return result;
};

const decodeKeys = data => {
  const result = {};

  for (const key of Object.keys(data)) {
    const decoded = reverseKeyDictionary[key];
    if (decoded === undefined) result[key] = data[key];else result[decoded] = data[key];
  }

  return result;
};

const encode = data => JSON.stringify(encodeKeys(data));

const decode = data => decodeKeys(JSON.parse(data));

const recv = data => data;

const send = (ws, data) => ws.send(data); // token: string


const e_token = token => encode({
  cmd: C_token,
  token: token
}); // ship: Ship, nearbyShips: Ship[], addBullets: Bullet[],
// playerCount: number, rubberRadius: number, planetSeed: number


const e_data = (ship, nearbyShips, addBullets, playerCount, rubberRadius, planetSeed) => encode({
  cmd: C_data,
  you: serializeShip(ship),
  ships: nearbyShips.map(serializeShip),
  projs: addBullets.map(serializeBullet),
  count: playerCount,
  rubber: rubberRadius,
  seed: planetSeed
});

const e_unauth = () => encode({
  cmd: C_unauth
}); // board: [[name, score], ...]


const e_board = b => encode({
  cmd: C_board,
  board: b
}); // shipId: string


const e_killship = shipId => encode({
  cmd: C_killship,
  ship: shipId
}); // projId: string


const e_killproj = projId => encode({
  cmd: C_killproj,
  proj: projId
}); // name: string


const e_crashed = name => encode({
  cmd: C_crashed,
  ship: name
}); // name: string


const e_killed = name => encode({
  cmd: C_killed,
  ship: name
}); // orient: number


const e_orient = orient => encode({
  cmd: C_orient,
  orient: orient
});

const e_hitpl = () => encode({
  cmd: C_hitpl
}); // join: string, perk: string


const e_join = (nick, perk) => encode({
  cmd: C_join,
  nick: nick,
  perk: perk
}); // time: number


const e_ping = time => encode({
  cmd: C_ping,
  time: time
}); // time: number


const e_pong = time => encode({
  cmd: C_pong,
  time: time
}); // token: string


const e_quit = token => encode({
  cmd: C_quit,
  token: token
}); // token: string, orient: number, accel: boolean, brake: boolean, firing: boolean


const e_ctrl = (token, orient, accel, brake, firing) => encode({
  cmd: C_ctrl,
  token: token,
  angle: orient,
  accel: accel,
  brake: brake,
  firing: firing
}); // powerup: Powerup


const e_addpup = powerup => encode({
  cmd: C_addpup,
  powerup: serializePowerup(powerup)
}); // id: string


const e_delpup = id => encode({
  cmd: C_delpup,
  powerup: id
}); // token: string


const e_useitem = token => encode({
  cmd: C_useitem,
  token: token
}); // mine: Bullet


const e_minexpl = mine => encode({
  cmd: C_minexpl,
  proj: serializeBullet(mine)
}); // ship: string, by: string


const e_deathk = (ship, by) => encode({
  cmd: C_deathk,
  ship,
  by
}); // ship: string, by: string


const e_deathc = (ship, by) => encode({
  cmd: C_deathc,
  ship,
  by
}); // ship: string, by: string


const e_deathp = ship => encode({
  cmd: C_deathp,
  ship
});

const is_ctrl = obj => obj.cmd === C_ctrl;

const is_join = obj => obj.cmd === C_join;

const is_ping = obj => obj.cmd === C_ping;

const is_pong = obj => obj.cmd === C_pong;

const is_quit = obj => obj.cmd === C_quit;

const is_token = obj => obj.cmd === C_token;

const is_data = obj => obj.cmd === C_data;

const is_board = obj => obj.cmd === C_board;

const is_killship = obj => obj.cmd === C_killship;

const is_killproj = obj => obj.cmd === C_killproj;

const is_crashed = obj => obj.cmd == C_crashed;

const is_killed = obj => obj.cmd == C_killed;

const is_hitpl = obj => obj.cmd == C_hitpl;

const is_orient = obj => obj.cmd == C_orient;

const is_unauth = obj => obj.cmd == C_unauth;

const is_addpup = obj => obj.cmd == C_addpup;

const is_delpup = obj => obj.cmd == C_delpup;

const is_useitem = obj => obj.cmd == C_useitem;

const is_minexpl = obj => obj.cmd == C_minexpl;

const is_deathk = obj => obj.cmd == C_deathk;

const is_deathc = obj => obj.cmd == C_deathc;

const is_deathp = obj => obj.cmd == C_deathp;

module.exports = {
  encode,
  decode,
  recv,
  send,
  e_token,
  e_data,
  e_unauth,
  e_board,
  e_killship,
  e_killproj,
  e_crashed,
  e_killed,
  e_orient,
  e_hitpl,
  e_join,
  e_ping,
  e_pong,
  e_ctrl,
  e_quit,
  e_addpup,
  e_delpup,
  e_useitem,
  e_minexpl,
  e_deathk,
  e_deathc,
  e_deathp,
  is_ctrl,
  is_join,
  is_ping,
  is_pong,
  is_quit,
  is_token,
  is_data,
  is_board,
  is_killship,
  is_killproj,
  is_crashed,
  is_killed,
  is_hitpl,
  is_orient,
  is_unauth,
  is_addpup,
  is_delpup,
  is_useitem,
  is_minexpl,
  is_deathk,
  is_deathc,
  is_deathp,
  serializeFrom,
  deserializeFrom,
  deserializeShip,
  deserializeBullet,
  deserializePowerup
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./js/main.js ***!
  \********************/
const Cookies = __webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/dist/js.cookie.js");

const serial = __webpack_require__(/*! ../src/utils/serial */ "./src/utils/serial.js");

const physics = __webpack_require__(/*! ../src/game/physics */ "./src/game/physics.js");

const chron = __webpack_require__(/*! ../src/utils/chron */ "./src/utils/chron.js");

const here = document.location;
const tps = physics.TICKS_PER_SECOND;
const TURN_UNIT = 2 * Math.PI / tps;
const BASE_SELF = {
  dead: true,
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0,
  orient: 0,
  speedMul: 1
};
const ZOOM_LEVELS = [1.0, 1.5, 2.0];
const canvas = document.getElementById('screen');

const common = __webpack_require__(/*! ./common */ "./js/common.js");

const cursor = __webpack_require__(/*! ./cursor */ "./js/cursor.js");

let inGame = false;
let ws = null;
let self = BASE_SELF;
let connectTimer = null;
let objects = {
  ships: [],
  bullets: [],
  powerups: [],
  planets: []
};
let state = {
  dead: false,
  token: null,
  mouseLocked: false
};
let tpf = 1;
let count = 1;
let leaderboard = [];
let rubber = 150;
let no_data = 0;
let pinger = null;
let seed = 0;
let zoom = 1;
let last_partial = null;
let resendCtrl = false;

const draw = __webpack_require__(/*! ./draw */ "./js/draw.js")(canvas, self, objects, state, cursor);

const controls = __webpack_require__(/*! ./controls */ "./js/controls.js")(canvas, self, state, cursor, {
  useItem: () => useItem(),
  resendControls: () => resendCtrl = true,
  tryLockMouse: e => tryLockMouse(e),
  nextZoom: () => nextZoom()
});

const joystick = __webpack_require__(/*! ./joystick */ "./js/joystick.js")(self, state, controls);

let ui;
draw.checkSize();

const updateZoomText = () => {
  ui.updateZoomText(zoom);
  draw.checkSize();
};

const setZoom = z => {
  zoom = z;
  draw.setZoom(z);
  updateZoomText();
};

const nextZoom = () => {
  let indx = (ZOOM_LEVELS.indexOf(zoom) + 1) % ZOOM_LEVELS.length;

  if (indx < 0) {
    indx += ZOOM_LEVELS.length;
  }

  Cookies.set('avaruuspeli-zoom', indx, {
    sameSite: 'strict'
  });
  setZoom(ZOOM_LEVELS[indx]);
};

const disconnect = () => {
  ui.disconnect();
  leaveGame();
};

const joinGame = () => {
  if (!inGame) {
    ui.joiningGame();
    ui.hideDialog();
    connectTimer = setTimeout(() => disconnect(), 5000);
    let wsproto = here.protocol.replace('http', 'ws');
    let port = here.port;

    if (port) {
      port = `:${port}`;
    }

    ws = new WebSocket(`${wsproto}//${here.hostname}${port}${here.pathname}`);
    inGame = true;
    ws.addEventListener('message', e => {
      const obj = serial.decode(serial.recv(e.data));

      if (serial.is_token(obj)) {
        ui.updateOnlineStatus('in game');
        state.token = obj.token;
      } else if (serial.is_pong(obj)) {
        const now = performance.now();
        ui.updateOnlineStatus(`in game, ping: ${Math.max(now - obj.time, 0).toFixed(1)}ms`);
      } else if (serial.is_data(obj)) {
        no_data = 0;
        let you = null;
        let ships = [];
        let projs = null;
        let oldHealth = {};

        for (const ship of objects.ships) {
          oldHealth[ship._id] = ship.health;
        }

        ({
          you,
          ships,
          projs,
          count,
          rubber,
          seed
        } = obj);
        you = serial.deserializeShip(you);
        ships = ships.map(serial.deserializeShip);
        projs = projs.map(serial.deserializeBullet);
        draw.setRubber(rubber);
        objects.ships = ships;

        for (const ship of ships) {
          if (Object.prototype.hasOwnProperty.call(oldHealth, ship._id) && oldHealth[ship._id] > ship.health) {
            draw.addBubble({
              x: ship.posX,
              y: ship.posY,
              alpha: 100,
              radius: 0.3 * (1 + oldHealth[ship._id] - ship.health)
            });
          }
        }

        if (self.dead) {
          Object.assign(self, you);
          state.dead = self.dead = false;
        } else {
          if (Math.abs(you.posX - self.posX) > 0.3) {
            self.posX = (self.posX + you.posX) / 2;
            self.velX = (self.velX + you.velX) / 2;
          }

          if (Math.abs(you.posY - self.posY) > 0.3) {
            self.posY = (self.posY + you.posY) / 2;
            self.velY = (self.velY + you.velY) / 2;
          }

          if (Math.abs(you.velX - self.velX) > 0.2) {
            self.velX = you.velX;
          }

          if (Math.abs(you.velY - self.velY) > 0.2) {
            self.posY = you.posY;
          }

          if (controls.isAccelerating() !== (you.accel !== null) || controls.isBraking() !== (you.brake !== null)) {
            resendCtrl = true;
          }

          ui.updateScore(you.score, self.score);
          self.name = you.name;
          self.score = you.score;
          state.dead = self.dead = you.dead;

          if (you.health < self.health) {
            draw.gotDamage(self.health - you.health);
            draw.addBubble({
              x: self.posX,
              y: self.posY,
              alpha: 100,
              radius: 0.3 * (1 + self.health - you.health)
            });
          }

          self.health = you.health;
          self.latched = you.latched;
          self.speedMul = you.speedMul;
          self.item = you.item;
          self.regen = you.regen;
          self.overdrive = you.overdrive;
          self.rubbership = you.rubbership;
        }

        if (physics.getPlanetSeed() != seed) {
          physics.setPlanetSeed(seed);
          objects.planets = physics.getPlanets(self.posX, self.posY);
        }

        if (projs.length) {
          objects.bullets = [...objects.bullets, ...projs.filter(x => x)];
        }

        ui.updatePowerup(self, state);
        physics.setPlanetSeed(seed);
        ui.updatePlayerCount(count);
        ui.updateHealthBar(self.health);
      } else if (serial.is_board(obj)) {
        leaderboard = obj.board;
        ui.updateLeaderboard(leaderboard);
      } else if (serial.is_orient(obj)) {
        self.orient = obj.orient;
      } else if (serial.is_unauth(obj)) {
        disconnect();
      } else if (serial.is_killed(obj)) {
        draw.explosion(self, tpf);
        leaveGame();
        ui.defeatedByPlayer(obj.ship);
      } else if (serial.is_crashed(obj)) {
        draw.explosion(self, tpf);
        leaveGame();
        ui.defeatedByCrash(obj.ship);
      } else if (serial.is_hitpl(obj)) {
        draw.explosion(self, tpf);
        leaveGame();
        ui.defeatedByPlanet(obj.ship);
      } else if (serial.is_killship(obj)) {
        const matching = objects.ships.find(ship => ship._id === obj.ship);

        if (matching !== null) {
          draw.explosion(matching, tpf);
        }

        objects.ships = objects.ships.filter(ship => ship._id !== obj.ship);
      } else if (serial.is_killproj(obj)) {
        objects.bullets = objects.bullets.filter(bullet => bullet._id !== obj.proj);
      } else if (serial.is_minexpl(obj)) {
        const mine = serial.deserializeBullet(obj.mine);
        draw.addBubble({
          x: mine.posX,
          y: mine.posY,
          alpha: 200,
          radius: 1
        });
      } else if (serial.is_addpup(obj)) {
        objects.powerups.push(serial.deserializePowerup(obj.powerup));
        ui.showPowerupAnimation();
      } else if (serial.is_delpup(obj)) {
        objects.powerups = objects.powerups.filter(powerup => powerup._id !== obj.powerup);
      } else if (serial.is_deathk(obj)) {
        ui.addDeathLog(`${obj.ship} was killed by ${obj.by}`);
      } else if (serial.is_deathc(obj)) {
        ui.addDeathLog(`${obj.ship} crashed into ${obj.by}`);
      } else if (serial.is_deathp(obj)) {
        ui.addDeathLog(`${obj.ship} crashed into a planet`);
      }
    });
    ws.addEventListener('open', () => {
      state.dead = false;

      if (connectTimer !== null) {
        clearTimeout(connectTimer);
        connectTimer = null;
      }

      let nick = document.getElementById('nick').value.trim();
      const perk = document.getElementById('perkselect').value.trim();

      if (nick.length < 1) {
        nick = (100000000 * Math.random() | 0).toString();
      } else {
        Cookies.set('avaruuspeli-name', nick);
      }

      Cookies.set('avaruuspeli-perk', perk);
      ui.updateOnlineStatus('waiting for spawn');
      serial.send(ws, serial.e_join(nick, perk));
      draw.checkSize();
      ui.updateControls(state);
      joystick.resetJoystickCenter();
      pinger = setInterval(() => {
        if (++no_data > 8 || ws == null) {
          disconnect();
          return;
        }

        serial.send(ws, serial.e_ping(performance.now()));
      }, 500);
    });
    ws.addEventListener('close', () => {
      if (!state.dead) {
        disconnect();
      }

      state.dead = true;
    });
  }
};

const leaveGame = () => {
  if (pinger !== null) {
    clearInterval(pinger);
    pinger = null;
  }

  if (ws !== null) {
    ws.close();
  }

  if (state.mouseLocked) {
    document.exitPointerLock();
  }

  state.token = null;
  state.dead = self.dead = true;
  ws = null;
  inGame = false;
  objects.ships = [];
  objects.bullets = [];
  objects.powerups = [];
  draw.reset();
  controls.reset();
  ui.updateOnlineStatus('offline');
  ui.showDialog();
  draw.checkSize();
  ui.updateControls(state);
};

const serverTick = () => {
  if (!ws || !self) {
    self.velX *= 0.95;
    self.velY *= 0.95;
    return;
  }

  if (!state.token) {
    return;
  }

  if (resendCtrl) {
    serial.send(ws, serial.e_ctrl(state.token, self.orient, controls.isAccelerating(), controls.isBraking(), controls.isFiring()));
    resendCtrl = false;
  }

  if (controls.isAccelerating()) {
    physics.accel(self, chron.timeMs() - self.accel);
  }

  if (controls.isBraking()) {
    physics.brake(self);
  }

  if (controls.isFiring() && self.fireWaitTicks <= 0 && !self.latched) {
    physics.recoil(self);
  }

  physics.inertia(self);

  if (!self.latched) {
    physics.rubberband(self, rubber);
    objects.planets = physics.getPlanets(self.posX, self.posY);
    physics.gravityShip(self, objects.planets);
  }

  for (const ship of objects.ships) {
    if (!ship.latched) {
      physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY));
    }
  }

  for (const bullet of objects.bullets) {
    if (bullet.type !== 'mine') {
      physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY));
    }
  }

  ui.updateColors(self.health, performance.now());
};

setInterval(serverTick, physics.MS_PER_TICK);
let turnLeftRamp = 0;
let turnRightRamp = 0;

const partialTick = delta => {
  tpf = 1.0 * delta / physics.MS_PER_TICK;

  if (!self.latched) {
    // turning
    const turnLeft = controls.isTurningLeft();
    const turnRight = controls.isTurningRight();

    if (turnLeft && !turnRight) {
      self.orient -= turnLeftRamp * TURN_UNIT * tpf;
      turnLeftRamp = Math.min(1, turnLeftRamp + tpf * 0.1);
      physics.onTurn(self, chron.timeMs());
      resendCtrl = true;
    } else if (turnRight && !turnLeft) {
      self.orient += turnRightRamp * TURN_UNIT * tpf;
      turnRightRamp = Math.min(1, turnRightRamp + tpf * 0.1);
      physics.onTurn(self, chron.timeMs());
      resendCtrl = true;
    }

    if (!turnLeft) turnLeftRamp = 0;
    if (!turnRight) turnRightRamp = 0;
  } else {
    turnLeftRamp = 0;
    turnRightRamp = 0;
  } // interpolate


  self.posX += tpf * self.velX;
  self.posY += tpf * self.velY;

  for (const ship of objects.ships) {
    ship.posX += tpf * ship.velX;
    ship.posY += tpf * ship.velY;
  }

  for (const bullet of objects.bullets) {
    if (bullet.type == 'bullet' || bullet.type == 'laser') {
      bullet.posX += tpf * bullet.velX;
      bullet.posY += tpf * bullet.velY;
      bullet.dist += tpf * bullet.velocity;
    } else if (bullet.type == 'mine') {
      bullet.dist += tpf / (physics.TICKS_PER_SECOND * physics.MINE_LIFETIME);
    }
  }

  objects.bullets = objects.bullets.filter(b => b.dist <= physics.MAX_BULLET_DISTANCE);
};

const useItem = () => {
  if (self.item !== null) {
    serial.send(ws, serial.e_useitem(state.token));
    self.item = null;
  }
};

const tryLockMouse = e => {
  if (common.isMobile()) {
    return;
  }

  cursor.setPosition(e.clientX, e.clientY);
  canvas.requestPointerLock();
};

window.addEventListener('blur', () => {
  if (!state.token || state.dead) {
    return;
  }

  controls.unpress();
}, true);
window.addEventListener('beforeupload', () => {
  serial.send(ws, serial.e_quit(state.token));
}, true);

const tryReadCookies = () => {
  const name = Cookies.get('avaruuspeli-name');

  if (name) {
    document.getElementById('nick').value = name.substring(0, 20).trim();
  }

  const perk = Cookies.get('avaruuspeli-perk');

  if (perk) {
    document.getElementById('perkselect').value = '';

    for (let i = 0; i < document.getElementById('perkselect').options.length; ++i) {
      const option = document.getElementById('perkselect').options[i];

      if (option.value == perk) {
        option.selected = true;
        break;
      }
    }
  }

  const cookieZoom = Cookies.get('avaruuspeli-zoom') | 0;

  if (isFinite(cookieZoom)) {
    setZoom(ZOOM_LEVELS[cookieZoom % ZOOM_LEVELS.length]);
  }
};

const frame = time => {
  let delta = 0;

  if (last_partial != null) {
    delta = time - last_partial;
    partialTick(delta);
    ui.updateOpacity(delta);
  }

  last_partial = time;
  draw.frame(time, delta);
  window.requestAnimationFrame(frame);
};

window.requestAnimationFrame(frame);
ui = __webpack_require__(/*! ./ui */ "./js/ui.js")({
  joinGame,
  tryLockMouse,
  nextZoom
});
leaveGame();
updateZoomText();
ui.hideLose();
tryReadCookies();
})();

/******/ })()
;
//# sourceMappingURL=main.bundle.js.map