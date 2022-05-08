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
        const interval = 320 ** (self.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(self.velX, self.velY) / 4);

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
          const interval = 320 ** (ship.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(ship.velX, ship.velY) / 4);

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

/***/ "./js/tick.js":
/*!********************!*\
  !*** ./js/tick.js ***!
  \********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const physics = __webpack_require__(/*! ../src/game/physics */ "./src/game/physics.js");

const chron = __webpack_require__(/*! ../src/utils/chron */ "./src/utils/chron.js");

module.exports = (self, objects, controls) => {
  const serverTick = rubber => {
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
  };

  return {
    serverTick
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
  const DEBUG = false;
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

  const updateDebugInfo = text => {
    if (!DEBUG) return;
    document.getElementById('debuginfo').textContent = text;
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
  document.getElementById('btnhelp').addEventListener('click', () => {
    document.getElementById('gamehelp').style.display = 'block';
  });
  document.getElementById('btnclosehelp').addEventListener('click', () => {
    document.getElementById('gamehelp').style.display = 'none';
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
  if (!DEBUG) document.getElementById('debuginfo').style.display = 'none';
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
    updateDebugInfo,
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

    if (shooter && shooter.absorber) {
      shooter.health += 0.01 * shooter.healthMul;
    }

    ships.damageShip(ship, BULLET_DAMAGE_MULTIPLIER * bullet.damage, bullet, shooter, handler.killShipByBullet);

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
            const t = geom.closestSynchroDistance([ship.posX, ship.posY], [ship.posXnew, ship.posYnew], [bullet.posX, bullet.posY], [newX, newY]);

            if (0 <= t && t <= 1) {
              ship.posX = geom.lerp1D(ship.posX, t, ship.posXnew);
              ship.posY = geom.lerp1D(ship.posY, t, ship.posYnew);
              const [p1, p2, p3] = geom.getCollisionPoints(ship);

              if (geom.lineIntersectsTriangle([bullet.posX, bullet.posY], [newX, newY], p1, p2, p3)) {
                collisionShip = ship;
                break;
              }
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
            if (bullet.shooter === ship._id) return;

            if (Math.abs(ship.posX - bullet.posX) > 15 || Math.abs(ship.posY - bullet.posY) > 15) {
              return;
            }

            let damage = 2 / Math.sqrt(Math.hypot(ship.posX - bullet.posX, ship.posY - bullet.posY));

            if (damage < 0.05) {
              damage = 0;
            }

            const shooter = ships.getShipById(bullet.shooter);
            ships.damageShip(ship, damage, bullet, shooter, handler.killShipByBullet);
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
      velocity: physics.BULLET_VELOCITY * ship.bulletSpeedMul * speedFactor + Math.hypot(ship.velX, ship.velY),
      velX: typeSpeedMul * physics.BULLET_VELOCITY * Math.sin(-ship.orient + orientOffset) * ship.bulletSpeedMul + ship.velX,
      velY: typeSpeedMul * physics.BULLET_VELOCITY * Math.cos(-ship.orient + orientOffset) * ship.bulletSpeedMul + ship.velY,
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
const TICKS_PER_SECOND = 25;
const MS_PER_TICK = 1000 / TICKS_PER_SECOND;
const MAX_SHIP_VELOCITY = 64 / TICKS_PER_SECOND;
const ACTUAL_MAX_SHIP_VELOCITY = MAX_SHIP_VELOCITY * 2.5;
const MIN_SHIP_VELOCITY = 0.01;
const LATCH_VELOCITY = 0.33;
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 1.75;
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 1.5));
const VIEW_DISTANCE = 55;
const MAX_BULLET_DISTANCE = 75;
const RUBBERBAND_BUFFER = 80;
const RUBBERBAND_RADIUS_MUL = 80;
const MINE_LIFETIME = 120;
const INERTIA_MUL = 1; // (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))

const LCG = __webpack_require__(/*! ../utils/lcg */ "./src/utils/lcg.js");

const geom = __webpack_require__(/*! ../utils/geom */ "./src/utils/geom.js");

const PLANET_CHUNK_SIZE = VIEW_DISTANCE * 1.6 + 1;
const lcg = new LCG(0);
let PLANET_SEED = 1340985553;

const getAccelMul = accelTimeMs => {
  // time in milliseconds
  return 0.0875 + 0.000025 * Math.min(accelTimeMs, 2500);
};

const checkMinVelocity = ship => {
  const v = Math.hypot(ship.velX, ship.velY);

  if (v <= MIN_SHIP_VELOCITY) {
    ship.velX = 0;
    ship.velY = 0;
  }
};

const checkMaxVelocity = ship => {
  const maxvel = ACTUAL_MAX_SHIP_VELOCITY * healthToVelocity(ship.health) * ship.speedMul;
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
  let accelMul = getAccelMul(accelTimeMs) * healthToVelocity(ship.health) * ship.thrustBoost * (hasOverdrive(ship) ? 2 : 1) * (ship.highAgility ? 1.33 : 1);

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

    if (d > planet.radius + 1 && d < 10 + planet.radius * 4) {
      const dx = planet.x - bullet.posX;
      const dy = planet.y - bullet.posY;
      const r2 = Math.hypot(dx, dy) ** 2;
      const f = GRAV * 1.5e+10 / r2 * planet.radius;
      bullet.velX += f * dx;
      bullet.velY += f * dy;
    }
  }

  const d = Math.hypot(bullet.velX, bullet.velY);
  bullet.velX *= bullet.velocity / d;
  bullet.velY *= bullet.velocity / d;
};

const gravityShip = (ship, planets) => {
  let thrust = 1;
  const vector = [Math.sin(-ship.orient), Math.cos(-ship.orient)];
  const dv = Math.hypot(ship.velX, ship.velY);

  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y);

    if (d > planet.radius + 1.5 + dv * 0.3 && d < 10 + planet.radius * 4) {
      const dx = planet.x - ship.posX;
      const dy = planet.y - ship.posY;
      const r2 = Math.hypot(dx, dy) ** 2;
      const f = GRAV * 1e+9 * planet.radius / r2 / (ship.accel !== null || ship.brake !== null ? 5 : 1);
      ship.velX += f * dx;
      ship.velY += f * dy;

      if (ship.accel !== null) {
        const direction = geom.normalize(dx, dy);
        thrust += 3 * Math.min(1, dv / MAX_SHIP_VELOCITY) ** 0.5 * (1000 * Math.max(0, f * (direction[0] * vector[0] + direction[1] * vector[1]))) ** 1.5;
      }
    }
  }

  ship.thrustBoost = thrust;
  checkMaxVelocity(ship);
};

const getRubberbandRadius = playerCount => {
  return RUBBERBAND_RADIUS_MUL * Math.pow(Math.max(playerCount, 1), 0.75);
};

const rubberband = (ship, radius) => {
  const distCenter = Math.hypot(ship.posX, ship.posY);

  if (distCenter > radius) {
    const maxRadius = radius + RUBBERBAND_BUFFER;
    const baseX = -ship.posX / Math.hypot(ship.posX, ship.posY);
    const baseY = -ship.posY / Math.hypot(ship.posX, ship.posY);
    const d = (distCenter - radius) / (maxRadius - radius);
    ship.velX += baseX * 0.3 * MAX_SHIP_VELOCITY * (1.1 * d) ** 8;
    ship.velY += baseY * 0.3 * MAX_SHIP_VELOCITY * (1.1 * d) ** 8;
    const v = Math.hypot(ship.velX, ship.velY);

    if (v > MAX_SHIP_VELOCITY) {
      const nv = geom.lerp1D(v, 0.05, MAX_SHIP_VELOCITY);
      ship.velX *= nv / v;
      ship.velY *= nv / v;
    }

    checkMaxVelocity(ship);
  }
};

const healthToVelocity = health => {
  return 0.7 + 0.3 * health;
};

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  ACTUAL_MAX_SHIP_VELOCITY,
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

  const clear = () => powerups = {};

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
    clear,
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
const SHIP_RECT_RADIUS = 2;
const SHIP_RADIUS = 1.35;

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
  thrustBoost: 1,
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
  lastDamageAt: null,
  lastDamageBy: null,
  dead: false,
  _id: shipCounter.next()
});

