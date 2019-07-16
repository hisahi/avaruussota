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

const LCG = __webpack_require__(/*! ../src/utils/lcg */ "./src/utils/lcg.js");

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const here = document.location;
const tps = physics.TICKS_PER_SECOND;
const GRID_SIZE = 10;
const TURN_UNIT = 2 * Math.PI / tps;
const TICK_MS = 1000 / tps;
const PLANET_SPIN_SPEED = 0.02;
let lcg = new LCG(0);
let inGame = false;
let ws = null;
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
let lines = [];
let planets = [];
let tpf = 1;
let planetAngle = 0;
let playerCount = 1;
let leaderboard = [];
let rubber = 150;
let last_partial = null;
let send_turn = false;

const showDialog = () => {
  document.getElementById('dialog').style.display = 'block';
  document.getElementById('stats').style.display = 'none';
};

const hideDialog = () => {
  document.getElementById('dialog').style.display = 'none';
  document.getElementById('stats').style.display = 'block';
};

const hideLose = () => {
  document.getElementById('defeat').style.display = 'none';
  document.getElementById('defeatcrash').style.display = 'none';
  document.getElementById('defeatplanet').style.display = 'none';
  document.getElementById('defeatname').style.display = 'none';
  document.getElementById('disconnected').style.display = 'none';
};

hideLose();

const joinGame = () => {
  if (!inGame) {
    hideDialog();
    let wsproto = here.protocol.replace('http', 'ws');
    let port = here.port;

    if (port) {
      port = `:${port}`;
    }

    ws = new WebSocket(`${wsproto}//${here.hostname}${port}${here.pathname}`);
    inGame = true;
    ws.addEventListener('message', e => {
      const msg = e.data;
      let [cmd, ...args] = msg.split(' ');
      args = args.join(' ');

      if (cmd === 'your_token') {
        if (token == null) {
          window.requestAnimationFrame(frame);
        }

        token = args;
        let nick = document.getElementById('nick').value.trim();

        if (nick.length < 1) {
          nick = (100000000 * Math.random() | 0).toString();
        }

        send(`nick ${nick}`);
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

          if (!accel && obj.accel !== null) {
            send_turn = true;
          } else if (accel && obj.accel === null) {
            send_turn = true;
          } else if (!brake && obj.brake !== null) {
            send_turn = true;
          } else if (brake && obj.brake === null) {
            send_turn = true;
          }

          self.name = obj.name;
          document.getElementById('yourscore').textContent = self.score = obj.score;
        }
      } else if (cmd === 'players') {
        [playerCount, rubber] = JSON.parse(args);
        document.getElementById('playerCountNum').textContent = playerCount;
      } else if (cmd === 'leaderboard') {
        leaderboard = JSON.parse(args);
        drawLeaderboard();
      } else if (cmd === 'set_orient') {
        self.orient = parseFloat(args);
      } else if (cmd === 'unrecognized') {
        leaveGame();
      } else if (cmd === 'nearby') {
        [ships, bullets] = JSON.parse(args);
      } else if (cmd === 'defeated') {
        hideLose();
        leaveGame();
        document.getElementById('defeat').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = args;
      } else if (cmd === 'defeated_collision') {
        hideLose();
        leaveGame();
        document.getElementById('defeatcrash').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = args;
      } else if (cmd === 'defeated_planet') {
        hideLose();
        leaveGame();
        document.getElementById('defeatplanet').style.display = 'inline';
      } else if (cmd === 'kill_ship') {
        const matching = ships.find(ship => ship._id === args);

        if (matching !== null) {
          explosion(matching);
        }

        ships = ships.filter(ship => ship._id !== args);
      } else if (cmd === 'remove_ship') {
        ships = ships.filter(ship => ship._id !== args);
      } else if (cmd === 'remove_bullet') {
        bullets = bullets.filter(bullet => bullet._id !== args);
      }
    });
    ws.addEventListener('open', () => {
      dead = false;
      ws.send('join');
    });
    ws.addEventListener('close', () => {
      if (!dead) {
        hideLose();
        document.getElementById('disconnected').style.display = 'inline';
        leaveGame();
      }

      dead = true;
    });
  }
};

