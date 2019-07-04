/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/main.js":
/*!********************!*\
  !*** ./js/main.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const physics = __webpack_require__(/*! ../src/physics */ "./src/physics.js");

const geom = __webpack_require__(/*! ../src/utils/geom */ "./src/utils/geom.js");

const chron = __webpack_require__(/*! ../src/utils/chron */ "./src/utils/chron.js");

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const here = document.location;
const ws = new WebSocket(`ws://${here.hostname}:${here.port}${here.pathname}`);
const tps = physics.TICKS_PER_SECOND;
const GRID_SIZE = 10;
const TURN_UNIT = 2 * Math.PI / tps;
let token = null;
let self = null;
let firing = false;
let accel = false;
let accelStart = 0;
let brake = false;
let turn_left = false;
let turn_right = false;
let dead = false;
let ships = [];
let bullets = [];
let turn_left_ramp = 0;
let turn_right_ramp = 0;

const send = msg => {
  if (token) {
    ws.send(`${token} ${msg}`);
  }
};

setInterval(() => {
  let new_angle = self.orient;

  if (turn_left && !turn_right) {
    new_angle -= turn_left_ramp * TURN_UNIT;
    turn_left_ramp = Math.min(1, turn_left_ramp + 0.1);
    accelStart = chron.timeMs();
  } else if (turn_right && !turn_left) {
    new_angle += turn_right_ramp * TURN_UNIT;
    turn_right_ramp = Math.min(1, turn_right_ramp + 0.1);
    accelStart = chron.timeMs();
  }

  if (new_angle != self.orient) {
    self.orient = new_angle;
    send(`turn ${new_angle}`);
  }

  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart);
  }

  if (brake) {
    physics.brake(self);
  }

  physics.inertia(self);
  self.posX += self.velX;
  self.posY += self.velY;
}, 1000 / tps);
window.addEventListener('keydown', e => {
  if (!token || dead) {
    return;
  }

  if (e.code == 'KeyW') {
    accel = true;
    self.accel = accelStart = chron.timeMs();
    send('accel_on');
  } else if (e.code == 'KeyS') {
    brake = true;
    send('brake_on');
  } else if (e.code == 'KeyA') {
    turn_left = true;
  } else if (e.code == 'KeyD') {
    turn_right = true;
  } else if (e.code == 'Space') {
    firing = true;
  }
}, true);
window.addEventListener('keyup', e => {
  if (!token || dead) {
    return;
  }

  if (e.code == 'KeyW') {
    accel = false;
    self.accel = null;
    send('accel_off');
  } else if (e.code == 'KeyS') {
    brake = false;
    send('brake_off');
  } else if (e.code == 'KeyA') {
    turn_left_ramp = 0;
    turn_left = false;
  } else if (e.code == 'KeyD') {
    turn_right_ramp = 0;
    turn_right = false;
  } else if (e.code == 'Space') {
    firing = false;
  }
}, true);
window.addEventListener('blur', e => {
  if (!token || dead) {
    return;
  }

  send('accel_off');
  send('brake_off');
  accel = false;
  self.accel = null;
  brake = false;
  turn_left = false;
  turn_right = false;
  firing = false;
}, true);

const drawShip = (ship, scale) => {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const [p1, p2, p3, p4] = geom.getShipPoints(ship);
  let [x1, y1] = p1;
  let [x2, y2] = p2;
  let [x3, y3] = p3;
  let [x4, y4] = p4;
  x1 = cx + ship.posX - self.posX + x1 * scale;
  x2 = cx + ship.posX - self.posX + x2 * scale;
  x3 = cx + ship.posX - self.posX + x3 * scale;
  x4 = cx + ship.posX - self.posX + x4 * scale;
  y1 = cy + ship.posY - self.posY + y1 * scale;
  y2 = cy + ship.posY - self.posY + y2 * scale;
  y3 = cy + ship.posY - self.posY + y3 * scale;
  y4 = cy + ship.posY - self.posY + y4 * scale;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  if (ship.accel) {
    const [tp1, tp2, tp3, tp4, tp5] = geom.getThrusterPoints(ship);
    let [x1, y1] = tp1;
    let [x2, y2] = tp2;
    let [x3, y3] = tp3;
    let [x4, y4] = tp4;
    let [x5, y5] = tp5;
    let xo = (Math.random() - 0.5) * scale / 4;
    let yo = (Math.random() - 0.5) * scale / 4;
    x1 = cx + ship.posX - self.posX + x1 * scale;
    x2 = cx + ship.posX - self.posX + x2 * scale;
    x3 = cx + ship.posX - self.posX + x3 * scale;
    x4 = cx + ship.posX - self.posX + x4 * scale;
    x5 = cx + ship.posX - self.posX + x5 * scale;
    y1 = cy + ship.posY - self.posY + y1 * scale;
    y2 = cy + ship.posY - self.posY + y2 * scale;
    y3 = cy + ship.posY - self.posY + y3 * scale;
    y4 = cy + ship.posY - self.posY + y4 * scale;
    y5 = cy + ship.posY - self.posY + y5 * scale;
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
    ctx.stroke();
  }
};