const shipFields = ['_id', 'dead', 'posX', 'posY', 'velX', 'velY', 'orient', 'health', 'name', 'score', 'accel', 'brake', 'firing', 'latched', 'fireWaitTicks', 'thrustBoost', 'firingInterval', 'bulletSpeedMul', 'healthMul', 'speedMul', 'planetDamageMul', 'highAgility', 'absorber', 'healRate', 'item', 'rubbership', 'regen', 'overdrive'];

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

  const premoveShips = delta => {
    const shipList = getShips();
    const shipCount = shipList.length;

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i];
      ship1.posXnew = ship1.posX + delta * ship1.velX;
      ship1.posYnew = ship1.posY + delta * ship1.velY;
    }
  };

  const moveShips = (delta, powerups) => {
    const shipList = getShips();
    const powerupList = powerups.getPowerups();
    const shipCount = shipList.length;
    const powerupCount = powerupList.length;
    const dist = physics.ACTUAL_MAX_SHIP_VELOCITY + 1;

    for (let i = 0; i < shipCount; ++i) {
      const ship1 = shipList[i];

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

          if (0 <= t && t <= 1) {
            ship1.posX = ship1.posX + t * delta * ship1.velX;
            ship1.posY = ship1.posY + t * delta * ship1.velY;
            ship2.posX = ship2.posX + t * delta * ship2.velX;
            ship2.posY = ship2.posY + t * delta * ship2.velY;
            testShipShipCollision(ship1, ship2);
          }
        }
      }

      const planets = physics.getPlanets(ship1.posX, ship1.posY);

      for (let j = 0; j < planets.length; ++j) {
        const planet = planets[j];
        const search = planet.radius + SHIP_RADIUS;
        const searchSquare = search ** 2;
        [ship1.posX, ship1.posY] = geom.lineClosestPointToPoint(ship1.posX, ship1.posY, ship1.posXnew, ship1.posYnew, planet.x, planet.y);

        if (Math.abs(ship1.posX - planet.x) < search && Math.abs(ship1.posY - planet.y) < search) {
          if (maths.squarePair(ship1.posX - planet.x, ship1.posY - planet.y) < searchSquare) {
            if (!ship1.dead) {
              handleShipPlanetCollision(ship1, planet);
            }

            break;
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
    const damage = 0.4 * Math.sqrt(Math.hypot(dx, dy)) / (physics.ACTUAL_MAX_SHIP_VELOCITY / 4);
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
      if (ship2.health > 0) {
        ++ship2.score;
      }

      handler.onShipKilledByCrash(ship1, ship2);
      killShip(ship1);
    }

    if (ship2.health <= 0) {
      if (ship1.health > 0) {
        ++ship1.score;
      }

      handler.onShipKilledByCrash(ship2, ship1);
      killShip(ship2);
    }
  };

  const testShipShipCollision = (ship1, ship2) => {
    if (Math.abs(ship1.posX - ship2.posX) < SHIP_RECT_RADIUS && Math.abs(ship1.posY - ship2.posY) < SHIP_RECT_RADIUS) {
      const [p1, p2, p3] = geom.getCollisionPoints(ship1);
      const [q1, q2,, q4] = geom.getShipPoints(ship2);

      if (geom.testTriangleCollision(p1, p2, p3, q1, q2, q4)) {
        handleShipShipCollision(ship1, ship2);
      }
    }
  };

  const handleShipPlanetCollision = (ship, planet) => {
    const v = Math.hypot(ship.velX, ship.velY);
    let dist = Math.hypot(planet.x - ship.posX, planet.y - ship.posY);
    const d = 1 - dist / (planet.radius - 1);
    const col_mul = geom.getPlanetDamageMultiplier(Math.sin(-ship.orient), Math.cos(-ship.orient), ship.posX - planet.x, ship.posY - planet.y);
    if (!col_mul) return;
    const col_vmul = geom.getPlanetDamageSpeedMultiplier(ship.velX, ship.velY, ship.posX - planet.x, ship.posY - planet.y);
    let damage = Math.max(v * col_mul * col_vmul, d) / physics.MAX_SHIP_VELOCITY * ship.planetDamageMul * (physics.hasRubbership(ship) ? 0 : 1);

    if (!ship.accel && v > 0 && v * col_mul < physics.LATCH_VELOCITY * (ship.brake !== null ? 1.75 : 1)) {
      latchToPlanet(ship, planet);
      return;
    }

    if (col_mul < 0.2 && ship.accel !== null) {
      damage *= 0.2;
    }

    let offx = ship.posX - planet.x;
    let offy = ship.posY - planet.y;
    [offx, offy] = geom.normalize(offx, offy);
    const radius = planet.radius + SHIP_RADIUS;
    ship.posX = planet.x + offx * (radius + 0.5);
    ship.posY = planet.y + offy * (radius + 0.5);
    ship.velX = -ship.velX + offx * v * 2;
    ship.velY = -ship.velY + offy * v * 2;
    if (v > 0) [ship.velX, ship.velY] = geom.normalize(ship.velX, ship.velY, v);

    if (damage >= 0.05) {
      damageShip(ship, damage, null, null, ship => {
        if (ship.lastDamageAt && chron.timeMs() - ship.lastDamageAt < 2500) {
          const by = getShipById(ship.lastDamageBy);
          if (by) ++by.score;
        }

        handler.onShipKilledByPlanet(ship);
        killShip(ship);
      });
    }

    if (ship.dead) {
      return;
    }

    dist = Math.hypot(planet.x - ship.posX, planet.y - ship.posY);
    if (planet.radius - dist > 0.25) latchToPlanet(ship, planet);
    /*if (!physics.hasRubbership(ship) && damage < 0.4 && col_mul < 1.7) {
      latchToPlanet(ship, planet)
    }*/
  };

  const deleteShip = ship => {
    ship.dead = true;
    removeShipById(ship._id);
  };

  const damageShip = (ship, damage, bullet, shooter, onDeath) => {
    if (ship.dead) return;
    ship.health -= damage * ship.healthMul;

    if (shooter) {
      ship.lastDamageAt = chron.timeMs();
      ship.lastDamageBy = shooter._id;
    }

    if (ship.health <= 0) {
      if (shooter) {
        ++shooter.score;
      }

      onDeath(ship, bullet);
    }
  };

  const killShip = ship => {
    deleteShip(ship);
    handler.onShipKilled(ship);
  };

  return {
    getShips,
    getShipById,
    getShipCount,
    damageShip,
    removeShipById,
    newPlayerShip,
    premoveShips,
    moveShips,
    killShip,
    deleteShip,
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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const maths = __webpack_require__(/*! ../utils/maths */ "./src/utils/maths.js");

const SHIP_SCALE = 1.1;

const lerp1D = (a, t, b) => {
  return a + t * (b - a);
};

const lerp2D = (a, t, b) => {
  return [lerp1D(a[0], t, b[0]), lerp1D(a[1], t, b[1])];
};

const normalize = (x, y, m) => {
  const d = Math.hypot(x, y);
  m = m || 1;
  return [m * x / d, m * y / d];
};

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

const testTriangleCollisionSub = (a1, a2, a3, b1, b2, b3) => {
  const dax = a1[0] - b3[0],
        day = a1[1] - b3[1];
  const dbx = a2[0] - b3[0],
        dby = a2[1] - b3[1];
  const dcx = a3[0] - b3[0],
        dcy = a3[1] - b3[1];
  const b32x = b3[0] - b2[0];
  const b23y = b2[1] - b3[1];
  const D = b23y * (b1[0] - b3[0]) + b32x * (b1[1] - b3[1]);
  const sa = b23y * dax + b32x * day;
  const sb = b23y * dbx + b32x * dby;
  const sc = b23y * dcx + b32x * dcy;
  const ta = (b3[1] - b1[1]) * dax + (b1[0] - b3[0]) * day;
  const tb = (b3[1] - b1[1]) * dbx + (b1[0] - b3[0]) * dby;
  const tc = (b3[1] - b1[1]) * dcx + (b1[0] - b3[0]) * dcy;
  if (D < 0) return sa >= 0 && sb >= 0 && sc >= 0 || ta >= 0 && tb >= 0 && tc >= 0 || sa + ta <= D && sb + tb <= D && sc + tc <= D;
  return sa <= 0 && sb <= 0 && sc <= 0 || ta <= 0 && tb <= 0 && tc <= 0 || sa + ta >= D && sb + tb >= D && sc + tc >= D;
};

const testTriangleCollision = (a1, a2, a3, b1, b2, b3) => {
  return !(testTriangleCollisionSub(a1, a2, a3, b1, b2, b3) || testTriangleCollisionSub(b1, b2, b3, a1, a2, a3));
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

const lineClosestPointToPoint = (a1, a2, b1, b2, p1, p2) => {
  const v1 = b1 - a1;
  const v2 = b2 - a2;
  const u1 = a1 - p1;
  const u2 = a2 - p2;
  const vu = v1 * u1 + v2 * u2;
  const vv = v1 * v1 + v2 * v2;
  if (vv === 0) return [a1, a2];
  let t = -vu / vv;
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  return lerp2D([a1, a2], t, [b1, b2]);
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

const getPlanetDamageMultiplier = (ox, oy, px, py) => {
  [ox, oy] = normalize(ox, oy);
  [px, py] = normalize(px, py);
  return maths.padFromBelow(0.5, (1 - (ox * px + oy * py)) * 0.5);
};

const getPlanetDamageSpeedMultiplier = (vx, vy, px, py) => {
  if (!(vx || vy)) return 0;
  [vx, vy] = normalize(vx, vy);
  [px, py] = normalize(px, py);
  return maths.padFromBelow(0.5, Math.abs(vx * px + vy * py));
};

const withinBoundingSquare = (x, y, center, d) => {
  return Math.min(Math.abs(x - center), Math.abs(y - center)) <= d;
};

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c];

const rotatePointOffset = (s, c, x, y, xo, yo) => [xo + x * c - y * s, yo + x * s + y * c];

const getShipPoints = ship => {
  const S = SHIP_SCALE;

  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0 * S, +2 * S, ship.posX, ship.posY), rotatePointOffset(s, c, +1.5 * S, -2 * S, ship.posX, ship.posY), rotatePointOffset(s, c, 0 * S, -1.25 * S, ship.posX, ship.posY), rotatePointOffset(s, c, -1.5 * S, -2 * S, ship.posX, ship.posY)];
};

const getCollisionPoints = ship => {
  const S = SHIP_SCALE;

  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0 * S, +2.6 * S, ship.posX, ship.posY), rotatePointOffset(s, c, +1.87 * S, -2.6 * S, ship.posX, ship.posY), rotatePointOffset(s, c, -1.87 * S, -2.6 * S, ship.posX, ship.posY)];
};

const getThrusterPoints = ship => {
  const S = SHIP_SCALE;

  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0 * S, -1.25 * S, ship.posX, ship.posY), rotatePointOffset(s, c, +0.75 * S, -1.75 * S, ship.posX, ship.posY), rotatePointOffset(s, c, 0 * S, -3.75 * S, ship.posX, ship.posY), rotatePointOffset(s, c, -0.75 * S, -1.75 * S, ship.posX, ship.posY), rotatePointOffset(s, c, 0 * S, -2.75 * S, ship.posX, ship.posY)];
};

module.exports = {
  lerp1D,
  lerp2D,
  normalize,
  pointInTriangle,
  rotatePoint,
  testTriangleCollision,
  lineIntersectsLine,
  lineIntersectCircleFirstDepth,
  lineClosestPointToPoint,
  closestSynchroDistance,
  lineIntersectsTriangle,
  wrapRadianAngle,
  withinBoundingSquare,
  getPlanetDamageMultiplier,
  getPlanetDamageSpeedMultiplier,
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

const squarePair = (x, y) => x ** 2 + y ** 2;

const padFromBelow = (p, v) => p + (1 - p) * v;

module.exports = {
  randomSign,
  squarePair,
  padFromBelow
};

/***/ }),

/***/ "./src/utils/serial.js":
/*!*****************************!*\
  !*** ./src/utils/serial.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const msgpackr = __webpack_require__(/*! msgpackr */ "./node_modules/msgpackr/index.js");

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
const C_addpups = 142;
const C_crashed = 192;
const C_killed = 193;
const C_hitpl = 194;

const encode = (cmd, data) => {
  return msgpackr.pack([cmd, ...messageKeys[cmd].map(key => data[key])]);
};

const decode = data => {
  const array = msgpackr.unpack(data);
  const cmd = array[0];
  return [cmd, Object.fromEntries(messageKeys[cmd].map((key, index) => [key, array[index + 1]]))];
};

const recv = data => data;

const send = (ws, data) => ws.send(data);

const messageKeys = {
  [C_token]: ['token'],
  [C_data]: ['you', 'ships', 'projs', 'count', 'rubber', 'seed'],
  [C_unauth]: [],
  [C_board]: ['board'],
  [C_killship]: ['ship'],
  [C_killproj]: ['proj'],
  [C_crashed]: ['ship'],
  [C_killed]: ['ship'],
  [C_orient]: ['orient'],
  [C_hitpl]: [],
  [C_join]: ['nick', 'perk'],
  [C_ping]: ['time'],
  [C_pong]: ['time'],
  [C_quit]: ['token'],
  [C_ctrl]: ['token', 'orient', 'accel', 'brake', 'firing'],
  [C_addpup]: ['powerup'],
  [C_delpup]: ['powerup'],
  [C_useitem]: ['token'],
  [C_minexpl]: ['proj'],
  [C_deathk]: ['ship', 'by'],
  [C_deathc]: ['ship', 'by'],
  [C_deathp]: ['ship'],
  [C_addpups]: ['powerups']
}; // token: string

const e_token = token => encode(C_token, {
  token
}); // you: Ship, ship: Ship[], projs: Bullet[],
// count: number, rubber: number, seed: number


const e_data = (you, ships, projs, count, rubber, seed) => encode(C_data, {
  you: serializeShip(you),
  ships: ships.map(serializeShip),
  projs: projs.map(serializeBullet),
  count,
  rubber,
  seed
});

const e_unauth = () => encode(C_unauth); // board: [[name, score], ...]


const e_board = board => encode(C_board, {
  board
}); // ship: ship


const e_killship = ship => encode(C_killship, {
  ship: serializeShip(ship)
}); // proj: string (id)


const e_killproj = proj => encode(C_killproj, {
  proj
}); // name: string (name)


const e_crashed = ship => encode(C_crashed, {
  ship
}); // name: string (name)


const e_killed = ship => encode(C_killed, {
  ship
}); // orient: number


const e_orient = orient => encode(C_orient, {
  orient
});

const e_hitpl = () => encode(C_hitpl); // join: string, perk: string


const e_join = (nick, perk) => encode(C_join, {
  nick,
  perk
}); // time: number


const e_ping = time => encode(C_ping, {
  time
}); // time: number


const e_pong = time => encode(C_pong, {
  time
}); // token: string


const e_quit = token => encode(C_quit, {
  token
}); // token: string, orient: number, accel: boolean, brake: boolean, firing: boolean


const e_ctrl = (token, orient, accel, brake, firing) => encode(C_ctrl, {
  token,
  orient,
  accel,
  brake,
  firing
}); // powerup: Powerup


const e_addpup = powerup => encode(C_addpup, {
  powerup: serializePowerup(powerup)
}); // powerup: (ID) string


const e_delpup = powerup => encode(C_delpup, {
  powerup
}); // token: string


const e_useitem = token => encode(C_useitem, {
  token
}); // proj: Bullet


const e_minexpl = proj => encode(C_minexpl, {
  proj: serializeBullet(proj)
}); // ship: string, by: string