const leaveGame = () => {
  if (ws !== null) {
    ws.close();
  }

  dead = true;
  self = null;
  ws = null;
  token = null;
  inGame = false;
  accel = false;
  brake = false;
  turn_left = false;
  turn_right = false;
  firing = false;
  showDialog();
};

const send = msg => {
  if (token) {
    ws.send(`${token} ${msg}`);
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

const drawLeaderboard = () => {
  const leaderBoardTable = document.getElementById('leaderboard');
  const newBody = document.createElement('tbody');

  for (let i = 0; i < Math.min(10, leaderboard.length); ++i) {
    newBody.appendChild(makeTableRow(leaderboard[i]));
  }

  leaderBoardTable.replaceChild(newBody, leaderBoardTable.childNodes[0]);
};

const serverTick = () => {
  if (!ws || !self) {
    return;
  }

  if (send_turn) {
    send(`control ${JSON.stringify([self.orient, accel, brake])}`);
    send_turn = false;
  }

  if (firing) {
    send('fire');
  }

  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart);
  }

  if (brake) {
    physics.brake(self);
  }

  physics.inertia(self);
  physics.rubberband(self, rubber);
  planets = physics.getPlanets(self.posX, self.posY);
  physics.gravityShip(self, planets);

  for (const bullet of bullets) {
    physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY));
  }
};

setInterval(serverTick, TICK_MS);

const partialTick = delta => {
  tpf = 1.0 * delta / TICK_MS; // turning

  if (turn_left && !turn_right) {
    self.orient -= turn_left_ramp * TURN_UNIT * tpf;
    turn_left_ramp = Math.min(1, turn_left_ramp + tpf * 0.1);
    accelStart = chron.timeMs();
    send_turn = true;
  } else if (turn_right && !turn_left) {
    self.orient += turn_right_ramp * TURN_UNIT * tpf;
    turn_right_ramp = Math.min(1, turn_right_ramp + tpf * 0.1);
    accelStart = chron.timeMs();
    send_turn = true;
  } // interpolate


  self.posX += tpf * self.velX;
  self.posY += tpf * self.velY;

  for (const ship of ships) {
    ship.posX += tpf * ship.velX;
    ship.posY += tpf * ship.velY;
  }

  for (const bullet of bullets) {
    bullet.posX += tpf * bullet.velX;
    bullet.posY += tpf * bullet.velY;
  }
};