const drawBullet = (bullet, scale) => {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  let x = bullet.posX;
  let y = bullet.posY;
  x = cx + bullet.posX - self.posX + x * scale;
  y = cy + bullet.posY - self.posY + y * scale;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 0.2 * scale, 0, 2 * Math.PI);
  ctx.fill();
};

const frame = () => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) * (1 / physics.MAX_BULLET_DISTANCE);

  if (firing) {
    send('fire');
  }

  if (self == null) {
    return;
  }

  const xm = (self.posX % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
  const ym = (self.posY % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // draw grid

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#333';

  for (let x = xm * unitSize; x < ctx.canvas.width; x += GRID_SIZE * unitSize) {
    ctx.beginPath();
    const dx = x | 0 + 0.5;
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx, ctx.canvas.height);
    ctx.stroke();
  }

  for (let y = ym * unitSize; y < ctx.canvas.height; y += GRID_SIZE * unitSize) {
    ctx.beginPath();
    const dy = y | 0 + 0.5;
    ctx.moveTo(0, dy);
    ctx.lineTo(ctx.canvas.width, dy);
    ctx.stroke();
  } // draw player ship


  ctx.lineWidth = 1.5;
  drawShip(self, unitSize); // draw ships

  ctx.lineWidth = 1;

  for (const ship of ships) {
    drawShip(ship, unitSize);
  } // draw bullets


  for (const bullet of bullets) {
    drawBullet(bullet, unitSize);
  }

  window.requestAnimationFrame(frame);
};

ws.addEventListener('open', () => {
  console.log(`  O wonder!
  How many goodly creatures are there here!
  How beauteous mankind is! O brave new world,
  That has such people in't.`);
  dead = false;
});
ws.addEventListener('message', e => {
  const msg = e.data;
  let [cmd, ...args] = msg.split(' ');
  args = args.join(' ');

  if (cmd === 'your_token') {
    if (token === null) {
      window.requestAnimationFrame(frame);
    }

    token = args;
  } else if (cmd === 'you') {
    const obj = JSON.parse(args);

    if (self === null) {
      self = obj;
    } else {
      if (Math.abs(obj.posX - self.posX) > 0.3) {
        self.posX = (self.posX + obj.posX) / 2;
        self.velX = (self.velX + obj.velX) / 2;
      }

      if (Math.abs(obj.posY - self.posY) > 0.3) {
        self.posY = (self.posY + obj.posY) / 2;
        self.velY = (self.velY + obj.velY) / 2;
      }

      if (Math.abs(obj.velX - self.velX) > 0.2) {
        self.velX = obj.velX;
      }

      if (Math.abs(obj.velY - self.velY) > 0.2) {
        self.posY = obj.posY;
      }

      if (self.accel === null && obj.accel !== null) {
        ws.send('accel_off');
      } else if (self.accel !== null && obj.accel === null) {
        ws.send('accel_on');
      } else if (!brake && obj.brake !== null) {
        ws.send('brake_off');
      } else if (brake && obj.brake === null) {
        ws.send('brake_on');
      }
    }
  } else if (cmd === 'unrecognized') {
    token = '';
    self = {};
  } else if (cmd === 'nearby') {
    [ships, bullets] = JSON.parse(args);
  } else if (cmd === 'kill_ship') {
    // display explosion animation????
    if (args == self._id) {
      token = '';
      self = {};
    } else {
      ships = ships.filter(ship => ship._id !== args);
    }
  } else if (cmd === 'remove_ship') {
    if (args == self._id) {
      token = '';
      self = {};
    } else {
      ships = ships.filter(ship => ship._id !== args);
    }
  } else if (cmd === 'remove_bullet') {
    bullets = bullets.filter(bullet => bullet._id !== args);
  }
}); // message types (server -> client):
//      your_token TOKEN
//      you SHIP
//      unrecognized
//      collision_sound
//      kill_ship SHIP_ID
//      remove_ship SHIP_ID
//      remove_bullet BULLET_ID
//      nearby [LIST_OF_SHIPS, LIST_OF_BULLETS]
// message types (client -> server), must be preceded with token:
//      accel_on
//      accel_off
//      brake_on
//      brake_off
//      turn NEW_ORIENTATION
//      fire
//      special_weapon