const e_deathk = (ship, by) => encode(C_deathk, {
  ship,
  by
}); // ship: string, by: string


const e_deathc = (ship, by) => encode(C_deathc, {
  ship,
  by
}); // ship: string, by: string


const e_deathp = ship => encode(C_deathp, {
  ship
}); // powerups: Powerup[]


const e_addpups = powerups => encode(C_addpups, {
  powerups: powerups.map(serializePowerup)
});

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
  e_addpups,
  C_ctrl,
  C_join,
  C_ping,
  C_pong,
  C_quit,
  C_token,
  C_data,
  C_board,
  C_killship,
  C_killproj,
  C_crashed,
  C_killed,
  C_hitpl,
  C_orient,
  C_unauth,
  C_addpup,
  C_delpup,
  C_useitem,
  C_minexpl,
  C_deathk,
  C_deathc,
  C_deathp,
  C_addpups,
  serializeFrom,
  deserializeFrom,
  deserializeShip,
  deserializeBullet,
  deserializePowerup
};

/***/ }),

/***/ "./node_modules/msgpackr/index.js":
/*!****************************************!*\
  !*** ./node_modules/msgpackr/index.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ALWAYS": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.ALWAYS),
/* harmony export */   "C1": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.C1),
/* harmony export */   "DECIMAL_FIT": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.DECIMAL_FIT),
/* harmony export */   "DECIMAL_ROUND": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.DECIMAL_ROUND),
/* harmony export */   "Decoder": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.Decoder),
/* harmony export */   "Encoder": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.Encoder),
/* harmony export */   "FLOAT32_OPTIONS": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.FLOAT32_OPTIONS),
/* harmony export */   "NEVER": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.NEVER),
/* harmony export */   "Packr": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.Packr),
/* harmony export */   "REUSE_BUFFER_MODE": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.REUSE_BUFFER_MODE),
/* harmony export */   "Unpackr": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.Unpackr),
/* harmony export */   "addExtension": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.addExtension),
/* harmony export */   "clearSource": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.clearSource),
/* harmony export */   "decode": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.decode),
/* harmony export */   "decodeIter": () => (/* reexport safe */ _iterators_js__WEBPACK_IMPORTED_MODULE_2__.decodeIter),
/* harmony export */   "encode": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.encode),
/* harmony export */   "encodeIter": () => (/* reexport safe */ _iterators_js__WEBPACK_IMPORTED_MODULE_2__.encodeIter),
/* harmony export */   "isNativeAccelerationEnabled": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.isNativeAccelerationEnabled),
/* harmony export */   "mapsAsObjects": () => (/* binding */ mapsAsObjects),
/* harmony export */   "pack": () => (/* reexport safe */ _pack_js__WEBPACK_IMPORTED_MODULE_0__.pack),
/* harmony export */   "roundFloat32": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.roundFloat32),
/* harmony export */   "unpack": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.unpack),
/* harmony export */   "unpackMultiple": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_1__.unpackMultiple),
/* harmony export */   "useRecords": () => (/* binding */ useRecords)
/* harmony export */ });
/* harmony import */ var _pack_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pack.js */ "./node_modules/msgpackr/pack.js");
/* harmony import */ var _unpack_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unpack.js */ "./node_modules/msgpackr/unpack.js");
/* harmony import */ var _iterators_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./iterators.js */ "./node_modules/msgpackr/iterators.js");



const useRecords = false;
const mapsAsObjects = true;

/***/ }),

/***/ "./node_modules/msgpackr/iterators.js":
/*!********************************************!*\
  !*** ./node_modules/msgpackr/iterators.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "decodeIter": () => (/* binding */ decodeIter),
/* harmony export */   "encodeIter": () => (/* binding */ encodeIter),
/* harmony export */   "packIter": () => (/* binding */ packIter),
/* harmony export */   "unpackIter": () => (/* binding */ unpackIter)
/* harmony export */ });
/* harmony import */ var _pack_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pack.js */ "./node_modules/msgpackr/pack.js");
/* harmony import */ var _unpack_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unpack.js */ "./node_modules/msgpackr/unpack.js");


/**
 * Given an Iterable first argument, returns an Iterable where each value is packed as a Buffer
 * If the argument is only Async Iterable, the return value will be an Async Iterable.
 * @param {Iterable|Iterator|AsyncIterable|AsyncIterator} objectIterator - iterable source, like a Readable object stream, an array, Set, or custom object
 * @param {options} [options] - msgpackr pack options
 * @returns {IterableIterator|Promise.<AsyncIterableIterator>}
 */

function packIter(objectIterator, options = {}) {
  if (!objectIterator || typeof objectIterator !== 'object') {
    throw new Error('first argument must be an Iterable, Async Iterable, or a Promise for an Async Iterable');
  } else if (typeof objectIterator[Symbol.iterator] === 'function') {
    return packIterSync(objectIterator, options);
  } else if (typeof objectIterator.then === 'function' || typeof objectIterator[Symbol.asyncIterator] === 'function') {
    return packIterAsync(objectIterator, options);
  } else {
    throw new Error('first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a Promise');
  }
}

function* packIterSync(objectIterator, options) {
  const packr = new _pack_js__WEBPACK_IMPORTED_MODULE_0__.Packr(options);

  for (const value of objectIterator) {
    yield packr.pack(value);
  }
}

async function* packIterAsync(objectIterator, options) {
  const packr = new _pack_js__WEBPACK_IMPORTED_MODULE_0__.Packr(options);

  for await (const value of objectIterator) {
    yield packr.pack(value);
  }
}
/**
 * Given an Iterable/Iterator input which yields buffers, returns an IterableIterator which yields sync decoded objects
 * Or, given an Async Iterable/Iterator which yields promises resolving in buffers, returns an AsyncIterableIterator.
 * @param {Iterable|Iterator|AsyncIterable|AsyncIterableIterator} bufferIterator
 * @param {object} [options] - unpackr options
 * @returns {IterableIterator|Promise.<AsyncIterableIterator}
 */


function unpackIter(bufferIterator, options = {}) {
  if (!bufferIterator || typeof bufferIterator !== 'object') {
    throw new Error('first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a promise');
  }

  const unpackr = new _unpack_js__WEBPACK_IMPORTED_MODULE_1__.Unpackr(options);
  let incomplete;

  const parser = chunk => {
    let yields; // if there's incomplete data from previous chunk, concatinate and try again

    if (incomplete) {
      chunk = Buffer.concat([incomplete, chunk]);
      incomplete = undefined;
    }

    try {
      yields = unpackr.unpackMultiple(chunk);
    } catch (err) {
      if (err.incomplete) {
        incomplete = chunk.slice(err.lastPosition);
        yields = err.values;
      } else {
        throw err;
      }
    }

    return yields;
  };

  if (typeof bufferIterator[Symbol.iterator] === 'function') {
    return function* iter() {
      for (const value of bufferIterator) {
        yield* parser(value);
      }
    }();
  } else if (typeof bufferIterator[Symbol.asyncIterator] === 'function') {
    return async function* iter() {
      for await (const value of bufferIterator) {
        yield* parser(value);
      }
    }();
  }
}
const decodeIter = unpackIter;
const encodeIter = packIter;

/***/ }),

/***/ "./node_modules/msgpackr/pack.js":
/*!***************************************!*\
  !*** ./node_modules/msgpackr/pack.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ALWAYS": () => (/* binding */ ALWAYS),
/* harmony export */   "DECIMAL_FIT": () => (/* binding */ DECIMAL_FIT),
/* harmony export */   "DECIMAL_ROUND": () => (/* binding */ DECIMAL_ROUND),
/* harmony export */   "Encoder": () => (/* binding */ Encoder),
/* harmony export */   "FLOAT32_OPTIONS": () => (/* reexport safe */ _unpack_js__WEBPACK_IMPORTED_MODULE_0__.FLOAT32_OPTIONS),
/* harmony export */   "NEVER": () => (/* binding */ NEVER),
/* harmony export */   "Packr": () => (/* binding */ Packr),
/* harmony export */   "RESET_BUFFER_MODE": () => (/* binding */ RESET_BUFFER_MODE),
/* harmony export */   "REUSE_BUFFER_MODE": () => (/* binding */ REUSE_BUFFER_MODE),
/* harmony export */   "addExtension": () => (/* binding */ addExtension),
/* harmony export */   "encode": () => (/* binding */ encode),
/* harmony export */   "pack": () => (/* binding */ pack)
/* harmony export */ });
/* harmony import */ var _unpack_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./unpack.js */ "./node_modules/msgpackr/unpack.js");



let textEncoder;

try {
  textEncoder = new TextEncoder();
} catch (error) {}