window.addEventListener('keydown', e => {
  if (!token || dead) {
    return;
  }

  if (e.code == 'KeyW') {
    accel = true;
    self.accel = accelStart = chron.timeMs();
    send_turn = true;
  } else if (e.code == 'KeyS') {
    brake = true;
    send_turn = true;
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
    send_turn = true;
  } else if (e.code == 'KeyS') {
    brake = false;
    send_turn = true;
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
window.addEventListener('blur', () => {
  if (!token || dead) {
    return;
  }

  accel = false;
  self.accel = null;
  brake = false;
  turn_left = false;
  turn_right = false;
  firing = false;
  send_turn = true;
}, true);
window.addEventListener('beforeupload', () => {
  send('disconnect');
}, true);

const drawShip = (ship, scale) => {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const [p1, p2, p3, p4] = geom.getShipPoints(ship);
  let [x1, y1] = p1;
  let [x2, y2] = p2;
  let [x3, y3] = p3;
  let [x4, y4] = p4;
  let [x0, y0] = [0, 0];
  x0 = cx + (self.posX - ship.posX) * scale;
  x1 = cx + (self.posX - ship.posX + x1) * scale;
  x2 = cx + (self.posX - ship.posX + x2) * scale;
  x3 = cx + (self.posX - ship.posX + x3) * scale;
  x4 = cx + (self.posX - ship.posX + x4) * scale;
  y0 = cy + (self.posY - ship.posY) * scale;
  y1 = cy + (self.posY - ship.posY + y1) * scale;
  y2 = cy + (self.posY - ship.posY + y2) * scale;
  y3 = cy + (self.posY - ship.posY + y3) * scale;
  y4 = cy + (self.posY - ship.posY + y4) * scale;
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
    x1 = cx + (self.posX - ship.posX + x1) * scale;
    x2 = cx + (self.posX - ship.posX + x2) * scale;
    x3 = cx + (self.posX - ship.posX + x3) * scale;
    x4 = cx + (self.posX - ship.posX + x4) * scale;
    x5 = cx + (self.posX - ship.posX + x5) * scale;
    y1 = cy + (self.posY - ship.posY + y1) * scale;
    y2 = cy + (self.posY - ship.posY + y2) * scale;
    y3 = cy + (self.posY - ship.posY + y3) * scale;
    y4 = cy + (self.posY - ship.posY + y4) * scale;
    y5 = cy + (self.posY - ship.posY + y5) * scale;
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

  ctx.font = '18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText(ship.name, x0, y0 - 2.75 * scale);
};

const drawBullet = (bullet, scale) => {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const x = cx + (self.posX - bullet.posX) * scale;
  const y = cy + (self.posY - bullet.posY) * scale;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 0.2 * scale, 0, 2 * Math.PI);
  ctx.fill();
};

const drawLine = (line, scale) => {
  const {
    x,
    y,
    angle,
    r,
    alpha
  } = line;
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const x1 = cx + scale * (x + self.posX - line.xr - r * Math.cos(angle));
  const y1 = cy + scale * (y + self.posY - line.yr - r * Math.sin(angle));
  const x2 = cx + scale * (x + self.posX - line.xr + r * Math.cos(angle));
  const y2 = cy + scale * (y + self.posY - line.yr + r * Math.sin(angle));
  ctx.strokeStyle = `rgba(192,192,192,${alpha * 0.01})`;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const createLine = (x1, y1, x2, y2, xr, yr, xv, yv) => {
  const [x, y] = [(x1 + x2) / 2, (y1 + y2) / 2];
  const angle = Math.atan2(x2 - x1, y2 - y1);
  const r = Math.hypot(x2 - x1, y2 - y1) / 2;
  const vx = -0.05 + 0.1 * Math.random() - xv * tpf;
  const vy = -0.05 + 0.1 * Math.random() - yv * tpf;
  const vangle = -0.1 + 0.2 * Math.random(); // x, y, xr, yr, angle, r, alpha, vx, vy, vangle

  return {
    x,
    y,
    xr,
    yr,
    angle,
    alpha: 100,
    r,
    vx,
    vy,
    vangle
  };
};

const computePlanetAngle = (planet, angle, scale, cx, cy) => {
  const x = planet.x + Math.sin(angle) * planet.radius;
  const y = planet.y + Math.cos(angle) * planet.radius;
  return [cx + (self.posX - x) * scale, cy + (self.posY - y) * scale];
};

const drawPlanet = (planet, scale) => {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  lcg.reseed(planet.seed);
  const gon = Math.abs(lcg.randomInt()) % 24 + 14;
  let angle = lcg.randomOffset() * Math.PI * 2 + planetAngle * (2 * (lcg.randomInt() & 1) - 1);
  let [x, y] = computePlanetAngle(planet, angle, scale, cx, cy);
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < gon; ++i) {
    angle += 2 * Math.PI / gon;
    [x, y] = computePlanetAngle(planet, angle, scale, cx, cy);
    ctx.lineTo(x, y);
  }

  ctx.stroke();
};

const explosion = ship => {
  const [p1, p2, p3, p4] = geom.getShipPoints(ship);
  let [x1, y1] = p1;
  let [x2, y2] = p2;
  let [x3, y3] = p3;
  let [x4, y4] = p4;
  let [x5, y5] = [(x1 + x2) / 2, (y1 + y2) / 2];
  let [x6, y6] = [(x1 + x4) / 2, (y1 + y4) / 2];
  lines.push(createLine(x1, y1, x5, y5, ship.posX, ship.posY, ship.velX, ship.velY));
  lines.push(createLine(x5, y5, x2, y2, ship.posX, ship.posY, ship.velX, ship.velY));
  lines.push(createLine(x2, y2, x3, y3, ship.posX, ship.posY, ship.velX, ship.velY));
  lines.push(createLine(x3, y3, x4, y4, ship.posX, ship.posY, ship.velX, ship.velY));
  lines.push(createLine(x4, y4, x6, y6, ship.posX, ship.posY, ship.velX, ship.velY));
  lines.push(createLine(x6, y6, x1, y1, ship.posX, ship.posY, ship.velX, ship.velY));
};

const frame = time => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) * (1 / physics.MAX_BULLET_DISTANCE);

  if (!token || !self) {
    return;
  }

  if (last_partial != null) {
    const delta = time - last_partial;
    partialTick(delta);
  }

  last_partial = time;
  const xm = (self.posX % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
  const ym = (self.posY % GRID_SIZE + GRID_SIZE) % GRID_SIZE;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const gradient = ctx.createRadialGradient(cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber - 1) * unitSize, cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber + physics.RUBBERBAND_BUFFER - 1) * unitSize);
  gradient.addColorStop(0, 'rgba(255,0,0,0)');
  gradient.addColorStop(1, 'rgba(255,0,0,0.25)'); // draw mask

  ctx.beginPath();
  ctx.arc(cx + self.posX * unitSize, cy + self.posY * unitSize, rubber * unitSize, 0, 2 * Math.PI);
  ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = gradient;
  ctx.fill(); // draw grid

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
  } // draw planets


  for (const planet of planets) {
    drawPlanet(planet, unitSize);
  } // draw lines


  for (const line of lines) {
    drawLine(line, unitSize);
    line.x += line.vx;
    line.y += line.vy;
    line.angle += line.vangle;
    line.vx *= 0.99;
    line.vy *= 0.99;
    line.vangle *= 0.99;
    line.alpha -= 1;
  }

  lines = lines.filter(line => line.alpha > 0);
  planetAngle += PLANET_SPIN_SPEED;
  planetAngle %= 2 * Math.PI;
  window.requestAnimationFrame(frame);
};