/***/ }),

/***/ "./src/physics.js":
/*!************************!*\
  !*** ./src/physics.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

const TICKS_PER_SECOND = 30;
const MAX_SHIP_VELOCITY = 32 / TICKS_PER_SECOND;
const MIN_SHIP_VELOCITY = 0.01;
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 2;
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 2.5));
const INERTIA_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 120));
const MAX_BULLET_DISTANCE = 56;
const DELAY_BETWEEN_BULLETS_MS = 250;

const getAccelMul = accelTimeMs => {
  // time in milliseconds
  return 0.0125 + 0.0000125 * accelTimeMs;
};

const checkMinVelocity = ship => {
  const v = Math.hypot(ship.velX, ship.velY);

  if (v <= MIN_SHIP_VELOCITY) {
    ship.velX = 0;
    ship.velY = 0;
  }
};

const checkMaxVelocity = ship => {
  const v = Math.hypot(ship.velX, ship.velY);

  if (v > MAX_SHIP_VELOCITY) {
    ship.velX *= MAX_SHIP_VELOCITY / v;
    ship.velY *= MAX_SHIP_VELOCITY / v;
  }
};

const accel = (ship, accelTimeMs) => {
  const accelMul = getAccelMul(accelTimeMs);
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

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  BULLET_VELOCITY,
  MAX_BULLET_DISTANCE,
  DELAY_BETWEEN_BULLETS_MS,
  accel,
  inertia,
  brake
};

/***/ }),

/***/ "./src/utils/chron.js":
/*!****************************!*\
  !*** ./src/utils/chron.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

const timeMs = () => new Date().getTime();

module.exports = {
  timeMs
};

/***/ }),

/***/ "./src/utils/geom.js":
/*!***************************!*\
  !*** ./src/utils/geom.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

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

const wrapRadianAngle = angle => {
  return (angle + Math.PI) % (2 * Math.PI) - Math.PI;
};

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c];

const getShipPoints = ship => {
  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePoint(s, c, 0, +1), rotatePoint(s, c, +1, +1.5), rotatePoint(s, c, 0, -1), rotatePoint(s, c, -1, +1.5)];
  /*
  return [
    [      s,           c    ], // (0, 1)
    [1.5 * s + c, 1.5 * c - s], // (1, -1.5)
    [     -s,          -c    ], // (0, -1)
    [1.5 * s - c, 1.5 * c + s]] // (-1, 1.5)
    */
};

const getThrusterPoints = ship => {
  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePoint(s, c, 0, +1), rotatePoint(s, c, +0.5, +1.25), rotatePoint(s, c, 0, +2.5), rotatePoint(s, c, -0.5, +1.25), rotatePoint(s, c, 0, +1.75)];
  /*
  return [
    [       -s          ,        -c          ], // (0, -1)
    [-1.25 * s + 0.5 * c, -1.25 * c - 0.5 * s], // (0.5, -1.25)
    [   -2 * s          ,    -2 * c          ], // (0, -2)
    [-1.25 * s - 0.5 * c, -1.25 * c + 0.5 * s], // (0.5, -1.25)
    [-1.75 * s          , -1.75 * c          ]] // (0, -1.75)
    */
};

module.exports = {
  pointInTriangle,
  wrapRadianAngle,
  getShipPoints,
  getThrusterPoints
};

/***/ })

/******/ });
//# sourceMappingURL=main.bundle.js.map