let extensions, extensionClasses;
const hasNodeBuffer = typeof Buffer !== 'undefined';
const ByteArrayAllocate = hasNodeBuffer ? Buffer.allocUnsafeSlow : Uint8Array;
const ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
const MAX_BUFFER_SIZE = hasNodeBuffer ? 0x100000000 : 0x7fd00000;
let target, keysTarget;
let targetView;
let position = 0;
let safeEnd;
let bundledStrings = null;
const MAX_BUNDLE_SIZE = 0xf000;
const hasNonLatin = /[\u0080-\uFFFF]/;
const RECORD_SYMBOL = Symbol('record-id');
class Packr extends _unpack_js__WEBPACK_IMPORTED_MODULE_0__.Unpackr {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let hasSharedUpdate;
    let structures;
    let referenceMap;
    let lastSharedStructuresLength = 0;
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function (string, position, maxBytes) {
      return target.utf8Write(string, position, maxBytes);
    } : textEncoder && textEncoder.encodeInto ? function (string, position) {
      return textEncoder.encodeInto(string, target.subarray(position)).written;
    } : false;
    let packr = this;
    if (!options) options = {};
    let isSequential = options && options.sequential;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null) maxSharedStructures = hasSharedStructures ? 32 : 0;
    if (maxSharedStructures > 8160) throw new Error('Maximum maxSharedStructure is 8160');

    if (options.structuredClone && options.moreTypes == undefined) {
      options.moreTypes = true;
    }

    let maxOwnStructures = options.maxOwnStructures;
    if (maxOwnStructures == null) maxOwnStructures = hasSharedStructures ? 32 : 64;
    if (!this.structures && options.useRecords != false) this.structures = []; // two byte record ids for shared structures

    let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
    let sharedLimitId = maxSharedStructures + 0x40;
    let maxStructureId = maxSharedStructures + maxOwnStructures + 0x40;

    if (maxStructureId > 8256) {
      throw new Error('Maximum maxSharedStructure + maxOwnStructure is 8192');
    }

    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;

    this.pack = this.encode = function (value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = new DataView(target.buffer, 0, 8192);
        position = 0;
      }

      safeEnd = target.length - 10;

      if (safeEnd - position < 0x800) {
        // don't start too close to the end, 
        target = new ByteArrayAllocate(target.length);
        targetView = new DataView(target.buffer, 0, target.length);
        safeEnd = target.length - 10;
        position = 0;
      } else position = position + 7 & 0x7ffffff8; // Word align to make any future copying of this buffer faster


      start = position;
      referenceMap = packr.structuredClone ? new Map() : null;

      if (packr.bundleStrings && typeof value !== 'string') {
        bundledStrings = [];
        bundledStrings.size = Infinity; // force a new bundle start on first string
      } else bundledStrings = null;

      structures = packr.structures;

      if (structures) {
        if (structures.uninitialized) structures = packr._mergeStructures(packr.getStructures());
        let sharedLength = structures.sharedLength || 0;

        if (sharedLength > maxSharedStructures) {
          //if (maxSharedStructures <= 32 && structures.sharedLength > 32) // TODO: could support this, but would need to update the limit ids
          throw new Error('Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to ' + structures.sharedLength);
        }

        if (!structures.transitions) {
          // rebuild our structure transitions
          structures.transitions = Object.create(null);

          for (let i = 0; i < sharedLength; i++) {
            let keys = structures[i];
            if (!keys) continue;
            let nextTransition,
                transition = structures.transitions;

            for (let j = 0, l = keys.length; j < l; j++) {
              let key = keys[j];
              nextTransition = transition[key];

              if (!nextTransition) {
                nextTransition = transition[key] = Object.create(null);
              }

              transition = nextTransition;
            }

            transition[RECORD_SYMBOL] = i + 0x40;
          }

          lastSharedStructuresLength = sharedLength;
        }

        if (!isSequential) {
          structures.nextId = sharedLength + 0x40;
        }
      }

      if (hasSharedUpdate) hasSharedUpdate = false;

      try {
        pack(value);

        if (bundledStrings) {
          writeBundles(start, pack);
        }

        packr.offset = position; // update the offset so next serialization doesn't write over our buffer, but can continue writing to same buffer sequentially

        if (referenceMap && referenceMap.idsToInsert) {
          position += referenceMap.idsToInsert.length * 6;
          if (position > safeEnd) makeRoom(position);
          packr.offset = position;
          let serialized = insertIds(target.subarray(start, position), referenceMap.idsToInsert);
          referenceMap = null;
          return serialized;
        }

        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position;
          return target;
        }

        return target.subarray(start, position); // position can change if we call pack again in saveStructures, so we get the buffer now
      } finally {
        if (structures) {
          if (serializationsSinceTransitionRebuild < 10) serializationsSinceTransitionRebuild++;
          let sharedLength = structures.sharedLength || maxSharedStructures;
          if (structures.length > sharedLength) structures.length = sharedLength;

          if (transitionsCount > 10000) {
            // force a rebuild occasionally after a lot of transitions so it can get cleaned up
            structures.transitions = null;
            serializationsSinceTransitionRebuild = 0;
            transitionsCount = 0;
            if (recordIdsToRemove.length > 0) recordIdsToRemove = [];
          } else if (recordIdsToRemove.length > 0 && !isSequential) {
            for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
              recordIdsToRemove[i][RECORD_SYMBOL] = 0;
            }

            recordIdsToRemove = [];
          }

          if (hasSharedUpdate && packr.saveStructures) {
            // we can't rely on start/end with REUSE_BUFFER_MODE since they will (probably) change when we save
            let returnBuffer = target.subarray(start, position);

            if (packr.saveStructures(structures, lastSharedStructuresLength) === false) {
              // get updated structures and try again if the update failed
              packr._mergeStructures(packr.getStructures());

              return packr.pack(value);
            }

            lastSharedStructuresLength = sharedLength;
            return returnBuffer;
          }
        }

        if (encodeOptions & RESET_BUFFER_MODE) position = start;
      }
    };

    const pack = value => {
      if (position > safeEnd) target = makeRoom(position);
      var type = typeof value;
      var length;

      if (type === 'string') {
        let strLength = value.length;

        if (bundledStrings && strLength >= 4 && strLength < 0x1000) {
          if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
            if (position + maxBytes > safeEnd) target = makeRoom(position + maxBytes);

            if (bundledStrings.position) {
              // here we use the 0x62 extension to write the last bundle and reserve sapce for the reference pointer to the next/current bundle
              target[position] = 0xc8; // ext 16

              position += 3; // reserve for the writing bundle size

              target[position++] = 0x62; // 'b'

              extStart = position - start;
              position += 4; // reserve for writing bundle reference

              writeBundles(start, pack); // write the last bundles

              targetView.setUint16(extStart + start - 3, position - start - extStart);
            } else {
              // here we use the 0x62 extension just to reserve the space for the reference pointer to the bundle (will be updated once the bundle is written)
              target[position++] = 0xd6; // fixext 4

              target[position++] = 0x62; // 'b'

              extStart = position - start;
              position += 4; // reserve for writing bundle reference
            }

            bundledStrings = ['', '']; // create new ones

            bundledStrings.size = 0;
            bundledStrings.position = extStart;
          }

          let twoByte = hasNonLatin.test(value);
          bundledStrings[twoByte ? 0 : 1] += value;
          target[position++] = 0xc1;
          pack(twoByte ? -strLength : strLength);
          return;
        }

        let headerSize; // first we estimate the header size, so we can write to the correct location

        if (strLength < 0x20) {
          headerSize = 1;
        } else if (strLength < 0x100) {
          headerSize = 2;
        } else if (strLength < 0x10000) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }

        let maxBytes = strLength * 3;
        if (position + maxBytes > safeEnd) target = makeRoom(position + maxBytes);

        if (strLength < 0x40 || !encodeUtf8) {
          let i,
              c1,
              c2,
              strPosition = position + headerSize;

          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);

            if (c1 < 0x80) {
              target[strPosition++] = c1;
            } else if (c1 < 0x800) {
              target[strPosition++] = c1 >> 6 | 0xc0;
              target[strPosition++] = c1 & 0x3f | 0x80;
            } else if ((c1 & 0xfc00) === 0xd800 && ((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00) {
              c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
              i++;
              target[strPosition++] = c1 >> 18 | 0xf0;
              target[strPosition++] = c1 >> 12 & 0x3f | 0x80;
              target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
              target[strPosition++] = c1 & 0x3f | 0x80;
            } else {
              target[strPosition++] = c1 >> 12 | 0xe0;
              target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
              target[strPosition++] = c1 & 0x3f | 0x80;
            }
          }

          length = strPosition - position - headerSize;
        } else {
          length = encodeUtf8(value, position + headerSize, maxBytes);
        }

        if (length < 0x20) {
          target[position++] = 0xa0 | length;
        } else if (length < 0x100) {
          if (headerSize < 2) {
            target.copyWithin(position + 2, position + 1, position + 1 + length);
          }

          target[position++] = 0xd9;
          target[position++] = length;
        } else if (length < 0x10000) {
          if (headerSize < 3) {
            target.copyWithin(position + 3, position + 2, position + 2 + length);
          }

          target[position++] = 0xda;
          target[position++] = length >> 8;
          target[position++] = length & 0xff;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position + 5, position + 3, position + 3 + length);
          }

          target[position++] = 0xdb;
          targetView.setUint32(position, length);
          position += 4;
        }

        position += length;
      } else if (type === 'number') {
        if (value >>> 0 === value) {
          // positive integer, 32-bit or less
          // positive uint
          if (value < 0x40) {
            target[position++] = value;
          } else if (value < 0x100) {
            target[position++] = 0xcc;
            target[position++] = value;
          } else if (value < 0x10000) {
            target[position++] = 0xcd;
            target[position++] = value >> 8;
            target[position++] = value & 0xff;
          } else {
            target[position++] = 0xce;
            targetView.setUint32(position, value);
            position += 4;
          }
        } else if (value >> 0 === value) {
          // negative integer
          if (value >= -0x20) {
            target[position++] = 0x100 + value;
          } else if (value >= -0x80) {
            target[position++] = 0xd0;
            target[position++] = value + 0x100;
          } else if (value >= -0x8000) {
            target[position++] = 0xd1;
            targetView.setInt16(position, value);
            position += 2;
          } else {
            target[position++] = 0xd2;
            targetView.setInt32(position, value);
            position += 4;
          }
        } else {
          let useFloat32;

          if ((useFloat32 = this.useFloat32) > 0 && value < 0x100000000 && value >= -0x80000000) {
            target[position++] = 0xca;
            targetView.setFloat32(position, value);
            let xShifted;

            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * _unpack_js__WEBPACK_IMPORTED_MODULE_0__.mult10[(target[position] & 0x7f) << 1 | target[position + 1] >> 7]) >> 0 === xShifted) {
              position += 4;
              return;
            } else position--; // move back into position for writing a double

          }

          target[position++] = 0xcb;
          targetView.setFloat64(position, value);
          position += 8;
        }
      } else if (type === 'object') {
        if (!value) target[position++] = 0xc0;else {
          if (referenceMap) {
            let referee = referenceMap.get(value);

            if (referee) {
              if (!referee.id) {
                let idsToInsert = referenceMap.idsToInsert || (referenceMap.idsToInsert = []);
                referee.id = idsToInsert.push(referee);
              }

              target[position++] = 0xd6; // fixext 4

              target[position++] = 0x70; // "p" for pointer

              targetView.setUint32(position, referee.id);
              position += 4;
              return;
            } else referenceMap.set(value, {
              offset: position - start
            });
          }

          let constructor = value.constructor;

          if (constructor === Object) {
            writeObject(value, true);
          } else if (constructor === Array) {
            length = value.length;

            if (length < 0x10) {
              target[position++] = 0x90 | length;
            } else if (length < 0x10000) {
              target[position++] = 0xdc;
              target[position++] = length >> 8;
              target[position++] = length & 0xff;
            } else {
              target[position++] = 0xdd;
              targetView.setUint32(position, length);
              position += 4;
            }

            for (let i = 0; i < length; i++) {
              pack(value[i]);
            }
          } else if (constructor === Map) {
            length = value.size;

            if (length < 0x10) {
              target[position++] = 0x80 | length;
            } else if (length < 0x10000) {
              target[position++] = 0xde;
              target[position++] = length >> 8;
              target[position++] = length & 0xff;
            } else {
              target[position++] = 0xdf;
              targetView.setUint32(position, length);
              position += 4;
            }

            for (let [key, entryValue] of value) {
              pack(key);
              pack(entryValue);
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];

              if (value instanceof extensionClass) {
                let extension = extensions[i];

                if (extension.write) {
                  if (extension.type) {
                    target[position++] = 0xd4; // one byte "tag" extension

                    target[position++] = extension.type;
                    target[position++] = 0;
                  }

                  pack(extension.write.call(this, value));
                  return;
                }

                let currentTarget = target;
                let currentTargetView = targetView;
                let currentPosition = position;
                target = null;
                let result;

                try {
                  result = extension.pack.call(this, value, size => {
                    // restore target and use it
                    target = currentTarget;
                    currentTarget = null;
                    position += size;
                    if (position > safeEnd) makeRoom(position);
                    return {
                      target,
                      targetView,
                      position: position - size
                    };
                  }, pack);
                } finally {
                  // restore current target information (unless already restored)
                  if (currentTarget) {
                    target = currentTarget;
                    targetView = currentTargetView;
                    position = currentPosition;
                    safeEnd = target.length - 10;
                  }
                }

                if (result) {
                  if (result.length + position > safeEnd) makeRoom(result.length + position);
                  position = writeExtensionData(result, target, position, extension.type);
                }

                return;
              }
            } // no extension found, write as object


            writeObject(value, !value.hasOwnProperty); // if it doesn't have hasOwnProperty, don't do hasOwnProperty checks
          }
        }
      } else if (type === 'boolean') {
        target[position++] = value ? 0xc3 : 0xc2;
      } else if (type === 'bigint') {
        if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
          // use a signed int as long as it fits
          target[position++] = 0xd3;
          targetView.setBigInt64(position, value);
        } else if (value < BigInt(1) << BigInt(64) && value > 0) {
          // if we can fit an unsigned int, use that
          target[position++] = 0xcf;
          targetView.setBigUint64(position, value);
        } else {
          // overflow
          if (this.largeBigIntToFloat) {
            target[position++] = 0xcb;
            targetView.setFloat64(position, Number(value));
          } else {
            throw new RangeError(value + ' was too large to fit in MessagePack 64-bit integer format, set largeBigIntToFloat to convert to float-64');
          }
        }

        position += 8;
      } else if (type === 'undefined') {
        if (this.encodeUndefinedAsNil) target[position++] = 0xc0;else {
          target[position++] = 0xd4; // a number of implementations use fixext1 with type 0, data 0 to denote undefined, so we follow suite

          target[position++] = 0;
          target[position++] = 0;
        }
      } else if (type === 'function') {
        pack(this.writeFunction && this.writeFunction()); // if there is a writeFunction, use it, otherwise just encode as undefined
      } else {
        throw new Error('Unknown type: ' + type);
      }
    };

    const writeObject = this.useRecords === false ? this.variableMapSize ? object => {
      // this method is slightly slower, but generates "preferred serialization" (optimally small for smaller objects)
      let keys = Object.keys(object);
      let length = keys.length;

      if (length < 0x10) {
        target[position++] = 0x80 | length;
      } else if (length < 0x10000) {
        target[position++] = 0xde;
        target[position++] = length >> 8;
        target[position++] = length & 0xff;
      } else {
        target[position++] = 0xdf;
        targetView.setUint32(position, length);
        position += 4;
      }

      let key;

      for (let i = 0; i < length; i++) {
        pack(key = keys[i]);
        pack(object[key]);
      }
    } : (object, safePrototype) => {
      target[position++] = 0xde; // always using map 16, so we can preallocate and set the length afterwards

      let objectOffset = position - start;
      position += 2;
      let size = 0;

      for (let key in object) {
        if (safePrototype || object.hasOwnProperty(key)) {
          pack(key);
          pack(object[key]);
          size++;
        }
      }

      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 0xff;
    } : options.progressiveRecords && !useTwoByteRecords ? // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
    (object, safePrototype) => {
      let nextTransition,
          transition = structures.transitions || (structures.transitions = Object.create(null));
      let objectOffset = position++ - start;
      let wroteKeys;

      for (let key in object) {
        if (safePrototype || object.hasOwnProperty(key)) {
          nextTransition = transition[key];
          if (nextTransition) transition = nextTransition;else {
            // record doesn't exist, create full new record and insert it
            let keys = Object.keys(object);
            let lastTransition = transition;
            transition = structures.transitions;
            let newTransitions = 0;

            for (let i = 0, l = keys.length; i < l; i++) {
              let key = keys[i];
              nextTransition = transition[key];

              if (!nextTransition) {
                nextTransition = transition[key] = Object.create(null);
                newTransitions++;
              }

              transition = nextTransition;
            }

            if (objectOffset + start + 1 == position) {
              // first key, so we don't need to insert, we can just write record directly
              position--;
              newRecord(transition, keys, newTransitions);
            } else // otherwise we need to insert the record, moving existing data after the record
              insertNewRecord(transition, keys, objectOffset, newTransitions);

            wroteKeys = true;
            transition = lastTransition[key];
          }
          pack(object[key]);
        }
      }

      if (!wroteKeys) {
        let recordId = transition[RECORD_SYMBOL];
        if (recordId) target[objectOffset + start] = recordId;else insertNewRecord(transition, Object.keys(object), objectOffset, 0);
      }
    } : (object, safePrototype) => {
      let nextTransition,
          transition = structures.transitions || (structures.transitions = Object.create(null));
      let newTransitions = 0;

      for (let key in object) if (safePrototype || object.hasOwnProperty(key)) {
        nextTransition = transition[key];

        if (!nextTransition) {
          nextTransition = transition[key] = Object.create(null);
          newTransitions++;
        }

        transition = nextTransition;
      }

      let recordId = transition[RECORD_SYMBOL];

      if (recordId) {
        if (recordId >= 0x60 && useTwoByteRecords) {
          target[position++] = ((recordId -= 0x60) & 0x1f) + 0x60;
          target[position++] = recordId >> 5;
        } else target[position++] = recordId;
      } else {
        newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
      } // now write the values


      for (let key in object) if (safePrototype || object.hasOwnProperty(key)) pack(object[key]);
    };

    const makeRoom = end => {
      let newSize;

      if (end > 0x1000000) {
        // special handling for really large buffers
        if (end - start > MAX_BUFFER_SIZE) throw new Error('Packed buffer would be larger than maximum buffer size');
        newSize = Math.min(MAX_BUFFER_SIZE, Math.round(Math.max((end - start) * (end > 0x4000000 ? 1.25 : 2), 0x400000) / 0x1000) * 0x1000);
      } else // faster handling for smaller buffers
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;

      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = new DataView(newBuffer.buffer, 0, newSize);
      if (target.copy) target.copy(newBuffer, 0, start, end);else newBuffer.set(target.slice(start, end));
      position -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };

    const newRecord = (transition, keys, newTransitions) => {
      let recordId = structures.nextId;
      if (!recordId) recordId = 0x40;

      if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
        recordId = structures.nextOwnId;
        if (!(recordId < maxStructureId)) recordId = sharedLimitId;
        structures.nextOwnId = recordId + 1;
      } else {
        if (recordId >= maxStructureId) // cycle back around
          recordId = sharedLimitId;
        structures.nextId = recordId + 1;
      }

      let highByte = keys.highByte = recordId >= 0x60 && useTwoByteRecords ? recordId - 0x60 >> 5 : -1;
      transition[RECORD_SYMBOL] = recordId;
      transition.__keys__ = keys;
      structures[recordId - 0x40] = keys;

      if (recordId < sharedLimitId) {
        keys.isShared = true;
        structures.sharedLength = recordId - 0x3f;
        hasSharedUpdate = true;

        if (highByte >= 0) {
          target[position++] = (recordId & 0x1f) + 0x60;
          target[position++] = highByte;
        } else {
          target[position++] = recordId;
        }
      } else {
        if (highByte >= 0) {
          target[position++] = 0xd5; // fixext 2

          target[position++] = 0x72; // "r" record defintion extension type

          target[position++] = (recordId & 0x1f) + 0x60;
          target[position++] = highByte;
        } else {
          target[position++] = 0xd4; // fixext 1

          target[position++] = 0x72; // "r" record defintion extension type

          target[position++] = recordId;
        }

        if (newTransitions) transitionsCount += serializationsSinceTransitionRebuild * newTransitions; // record the removal of the id, we can maintain our shared structure

        if (recordIdsToRemove.length >= maxOwnStructures) recordIdsToRemove.shift()[RECORD_SYMBOL] = 0; // we are cycling back through, and have to remove old ones

        recordIdsToRemove.push(transition);
        pack(keys);
      }
    };

    const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
      let mainTarget = target;
      let mainPosition = position;
      let mainSafeEnd = safeEnd;
      let mainStart = start;
      target = keysTarget;
      position = 0;
      start = 0;
      if (!target) keysTarget = target = new ByteArrayAllocate(8192);
      safeEnd = target.length - 10;
      newRecord(transition, keys, newTransitions);
      keysTarget = target;
      let keysPosition = position;
      target = mainTarget;
      position = mainPosition;
      safeEnd = mainSafeEnd;
      start = mainStart;

      if (keysPosition > 1) {
        let newEnd = position + keysPosition - 1;
        if (newEnd > safeEnd) makeRoom(newEnd);
        let insertionPosition = insertionOffset + start;
        target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
        target.set(keysTarget.slice(0, keysPosition), insertionPosition);
        position = newEnd;
      } else {
        target[insertionOffset + start] = keysTarget[0];
      }
    };
  }

  useBuffer(buffer) {
    // this means we are finished using our own buffer and we can write over it safely
    target = buffer;
    targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    position = 0;
  }

  clearSharedData() {
    if (this.structures) this.structures = [];
  }

}