document.getElementById('btnplay').addEventListener('click', () => joinGame());
leaveGame();
showDialog();

/***/ }),

/***/ "./src/physics.js":
/*!************************!*\
  !*** ./src/physics.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const TICKS_PER_SECOND = 24;
const MAX_SHIP_VELOCITY = 32 / TICKS_PER_SECOND;
const MIN_SHIP_VELOCITY = 0.01;
const LATCH_VELOCITY = 0.15;
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 2;
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 2.5));
const INERTIA_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90));
const MAX_BULLET_DISTANCE = 56;
const DELAY_BETWEEN_BULLETS_MS = 250;
const RUBBERBAND_BUFFER = 80;
const PLANET_SEED = 1340985549;

const LCG = __webpack_require__(/*! ./utils/lcg */ "./src/utils/lcg.js");

const PLANET_CHUNK_SIZE = MAX_BULLET_DISTANCE * 2 + 1;

const getAccelMul = accelTimeMs => {
  // time in milliseconds
  return 0.05 + 0.000025 * accelTimeMs;
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
}; // planet: x, y, radius, seed


const getPlanetsForChunk = (cx, cy) => {
  const r = PLANET_CHUNK_SIZE;
  const lcg = new LCG((PLANET_SEED ^ cx * 1173320513 ^ cy * 891693747) & 0xFFFFFFFF);
  const xb = (cx + 0.5) * r;
  const yb = (cy + 0.5) * r;
  const xo = lcg.randomOffset() * (r / 4);
  const yo = lcg.randomOffset() * (r / 4);
  const radius = r / 24 + r / 8 * lcg.random();
  const seed = lcg.randomInt();
  return [{
    x: xb + xo,
    y: yb + yo,
    radius,
    seed
  }];
};