function copyBinary(source, target, targetOffset, offset, endOffset) {
  while (offset < endOffset) {
    target[targetOffset++] = source[offset++];
  }
}

extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor
/*TypedArray*/
, _unpack_js__WEBPACK_IMPORTED_MODULE_0__.C1Type];
extensions = [{
  pack(date, allocateForWrite, pack) {
    let seconds = date.getTime() / 1000;

    if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 0x100000000) {
      // Timestamp 32
      let {
        target,
        targetView,
        position
      } = allocateForWrite(6);
      target[position++] = 0xd6;
      target[position++] = 0xff;
      targetView.setUint32(position, seconds);
    } else if (seconds > 0 && seconds < 0x100000000) {
      // Timestamp 64
      let {
        target,
        targetView,
        position
      } = allocateForWrite(10);
      target[position++] = 0xd7;
      target[position++] = 0xff;
      targetView.setUint32(position, date.getMilliseconds() * 4000000 + (seconds / 1000 / 0x100000000 >> 0));
      targetView.setUint32(position + 4, seconds);
    } else if (isNaN(seconds)) {
      if (this.onInvalidDate) {
        allocateForWrite(0);
        return pack(this.onInvalidDate());
      } // Intentionally invalid timestamp


      let {
        target,
        targetView,
        position
      } = allocateForWrite(3);
      target[position++] = 0xd4;
      target[position++] = 0xff;
      target[position++] = 0xff;
    } else {
      // Timestamp 96
      let {
        target,
        targetView,
        position
      } = allocateForWrite(15);
      target[position++] = 0xc7;
      target[position++] = 12;
      target[position++] = 0xff;
      targetView.setUint32(position, date.getMilliseconds() * 1000000);
      targetView.setBigInt64(position + 4, BigInt(Math.floor(seconds)));
    }
  }

}, {
  pack(set, allocateForWrite, pack) {
    let array = Array.from(set);
    let {
      target,
      position
    } = allocateForWrite(this.moreTypes ? 3 : 0);

    if (this.moreTypes) {
      target[position++] = 0xd4;
      target[position++] = 0x73; // 's' for Set

      target[position++] = 0;
    }

    pack(array);
  }

}, {
  pack(error, allocateForWrite, pack) {
    let {
      target,
      position
    } = allocateForWrite(this.moreTypes ? 3 : 0);

    if (this.moreTypes) {
      target[position++] = 0xd4;
      target[position++] = 0x65; // 'e' for error

      target[position++] = 0;
    }

    pack([error.name, error.message]);
  }

}, {
  pack(regex, allocateForWrite, pack) {
    let {
      target,
      position
    } = allocateForWrite(this.moreTypes ? 3 : 0);

    if (this.moreTypes) {
      target[position++] = 0xd4;
      target[position++] = 0x78; // 'x' for regeXp

      target[position++] = 0;
    }

    pack([regex.source, regex.flags]);
  }

}, {
  pack(arrayBuffer, allocateForWrite) {
    if (this.moreTypes) writeExtBuffer(arrayBuffer, 0x10, allocateForWrite);else writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
  }

}, {
  pack(typedArray, allocateForWrite) {
    let constructor = typedArray.constructor;
    if (constructor !== ByteArray && this.moreTypes) writeExtBuffer(typedArray, _unpack_js__WEBPACK_IMPORTED_MODULE_0__.typedArrays.indexOf(constructor.name), allocateForWrite);else writeBuffer(typedArray, allocateForWrite);
  }

}, {
  pack(c1, allocateForWrite) {
    // specific 0xC1 object
    let {
      target,
      position
    } = allocateForWrite(1);
    target[position] = 0xc1;
  }

}];

function writeExtBuffer(typedArray, type, allocateForWrite, encode) {
  let length = typedArray.byteLength;

  if (length + 1 < 0x100) {
    var {
      target,
      position
    } = allocateForWrite(4 + length);
    target[position++] = 0xc7;
    target[position++] = length + 1;
  } else if (length + 1 < 0x10000) {
    var {
      target,
      position
    } = allocateForWrite(5 + length);
    target[position++] = 0xc8;
    target[position++] = length + 1 >> 8;
    target[position++] = length + 1 & 0xff;
  } else {
    var {
      target,
      position,
      targetView
    } = allocateForWrite(7 + length);
    target[position++] = 0xc9;
    targetView.setUint32(position, length + 1); // plus one for the type byte

    position += 4;
  }

  target[position++] = 0x74; // "t" for typed array

  target[position++] = type;
  target.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position);
}

function writeBuffer(buffer, allocateForWrite) {
  let length = buffer.byteLength;
  var target, position;

  if (length < 0x100) {
    var {
      target,
      position
    } = allocateForWrite(length + 2);
    target[position++] = 0xc4;
    target[position++] = length;
  } else if (length < 0x10000) {
    var {
      target,
      position
    } = allocateForWrite(length + 3);
    target[position++] = 0xc5;
    target[position++] = length >> 8;
    target[position++] = length & 0xff;
  } else {
    var {
      target,
      position,
      targetView
    } = allocateForWrite(length + 5);
    target[position++] = 0xc6;
    targetView.setUint32(position, length);
    position += 4;
  }

  target.set(buffer, position);
}

function writeExtensionData(result, target, position, type) {
  let length = result.length;

  switch (length) {
    case 1:
      target[position++] = 0xd4;
      break;

    case 2:
      target[position++] = 0xd5;
      break;

    case 4:
      target[position++] = 0xd6;
      break;

    case 8:
      target[position++] = 0xd7;
      break;

    case 16:
      target[position++] = 0xd8;
      break;

    default:
      if (length < 0x100) {
        target[position++] = 0xc7;
        target[position++] = length;
      } else if (length < 0x10000) {
        target[position++] = 0xc8;
        target[position++] = length >> 8;
        target[position++] = length & 0xff;
      } else {
        target[position++] = 0xc9;
        target[position++] = length >> 24;
        target[position++] = length >> 16 & 0xff;
        target[position++] = length >> 8 & 0xff;
        target[position++] = length & 0xff;
      }

  }

  target[position++] = type;
  target.set(result, position);
  position += length;
  return position;
}

function insertIds(serialized, idsToInsert) {
  // insert the ids that need to be referenced for structured clones
  let nextId;
  let distanceToMove = idsToInsert.length * 6;
  let lastEnd = serialized.length - distanceToMove;
  idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);

  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    let id = nextId.id;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 6;
    let position = offset + distanceToMove;
    serialized[position++] = 0xd6;
    serialized[position++] = 0x69; // 'i'

    serialized[position++] = id >> 24;
    serialized[position++] = id >> 16 & 0xff;
    serialized[position++] = id >> 8 & 0xff;
    serialized[position++] = id & 0xff;
    lastEnd = offset;
  }

  return serialized;
}

function writeBundles(start, pack) {
  targetView.setUint32(bundledStrings.position + start, position - bundledStrings.position - start);
  let writeStrings = bundledStrings;
  bundledStrings = null;
  let startPosition = position;
  pack(writeStrings[0]);
  pack(writeStrings[1]);
}

function addExtension(extension) {
  if (extension.Class) {
    if (!extension.pack && !extension.write) throw new Error('Extension has no pack or write function');
    if (extension.pack && !extension.type) throw new Error('Extension has no type (numeric code to identify the extension)');
    extensionClasses.unshift(extension.Class);
    extensions.unshift(extension);
  }

  (0,_unpack_js__WEBPACK_IMPORTED_MODULE_0__.addExtension)(extension);
}
let defaultPackr = new Packr({
  useRecords: false
});
const pack = defaultPackr.pack;
const encode = defaultPackr.pack;
const Encoder = Packr;


const {
  NEVER,
  ALWAYS,
  DECIMAL_ROUND,
  DECIMAL_FIT
} = _unpack_js__WEBPACK_IMPORTED_MODULE_0__.FLOAT32_OPTIONS;
const REUSE_BUFFER_MODE = 512;
const RESET_BUFFER_MODE = 1024;

/***/ }),

/***/ "./node_modules/msgpackr/unpack.js":
/*!*****************************************!*\
  !*** ./node_modules/msgpackr/unpack.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "C1": () => (/* binding */ C1),
/* harmony export */   "C1Type": () => (/* binding */ C1Type),
/* harmony export */   "Decoder": () => (/* binding */ Decoder),
/* harmony export */   "FLOAT32_OPTIONS": () => (/* binding */ FLOAT32_OPTIONS),
/* harmony export */   "Unpackr": () => (/* binding */ Unpackr),
/* harmony export */   "addExtension": () => (/* binding */ addExtension),
/* harmony export */   "checkedRead": () => (/* binding */ checkedRead),
/* harmony export */   "clearSource": () => (/* binding */ clearSource),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "getPosition": () => (/* binding */ getPosition),
/* harmony export */   "isNativeAccelerationEnabled": () => (/* binding */ isNativeAccelerationEnabled),
/* harmony export */   "mult10": () => (/* binding */ mult10),
/* harmony export */   "read": () => (/* binding */ read),
/* harmony export */   "roundFloat32": () => (/* binding */ roundFloat32),
/* harmony export */   "setExtractor": () => (/* binding */ setExtractor),
/* harmony export */   "typedArrays": () => (/* binding */ typedArrays),
/* harmony export */   "unpack": () => (/* binding */ unpack),
/* harmony export */   "unpackMultiple": () => (/* binding */ unpackMultiple)
/* harmony export */ });


var decoder;

try {
  decoder = new TextDecoder();
} catch (error) {}

var src;
var srcEnd;
var position = 0;
var alreadySet;
const EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
class C1Type {}
const C1 = new C1Type();
C1.name = 'MessagePack 0xC1';
var sequentialMode = false;
var inlineObjectReadThreshold = 2;

try {
  new Function('');
} catch (error) {
  // if eval variants are not supported, do not create inline object readers ever
  inlineObjectReadThreshold = Infinity;
}

class Unpackr {
  constructor(options) {
    if (options) {
      if (options.useRecords === false && options.mapsAsObjects === undefined) options.mapsAsObjects = true;
      if (options.structures) options.structures.sharedLength = options.structures.length;else if (options.getStructures) {
        (options.structures = []).uninitialized = true; // this is what we use to denote an uninitialized structures

        options.structures.sharedLength = 0;
      }
    }

    Object.assign(this, options);
  }

  unpack(source, end) {
    if (src) {
      // re-entrant execution, save the state and restore it after we do this unpack
      return saveState(() => {
        clearSource();
        return this ? this.unpack(source, end) : Unpackr.prototype.unpack.call(defaultOptions, source, end);
      });
    }

    srcEnd = end > -1 ? end : source.length;
    position = 0;
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source; // this provides cached access to the data view for a buffer if it is getting reused, which is a recommend
    // technique for getting data from a database where it can be copied into an existing buffer instead of creating
    // new ones

    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      // if it doesn't have a buffer, maybe it is the wrong type of object
      src = null;
      if (source instanceof Uint8Array) throw error;
      throw new Error('Source must be a Uint8Array or Buffer but was a ' + (source && typeof source == 'object' ? source.constructor.name : typeof source));
    }

    if (this instanceof Unpackr) {
      currentUnpackr = this;

      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead();
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentUnpackr = defaultOptions;
      if (!currentStructures || currentStructures.length > 0) currentStructures = [];
    }

    return checkedRead();
  }

  unpackMultiple(source, forEach) {
    let values,
        lastPosition = 0;

    try {
      sequentialMode = true;
      let size = source.length;
      let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);

      if (forEach) {
        forEach(value);

        while (position < size) {
          lastPosition = position;

          if (forEach(checkedRead()) === false) {
            return;
          }
        }
      } else {
        values = [value];

        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }

        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }

  _mergeStructures(loadedStructures, existingStructures) {
    loadedStructures = loadedStructures || [];

    for (let i = 0, l = loadedStructures.length; i < l; i++) {
      let structure = loadedStructures[i];

      if (structure) {
        structure.isShared = true;
        if (i >= 32) structure.highByte = i - 32 >> 5;
      }
    }

    loadedStructures.sharedLength = loadedStructures.length;

    for (let id in existingStructures || []) {
      if (id >= 0) {
        let structure = loadedStructures[id];
        let existing = existingStructures[id];

        if (existing) {
          if (structure) (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
          loadedStructures[id] = existing;
        }
      }
    }

    return this.structures = loadedStructures;
  }

  decode(source, end) {
    return this.unpack(source, end);
  }

}
function getPosition() {
  return position;
}
function checkedRead() {
  try {
    if (!currentUnpackr.trusted && !sequentialMode) {
      let sharedLength = currentStructures.sharedLength || 0;
      if (sharedLength < currentStructures.length) currentStructures.length = sharedLength;
    }

    let result = read();
    if (bundledStrings) // bundled strings to skip past
      position = bundledStrings.postBundlePosition;

    if (position == srcEnd) {
      // finished reading this source, cleanup references
      if (currentStructures.restoreStructures) restoreStructures();
      currentStructures = null;
      src = null;
      if (referenceMap) referenceMap = null;
    } else if (position > srcEnd) {
      // over read
      let error = new Error('Unexpected end of MessagePack data');
      error.incomplete = true;
      throw error;
    } else if (!sequentialMode) {
      throw new Error('Data read, but end of buffer not reached');
    } // else more to read, but we are reading sequentially, so don't clear source yet


    return result;
  } catch (error) {
    if (currentStructures.restoreStructures) restoreStructures();
    clearSource();

    if (error instanceof RangeError || error.message.startsWith('Unexpected end of buffer')) {
      error.incomplete = true;
    }

    throw error;
  }
}

function restoreStructures() {
  for (let id in currentStructures.restoreStructures) {
    currentStructures[id] = currentStructures.restoreStructures[id];
  }

  currentStructures.restoreStructures = null;
}

function read() {
  let token = src[position++];

  if (token < 0xa0) {
    if (token < 0x80) {
      if (token < 0x40) return token;else {
        let structure = currentStructures[token & 0x3f] || currentUnpackr.getStructures && loadStructures()[token & 0x3f];

        if (structure) {
          if (!structure.read) {
            structure.read = createStructureReader(structure, token & 0x3f);
          }

          return structure.read();
        } else return token;
      }
    } else if (token < 0x90) {
      // map
      token -= 0x80;

      if (currentUnpackr.mapsAsObjects) {
        let object = {};

        for (let i = 0; i < token; i++) {
          object[readKey()] = read();
        }

        return object;
      } else {
        let map = new Map();

        for (let i = 0; i < token; i++) {
          map.set(read(), read());
        }

        return map;
      }
    } else {
      token -= 0x90;
      let array = new Array(token);

      for (let i = 0; i < token; i++) {
        array[i] = read();
      }

      return array;
    }
  } else if (token < 0xc0) {
    // fixstr
    let length = token - 0xa0;

    if (srcStringEnd >= position) {
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    }

    if (srcStringEnd == 0 && srcEnd < 140) {
      // for small blocks, avoiding the overhead of the extract call is helpful
      let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
      if (string != null) return string;
    }

    return readFixedString(length);
  } else {
    let value;

    switch (token) {
      case 0xc0:
        return null;

      case 0xc1:
        if (bundledStrings) {
          value = read(); // followed by the length of the string in characters (not bytes!)

          if (value > 0) return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);else return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 -= value);
        }

        return C1;
      // "never-used", return special object to denote that

      case 0xc2:
        return false;

      case 0xc3:
        return true;

      case 0xc4:
        // bin 8
        return readBin(src[position++]);

      case 0xc5:
        // bin 16
        value = dataView.getUint16(position);
        position += 2;
        return readBin(value);

      case 0xc6:
        // bin 32
        value = dataView.getUint32(position);
        position += 4;
        return readBin(value);

      case 0xc7:
        // ext 8
        return readExt(src[position++]);

      case 0xc8:
        // ext 16
        value = dataView.getUint16(position);
        position += 2;
        return readExt(value);

      case 0xc9:
        // ext 32
        value = dataView.getUint32(position);
        position += 4;
        return readExt(value);

      case 0xca:
        value = dataView.getFloat32(position);

        if (currentUnpackr.useFloat32 > 2) {
          // this does rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
          let multiplier = mult10[(src[position] & 0x7f) << 1 | src[position + 1] >> 7];
          position += 4;
          return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
        }

        position += 4;
        return value;

      case 0xcb:
        value = dataView.getFloat64(position);
        position += 8;
        return value;
      // uint handlers

      case 0xcc:
        return src[position++];

      case 0xcd:
        value = dataView.getUint16(position);
        position += 2;
        return value;

      case 0xce:
        value = dataView.getUint32(position);
        position += 4;
        return value;

      case 0xcf:
        if (currentUnpackr.int64AsNumber) {
          value = dataView.getUint32(position) * 0x100000000;
          value += dataView.getUint32(position + 4);
        } else value = dataView.getBigUint64(position);

        position += 8;
        return value;
      // int handlers

      case 0xd0:
        return dataView.getInt8(position++);

      case 0xd1:
        value = dataView.getInt16(position);
        position += 2;
        return value;

      case 0xd2:
        value = dataView.getInt32(position);
        position += 4;
        return value;

      case 0xd3:
        if (currentUnpackr.int64AsNumber) {
          value = dataView.getInt32(position) * 0x100000000;
          value += dataView.getUint32(position + 4);
        } else value = dataView.getBigInt64(position);

        position += 8;
        return value;

      case 0xd4:
        // fixext 1
        value = src[position++];

        if (value == 0x72) {
          return recordDefinition(src[position++] & 0x3f);
        } else {
          let extension = currentExtensions[value];

          if (extension) {
            if (extension.read) {
              position++; // skip filler byte

              return extension.read(read());
            } else if (extension.noBuffer) {
              position++; // skip filler byte

              return extension();
            } else return extension(src.subarray(position, ++position));
          } else throw new Error('Unknown extension ' + value);
        }

      case 0xd5:
        // fixext 2
        value = src[position];

        if (value == 0x72) {
          position++;
          return recordDefinition(src[position++] & 0x3f, src[position++]);
        } else return readExt(2);

      case 0xd6:
        // fixext 4
        return readExt(4);

      case 0xd7:
        // fixext 8
        return readExt(8);

      case 0xd8:
        // fixext 16
        return readExt(16);

      case 0xd9:
        // str 8
        value = src[position++];

        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }

        return readString8(value);

      case 0xda:
        // str 16
        value = dataView.getUint16(position);
        position += 2;

        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }

        return readString16(value);

      case 0xdb:
        // str 32
        value = dataView.getUint32(position);
        position += 4;

        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }

        return readString32(value);

      case 0xdc:
        // array 16
        value = dataView.getUint16(position);
        position += 2;
        return readArray(value);

      case 0xdd:
        // array 32
        value = dataView.getUint32(position);
        position += 4;
        return readArray(value);

      case 0xde:
        // map 16
        value = dataView.getUint16(position);
        position += 2;
        return readMap(value);

      case 0xdf:
        // map 32
        value = dataView.getUint32(position);
        position += 4;
        return readMap(value);

      default:
        // negative int
        if (token >= 0xe0) return token - 0x100;

        if (token === undefined) {
          let error = new Error('Unexpected end of MessagePack data');
          error.incomplete = true;
          throw error;
        }

        throw new Error('Unknown MessagePack token ' + token);
    }
  }
}
const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;