const getPlanets = (x, y) => {
  const x1 = Math.floor((x - MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const y1 = Math.floor((y - MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const x2 = Math.floor((x + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const y2 = Math.floor((y + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);

  if (x1 == x2 && y1 == y2) {
    return getPlanetsForChunk(x1, y1);
  } else if (x1 == x2) {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x1, y2)];
  } else if (y1 == y2) {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x2, y1)];
  } else {
    return [...getPlanetsForChunk(x1, y1), ...getPlanetsForChunk(x2, y1), ...getPlanetsForChunk(x1, y2), ...getPlanetsForChunk(x2, y2)];
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

const gravityBullet = (bullet, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y);

    if (d > planet.radius + 1.2 && d < planet.radius * 2.5) {
      const dx = planet.x - bullet.posX;
      const dy = planet.y - bullet.posY;
      const d2 = Math.hypot(dx, dy);
      const m = BULLET_VELOCITY * planet.radius ** 1.25 / (d2 * d2);
      bullet.velX += m / d2 * dx;
      bullet.velY += m / d2 * dy;
    }
  }

  const d = Math.hypot(bullet.velX, bullet.velY);
  bullet.velX *= BULLET_VELOCITY / d;
  bullet.velY *= BULLET_VELOCITY / d;
};

const gravityShip = (ship, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y);

    if (d > planet.radius + 1.2 && d < planet.radius * 2.5) {
      const dx = planet.x - ship.posX;
      const dy = planet.y - ship.posY;
      const d2 = Math.hypot(dx, dy);
      const m = MAX_SHIP_VELOCITY / 24 * planet.radius ** 1.5 / (d2 * d2);
      ship.velX += m / d2 * dx;
      ship.velY += m / d2 * dy;
    }
  }

  checkMaxVelocity(ship);
};

const getRubberbandRadius = playerCount => {
  return 100 * Math.pow(Math.max(playerCount, 1), 0.4);
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

    ship.velX += baseX * 0.25 * MAX_SHIP_VELOCITY * ((distCenter - radius) / (maxRadius - radius)) ** 4;
    ship.velY += baseY * 0.25 * MAX_SHIP_VELOCITY * ((distCenter - radius) / (maxRadius - radius)) ** 4;
    checkMaxVelocity(ship);
  }
};

module.exports = {
  TICKS_PER_SECOND,
  MAX_SHIP_VELOCITY,
  BULLET_VELOCITY,
  LATCH_VELOCITY,
  MAX_BULLET_DISTANCE,
  DELAY_BETWEEN_BULLETS_MS,
  RUBBERBAND_BUFFER,
  accel,
  inertia,
  brake,
  gravityBullet,
  gravityShip,
  rubberband,
  getPlanets,
  getRubberbandRadius
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

const rotatePointOffset = (s, c, x, y, xo, yo) => [xo + x * c - y * s, yo + x * s + y * c];

const getShipPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePoint(s, c, 0, +1), rotatePoint(s, c, +1, +1.5), rotatePoint(s, c, 0, -1), rotatePoint(s, c, -1, +1.5)];
};

const getRealShipPoints = ship => {
  if (!ship) {
    return [];
  }

  const points = getShipPoints(ship);
  return [[points[0][0] + ship.posX, points[0][1] + ship.posY], [points[1][0] + ship.posX, points[1][1] + ship.posY], [points[2][0] + ship.posX, points[2][1] + ship.posY], [points[3][0] + ship.posX, points[3][1] + ship.posY]];
};

const getCollisionPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePointOffset(s, c, 0, 0, ship.posX, ship.posY), rotatePointOffset(s, c, +0.5, +0.75, ship.posX, ship.posY), rotatePointOffset(s, c, -0.5, +0.75, ship.posX, ship.posY)];
};

const getThrusterPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePoint(s, c, 0, +1), rotatePoint(s, c, +0.5, +1.25), rotatePoint(s, c, 0, +2.5), rotatePoint(s, c, -0.5, +1.25), rotatePoint(s, c, 0, +1.75)];
};

module.exports = {
  pointInTriangle,
  wrapRadianAngle,
  getShipPoints,
  getRealShipPoints,
  getCollisionPoints,
  getThrusterPoints
};

/***/ }),

/***/ "./src/utils/lcg.js":
/*!**************************!*\
  !*** ./src/utils/lcg.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

const LCG_A = 535426113;
const LCG_C = 2258250855;

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
    let v = this.randomInt() / 2.0 ** 32;

    if (v < 0) {
      v += 1;
    }

    return v;
  }

  randomOffset() {
    return 2 * this.random() - 1;
  }

}

module.exports = Generator;

/***/ })

/******/ });
//# sourceMappingURL=main.bundle.js.map