function createStructureReader(structure, firstId) {
  function readObject() {
    // This initial function is quick to instantiate, but runs slower. After several iterations pay the cost to build the faster function
    if (readObject.count++ > inlineObjectReadThreshold) {
      let readObject = structure.read = new Function('r', 'return function(){return {' + structure.map(key => validName.test(key) ? key + ':r()' : '[' + JSON.stringify(key) + ']:r()').join(',') + '}}')(read);
      if (structure.highByte === 0) structure.read = createSecondByteReader(firstId, structure.read);
      return readObject(); // second byte is already read, if there is one so immediately read object
    }

    let object = {};

    for (let i = 0, l = structure.length; i < l; i++) {
      let key = structure[i];
      object[key] = read();
    }

    return object;
  }

  readObject.count = 0;

  if (structure.highByte === 0) {
    return createSecondByteReader(firstId, readObject);
  }

  return readObject;
}

const createSecondByteReader = (firstId, read0) => {
  return function () {
    let highByte = src[position++];
    if (highByte === 0) return read0();
    let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    let structure = currentStructures[id] || loadStructures()[id];

    if (!structure) {
      throw new Error('Record id is not defined for ' + id);
    }

    if (!structure.read) structure.read = createStructureReader(structure, firstId);
    return structure.read();
  };
};

function loadStructures() {
  let loadedStructures = saveState(() => {
    // save the state in case getStructures modifies our buffer
    src = null;
    return currentUnpackr.getStructures();
  });
  return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}

var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
let isNativeAccelerationEnabled = false;
function setExtractor(extractStrings) {
  isNativeAccelerationEnabled = true;
  readFixedString = readString(1);
  readString8 = readString(2);
  readString16 = readString(3);
  readString32 = readString(5);

  function readString(headerLength) {
    return function readString(length) {
      let string = strings[stringPosition++];

      if (string == null) {
        if (bundledStrings) return readStringJS(length);
        let extraction = extractStrings(position - headerLength, srcEnd, src);

        if (typeof extraction == 'string') {
          string = extraction;
          strings = EMPTY_ARRAY;
        } else {
          strings = extraction;
          stringPosition = 1;
          srcStringEnd = 1; // even if a utf-8 string was decoded, must indicate we are in the midst of extracted strings and can't skip strings

          string = strings[0];
          if (string === undefined) throw new Error('Unexpected end of buffer');
        }
      }

      let srcStringLength = string.length;

      if (srcStringLength <= length) {
        position += length;
        return string;
      }

      srcString = string;
      srcStringStart = position;
      srcStringEnd = position + srcStringLength;
      position += length;
      return string.slice(0, length); // we know we just want the beginning
    };
  }
}

function readStringJS(length) {
  let result;

  if (length < 16) {
    if (result = shortStringInJS(length)) return result;
  }

  if (length > 64 && decoder) return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = '';

  while (position < end) {
    const byte1 = src[position++];

    if ((byte1 & 0x80) === 0) {
      // 1 byte
      units.push(byte1);
    } else if ((byte1 & 0xe0) === 0xc0) {
      // 2 bytes
      const byte2 = src[position++] & 0x3f;
      units.push((byte1 & 0x1f) << 6 | byte2);
    } else if ((byte1 & 0xf0) === 0xe0) {
      // 3 bytes
      const byte2 = src[position++] & 0x3f;
      const byte3 = src[position++] & 0x3f;
      units.push((byte1 & 0x1f) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 0xf8) === 0xf0) {
      // 4 bytes
      const byte2 = src[position++] & 0x3f;
      const byte3 = src[position++] & 0x3f;
      const byte4 = src[position++] & 0x3f;
      let unit = (byte1 & 0x07) << 0x12 | byte2 << 0x0c | byte3 << 0x06 | byte4;

      if (unit > 0xffff) {
        unit -= 0x10000;
        units.push(unit >>> 10 & 0x3ff | 0xd800);
        unit = 0xdc00 | unit & 0x3ff;
      }

      units.push(unit);
    } else {
      units.push(byte1);
    }

    if (units.length >= 0x1000) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }

  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }

  return result;
}

function readArray(length) {
  let array = new Array(length);

  for (let i = 0; i < length; i++) {
    array[i] = read();
  }

  return array;
}

function readMap(length) {
  if (currentUnpackr.mapsAsObjects) {
    let object = {};

    for (let i = 0; i < length; i++) {
      object[readKey()] = read();
    }

    return object;
  } else {
    let map = new Map();

    for (let i = 0; i < length; i++) {
      map.set(read(), read());
    }

    return map;
  }
}

var fromCharCode = String.fromCharCode;

function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);

  for (let i = 0; i < length; i++) {
    const byte = src[position++];

    if ((byte & 0x80) > 0) {
      position = start;
      return;
    }

    bytes[i] = byte;
  }

  return fromCharCode.apply(String, bytes);
}

function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0) return '';else {
        let a = src[position++];

        if ((a & 0x80) > 1) {
          position -= 1;
          return;
        }

        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];

      if ((a & 0x80) > 0 || (b & 0x80) > 0) {
        position -= 2;
        return;
      }

      if (length < 3) return fromCharCode(a, b);
      let c = src[position++];

      if ((c & 0x80) > 0) {
        position -= 3;
        return;
      }

      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];

    if ((a & 0x80) > 0 || (b & 0x80) > 0 || (c & 0x80) > 0 || (d & 0x80) > 0) {
      position -= 4;
      return;
    }

    if (length < 6) {
      if (length === 4) return fromCharCode(a, b, c, d);else {
        let e = src[position++];

        if ((e & 0x80) > 0) {
          position -= 5;
          return;
        }

        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];

      if ((e & 0x80) > 0 || (f & 0x80) > 0) {
        position -= 6;
        return;
      }

      if (length < 7) return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];

      if ((g & 0x80) > 0) {
        position -= 7;
        return;
      }

      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];

      if ((e & 0x80) > 0 || (f & 0x80) > 0 || (g & 0x80) > 0 || (h & 0x80) > 0) {
        position -= 8;
        return;
      }

      if (length < 10) {
        if (length === 8) return fromCharCode(a, b, c, d, e, f, g, h);else {
          let i = src[position++];

          if ((i & 0x80) > 0) {
            position -= 9;
            return;
          }

          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];

        if ((i & 0x80) > 0 || (j & 0x80) > 0) {
          position -= 10;
          return;
        }

        if (length < 11) return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];

        if ((k & 0x80) > 0) {
          position -= 11;
          return;
        }

        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];

        if ((i & 0x80) > 0 || (j & 0x80) > 0 || (k & 0x80) > 0 || (l & 0x80) > 0) {
          position -= 12;
          return;
        }

        if (length < 14) {
          if (length === 12) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);else {
            let m = src[position++];

            if ((m & 0x80) > 0) {
              position -= 13;
              return;
            }

            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];

          if ((m & 0x80) > 0 || (n & 0x80) > 0) {
            position -= 14;
            return;
          }

          if (length < 15) return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];

          if ((o & 0x80) > 0) {
            position -= 15;
            return;
          }

          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}

function readOnlyJSString() {
  let token = src[position++];
  let length;

  if (token < 0xc0) {
    // fixstr
    length = token - 0xa0;
  } else {
    switch (token) {
      case 0xd9:
        // str 8
        length = src[position++];
        break;

      case 0xda:
        // str 16
        length = dataView.getUint16(position);
        position += 2;
        break;

      case 0xdb:
        // str 32
        length = dataView.getUint32(position);
        position += 4;
        break;

      default:
        throw new Error('Expected string');
    }
  }

  return readStringJS(length);
}

function readBin(length) {
  return currentUnpackr.copyBuffers ? // specifically use the copying slice (not the node one)
  Uint8Array.prototype.slice.call(src, position, position += length) : src.subarray(position, position += length);
}

function readExt(length) {
  let type = src[position++];

  if (currentExtensions[type]) {
    return currentExtensions[type](src.subarray(position, position += length));
  } else throw new Error('Unknown extension type ' + type);
}

var keyCache = new Array(4096);

function readKey() {
  let length = src[position++];

  if (length >= 0xa0 && length < 0xc0) {
    // fixstr, potentially use key cache
    length = length - 0xa0;
    if (srcStringEnd >= position) // if it has been extracted, must use it (and faster anyway)
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);else if (!(srcStringEnd == 0 && srcEnd < 180)) return readFixedString(length);
  } else {
    // not cacheable, go back and do a standard read
    position--;
    return read();
  }

  let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position) : length > 0 ? src[position] : 0)) & 0xfff;
  let entry = keyCache[key];
  let checkPosition = position;
  let end = position + length - 3;
  let chunk;
  let i = 0;

  if (entry && entry.bytes == length) {
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);

      if (chunk != entry[i++]) {
        checkPosition = 0x70000000;
        break;
      }

      checkPosition += 4;
    }

    end += 3;

    while (checkPosition < end) {
      chunk = src[checkPosition++];

      if (chunk != entry[i++]) {
        checkPosition = 0x70000000;
        break;
      }
    }

    if (checkPosition === end) {
      position = checkPosition;
      return entry.string;
    }

    end -= 3;
    checkPosition = position;
  }

  entry = [];
  keyCache[key] = entry;
  entry.bytes = length;

  while (checkPosition < end) {
    chunk = dataView.getUint32(checkPosition);
    entry.push(chunk);
    checkPosition += 4;
  }

  end += 3;

  while (checkPosition < end) {
    chunk = src[checkPosition++];
    entry.push(chunk);
  } // for small blocks, avoiding the overhead of the extract call is helpful


  let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
  if (string != null) return entry.string = string;
  return entry.string = readFixedString(length);
} // the registration of the record definition extension (as "r")


const recordDefinition = (id, highByte) => {
  var structure = read();
  let firstByte = id;

  if (highByte !== undefined) {
    id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
    structure.highByte = highByte;
  }

  let existingStructure = currentStructures[id];

  if (existingStructure && existingStructure.isShared) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }

  currentStructures[id] = structure;
  structure.read = createStructureReader(structure, firstByte);
  return structure.read();
};

var glbl = typeof self == 'object' ? self : global;

currentExtensions[0] = () => {}; // notepack defines extension 0 to mean undefined, so use that as the default here


currentExtensions[0].noBuffer = true;

currentExtensions[0x65] = () => {
  let data = read();
  return (glbl[data[0]] || Error)(data[1]);
};

currentExtensions[0x69] = data => {
  // id extension (for structured clones)
  let id = dataView.getUint32(position - 4);
  if (!referenceMap) referenceMap = new Map();
  let token = src[position];
  let target; // TODO: handle Maps, Sets, and other types that can cycle; this is complicated, because you potentially need to read
  // ahead past references to record structure definitions

  if (token >= 0x90 && token < 0xa0 || token == 0xdc || token == 0xdd) target = [];else target = {};
  let refEntry = {
    target
  }; // a placeholder object

  referenceMap.set(id, refEntry);
  let targetProperties = read(); // read the next value as the target object to id

  if (refEntry.used) // there is a cycle, so we have to assign properties to original target
    return Object.assign(target, targetProperties);
  refEntry.target = targetProperties; // the placeholder wasn't used, replace with the deserialized one

  return targetProperties; // no cycle, can just use the returned read object
};

currentExtensions[0x70] = data => {
  // pointer extension (for structured clones)
  let id = dataView.getUint32(position - 4);
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};

currentExtensions[0x73] = () => new Set(read());

const typedArrays = ['Int8', 'Uint8', 'Uint8Clamped', 'Int16', 'Uint16', 'Int32', 'Uint32', 'Float32', 'Float64', 'BigInt64', 'BigUint64'].map(type => type + 'Array');

currentExtensions[0x74] = data => {
  let typeCode = data[0];
  let typedArrayName = typedArrays[typeCode];
  if (!typedArrayName) throw new Error('Could not find typed array for code ' + typeCode); // we have to always slice/copy here to get a new ArrayBuffer that is word/byte aligned

  return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
};

currentExtensions[0x78] = () => {
  let data = read();
  return new RegExp(data[0], data[1]);
};

const TEMP_BUNDLE = [];

currentExtensions[0x62] = data => {
  let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  let dataPosition = position;
  position += dataSize - data.length;
  bundledStrings = TEMP_BUNDLE;
  bundledStrings = [readOnlyJSString(), readOnlyJSString()];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
};

currentExtensions[0xff] = data => {
  // 32-bit date extension
  if (data.length == 4) return new Date((data[0] * 0x1000000 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1000);else if (data.length == 8) return new Date(((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1000000 + ((data[3] & 0x3) * 0x100000000 + data[4] * 0x1000000 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1000);else if (data.length == 12) // TODO: Implement support for negative
    return new Date(((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1000000 + ((data[4] & 0x80 ? -0x1000000000000 : 0) + data[6] * 0x10000000000 + data[7] * 0x100000000 + data[8] * 0x1000000 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1000);else return new Date('invalid');
}; // notepack defines extension 0 to mean undefined, so use that as the default here
// registration of bulk record definition?
// currentExtensions[0x52] = () =>


function saveState(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings; // TODO: We may need to revisit this if we do more external calls to user code (since it could be slow)

  let savedSrc = new Uint8Array(src.slice(0, srcEnd)); // we copy the data in case it changes while external data is processed

  let savedStructures = currentStructures;
  let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
  let savedPackr = currentUnpackr;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
  currentUnpackr = savedPackr;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}

function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
function addExtension(extension) {
  if (extension.unpack) currentExtensions[extension.type] = extension.unpack;else currentExtensions[extension.type] = extension;
}
const mult10 = new Array(147); // this is a table matching binary exponents to the multiplier to determine significant digit rounding

for (let i = 0; i < 256; i++) {
  mult10[i] = +('1e' + Math.floor(45.15 - i * 0.30103));
}

const Decoder = Unpackr;
var defaultUnpackr = new Unpackr({
  useRecords: false
});
const unpack = defaultUnpackr.unpack;
const unpackMultiple = defaultUnpackr.unpackMultiple;
const decode = defaultUnpackr.unpack;
const FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};
let f32Array = new Float32Array(1);
let u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function roundFloat32(float32Number) {
  f32Array[0] = float32Number;
  let multiplier = mult10[(u8Array[3] & 0x7f) << 1 | u8Array[2] >> 7];
  return (multiplier * float32Number + (float32Number > 0 ? 0.5 : -0.5) >> 0) / multiplier;
}

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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
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
let ticksPerFrame = 1;
let count = 1;
let leaderboard = [];
let rubber = 150;
let no_data = 0;
let pinger = null;
let seed = 0;
let zoom = 1;
let lastPartialTick = null;
let resendCtrl = false;

const draw = __webpack_require__(/*! ./draw */ "./js/draw.js")(canvas, self, objects, state, cursor);

const controls = __webpack_require__(/*! ./controls */ "./js/controls.js")(canvas, self, state, cursor, {
  useItem: () => useItem(),
  resendControls: () => resendCtrl = true,
  tryLockMouse: e => tryLockMouse(e),
  nextZoom: () => nextZoom()
});

const joystick = __webpack_require__(/*! ./joystick */ "./js/joystick.js")(self, state, controls);

const tick = __webpack_require__(/*! ./tick */ "./js/tick.js")(self, objects, controls);

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

const onConnect = () => {
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
};

const disconnect = () => {
  ui.disconnect();
  leaveGame();
};

const gotData = obj => {
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
    self.dead = false;
  } else {
    // if there is a high velocity difference, average them out
    if (Math.abs(you.posX - self.posX) > 0.3) {
      self.posX = (self.posX + 3 * you.posX) / 4;
      self.velX = (self.velX + you.velX) / 2;
    }

    if (Math.abs(you.posY - self.posY) > 0.3) {
      self.posY = (self.posY + 3 * you.posY) / 4;
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
    self.dead = you.dead;

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
  ui.updateDebugInfo(self.thrustBoost.toFixed(6));
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
    ws.binaryType = 'arraybuffer';
    inGame = true;
    ws.addEventListener('message', e => {
      let data = serial.recv(e.data);
      if (data instanceof ArrayBuffer) data = new Uint8Array(data);
      const [cmd, obj] = serial.decode(data);

      switch (cmd) {
        case serial.C_token:
          ui.updateOnlineStatus('in game');
          state.token = obj.token;
          break;

        case serial.C_pong:
          ui.updateOnlineStatus(`in game, ping: ${Math.max(performance.now() - obj.time, 0).toFixed(1)}ms`);
          break;

        case serial.C_data:
          no_data = 0;
          obj.you = serial.deserializeShip(obj.you);
          obj.ships = obj.ships.map(serial.deserializeShip);
          obj.projs = obj.projs.map(serial.deserializeBullet);
          gotData(obj);
          state.dead = self.dead;
          break;

        case serial.C_board:
          leaderboard = obj.board;
          ui.updateLeaderboard(leaderboard);
          break;

        case serial.C_orient:
          self.orient = obj.orient;
          break;

        case serial.C_unauth:
          disconnect();
          break;

        case serial.C_killed:
          draw.explosion(self, ticksPerFrame);
          leaveGame();
          ui.defeatedByPlayer(obj.ship);
          break;

        case serial.C_crashed:
          draw.explosion(self, ticksPerFrame);
          leaveGame();
          ui.defeatedByCrash(obj.ship);
          break;

        case serial.C_hitpl:
          draw.explosion(self, ticksPerFrame);
          leaveGame();
          ui.defeatedByPlanet(obj.ship);
          self.velX = 0;
          self.velY = 0;
          break;

        case serial.C_killship:
          obj.ship = serial.deserializeShip(obj.ship);

          if (objects.ships.find(ship => ship._id === obj.ship._id) !== null) {
            draw.explosion(obj.ship, ticksPerFrame);
          }

          objects.ships = objects.ships.filter(ship => ship._id !== obj.ship._id);
          break;

        case serial.C_killproj:
          objects.bullets = objects.bullets.filter(bullet => bullet._id !== obj.proj);
          break;

        case serial.C_minexpl:
          {
            const mine = serial.deserializeBullet(obj.mine);
            draw.addBubble({
              x: mine.posX,
              y: mine.posY,
              alpha: 200,
              radius: 1
            });
            break;
          }

        case serial.C_addpup:
          objects.powerups.push(serial.deserializePowerup(obj.powerup));
          ui.showPowerupAnimation();
          break;

        case serial.C_delpup:
          objects.powerups = objects.powerups.filter(powerup => powerup._id !== obj.powerup);
          break;

        case serial.C_deathk:
          ui.addDeathLog(`${obj.ship} was killed by ${obj.by}`);
          break;

        case serial.C_deathc:
          ui.addDeathLog(`${obj.ship} crashed into ${obj.by}`);
          break;

        case serial.C_deathp:
          ui.addDeathLog(`${obj.ship} crashed into a planet`);
          break;

        case serial.C_addpups:
          objects.powerups.push(...obj.powerups.map(serial.deserializePowerup));
          break;
      }
    });
    ws.addEventListener('open', () => {
      onConnect();
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

  tick.serverTick(rubber);
  ui.updateColors(self.health, performance.now());
};

setInterval(serverTick, physics.MS_PER_TICK);
let turnLeftRamp = 0;
let turnRightRamp = 0;

const partialTick = delta => {
  ticksPerFrame = 1.0 * delta / physics.MS_PER_TICK;

  if (!self.latched) {
    // turning
    const turnLeft = controls.isTurningLeft();
    const turnRight = controls.isTurningRight();

    if (turnLeft && !turnRight) {
      self.orient -= turnLeftRamp * TURN_UNIT * ticksPerFrame;
      turnLeftRamp = Math.min(1, turnLeftRamp + ticksPerFrame * 0.1); //physics.onTurn(self, chron.timeMs())

      resendCtrl = true;
    } else if (turnRight && !turnLeft) {
      self.orient += turnRightRamp * TURN_UNIT * ticksPerFrame;
      turnRightRamp = Math.min(1, turnRightRamp + ticksPerFrame * 0.1); //physics.onTurn(self, chron.timeMs())

      resendCtrl = true;
    }

    if (!turnLeft) turnLeftRamp = 0;
    if (!turnRight) turnRightRamp = 0;
  } else {
    turnLeftRamp = 0;
    turnRightRamp = 0;
  } // interpolate


  self.posX += ticksPerFrame * self.velX;
  self.posY += ticksPerFrame * self.velY;

  for (const ship of objects.ships) {
    ship.posX += ticksPerFrame * ship.velX;
    ship.posY += ticksPerFrame * ship.velY;
  }

  for (const bullet of objects.bullets) {
    if (bullet.type == 'bullet' || bullet.type == 'laser') {
      bullet.posX += ticksPerFrame * bullet.velX;
      bullet.posY += ticksPerFrame * bullet.velY;
      bullet.dist += ticksPerFrame * bullet.velocity;
    } else if (bullet.type == 'mine') {
      bullet.dist += ticksPerFrame / (physics.TICKS_PER_SECOND * physics.MINE_LIFETIME);
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
window.addEventListener('beforeunload', () => {
  if (ws) serial.send(ws, serial.e_quit(state.token));
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

  if (lastPartialTick != null) {
    delta = time - lastPartialTick;
    partialTick(delta);
    ui.updateOpacity(delta);
  }

  lastPartialTick = time;
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