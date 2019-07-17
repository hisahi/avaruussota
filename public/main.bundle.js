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
const BASE_SELF = {
  dead: true,
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0
};
let lcg = new LCG(0);
let inGame = false;
let ws = null;
let token = null;
let self = BASE_SELF;
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
let no_data = 0;
let pinger = null;
let planetSeed = 0;
let dialogOpacity = 0;
let damageAlpha = 0;
let damageGot = 0;
let last_partial = null;
let send_turn = false;
document.getElementById('scoreanimation').style.animation = 'none';
document.getElementById('scoreanimation').style.opacity = '0';

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const checkSize = () => {
  if (dead) {
    document.getElementById('mobilecontrols').style.display = 'none';
  } else {
    document.getElementById('mobilecontrols').style.display = isMobile() ? 'block' : 'none';
  }
};

document.addEventListener('resize', () => checkSize());
checkSize();

const showDialog = () => {
  dialogOpacity = 0;
  document.getElementById('dialogbox').style.opacity = '0';
  document.getElementById('dialog').style.display = 'block';
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

const joinGame = () => {
  if (!inGame) {
    document.getElementById('scoreanimation').style.animation = 'none';
    document.getElementById('scoreanimation').style.opacity = '0';
    document.getElementById('onlinestatus').textContent = 'connecting';
    hideDialog();
    lines = [];
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
        document.getElementById('onlinestatus').textContent = 'in game';
        token = args;
        let nick = document.getElementById('nick').value.trim();

        if (nick.length < 1) {
          nick = (100000000 * Math.random() | 0).toString();
        }

        send(`nick ${nick}`);
      } else if (cmd === 'pong') {
        const now = performance.now();
        document.getElementById('onlinestatus').textContent = `in game, ping: ${Math.max(now - JSON.parse(args), 0).toFixed(1)}ms`;
      } else if (cmd === 'data') {
        no_data = 0;
        let obj = null;
        [obj, ships, bullets, playerCount, rubber, planetSeed] = JSON.parse(args);

        if (self.dead) {
          self = obj;
          self.dead = false;
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

          document.getElementById('yourscore').textContent = document.getElementById('scoreanimation').textContent = document.getElementById('finalscorenum').textContent = obj.score;

          if (obj.score > self.score) {
            document.getElementById('scoreanimation').style.opacity = '1';
            document.getElementById('scoreanimation').style.animation = 'none';
            document.getElementById('scoreanimation').style.animation = '';
          }

          self.name = obj.name;
          self.score = obj.score;
          self.dead = obj.dead;

          if (obj.health < self.health) {
            damageAlpha = 0.8 * (self.health - obj.health);
            damageGot = performance.now() + (self.health - obj.health) * 2;
          }

          self.health = obj.health;
          self.latched = obj.latched;
        }

        if (physics.getPlanetSeed() != planetSeed) {
          physics.setPlanetSeed(planetSeed);
          planets = physics.getPlanets(self.posX, self.posY);
        }

        physics.setPlanetSeed(planetSeed);
        document.getElementById('playerCountNum').textContent = playerCount;
        document.getElementById('healthbarhealth').style.width = `${0 | self.health * 200}px`;
      } else if (cmd === 'leaderboard') {
        leaderboard = JSON.parse(args);
        drawLeaderboard();
      } else if (cmd === 'set_orient') {
        self.orient = parseFloat(args);
      } else if (cmd === 'unrecognized') {
        leaveGame();
      } else if (cmd === 'defeated') {
        explosion(self);
        hideLose();
        leaveGame();
        document.getElementById('defeat').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = args;
      } else if (cmd === 'defeated_collision') {
        explosion(self);
        hideLose();
        leaveGame();
        document.getElementById('defeatcrash').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = args;
      } else if (cmd === 'defeated_planet') {
        explosion(self);
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
      } else {
        console.log('unknown cmd', cmd);
      }
    });
    ws.addEventListener('open', () => {
      dead = false;
      document.getElementById('onlinestatus').textContent = 'waiting for spawn';
      ws.send('join');
      checkSize();
      pinger = setInterval(() => {
        if (++no_data > 8) {
          hideLose();
          document.getElementById('disconnected').style.display = 'inline';
          leaveGame();
        }

        ws.send('ping ' + performance.now());
      }, 1000);
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
  if (pinger !== null) {
    clearInterval(pinger);
    pinger = null;
  }

  if (ws !== null) {
    ws.close();
  }

  token = null;
  dead = self.dead = true;
  ws = null;
  inGame = accel = brake = turn_left = turn_right = firing = false;
  damageGot = damageAlpha = 0;
  document.getElementById('onlinestatus').textContent = 'offline';
  showDialog();
  checkSize();
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
    self.velX *= 0.95;
    self.velY *= 0.95;
    return;
  }

  if (send_turn) {
    send(`control ${JSON.stringify([self.orient, accel, brake, firing])}`);
    send_turn = false;
  }

  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart);
  }

  if (brake) {
    physics.brake(self);
  }

  if (firing && chron.timeMs() - self.lastFired >= physics.DELAY_BETWEEN_BULLETS_MS) {
    physics.recoil(self);
  }

  physics.inertia(self);

  if (!self.latched) {
    physics.rubberband(self, rubber);
    planets = physics.getPlanets(self.posX, self.posY);
    physics.gravityShip(self, planets);
  }

  for (const bullet of bullets) {
    physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY));
  }
};

setInterval(serverTick, TICK_MS);

const partialTick = delta => {
  tpf = 1.0 * delta / TICK_MS;

  if (!self.latched) {
    // turning
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
    }
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

const jouter = document.getElementById('joystickouter');
const jbase = document.getElementById('joystickbase');
const jstick = document.getElementById('joystick');

const applyPosition = () => {
  if (dead || self === null) {
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
  let shouldUpdateAccelStart = willAccel != accel;

  if (!self.latched && h > 0.01) {
    const angle = Math.atan2(x, -y);
    shouldUpdateAccelStart |= self.orient != angle;
    self.orient = angle;
  }

  accel = willAccel;

  if (shouldUpdateAccelStart) {
    accelStart = chron.timeMs();
    send_turn = true;
  }
};

const resetJoystickCenter = () => {
  jstick.style.top = jbase.offsetTop + jbase.offsetHeight / 2 - jstick.offsetHeight / 2 + 'px';
  jstick.style.left = jbase.offsetLeft + jbase.offsetWidth / 2 - jstick.offsetWidth / 2 + 'px';
  applyPosition();
};

resetJoystickCenter();
jbase.addEventListener('pointerdown', e => {
  jstick.style.left = e.pageX - jstick.offsetWidth / 2 + 'px';
  jstick.style.top = e.pageY - jstick.offsetHeight / 2 + 'px';
  applyPosition();
});
jbase.addEventListener('pointermove', e => {
  if (e.pressure > 0) {
    jstick.style.left = e.pageX - jstick.offsetWidth / 2 + 'px';
    jstick.style.top = e.pageY - jstick.offsetHeight / 2 + 'px';
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
  console.log('out');
  resetJoystickCenter();
});
jouter.addEventListener('pointerup', () => {
  console.log('up');
  resetJoystickCenter();
});
document.getElementById('btnfire').addEventListener('pointerdown', () => {
  firing = true;
  send_turn = true;
});
document.getElementById('btnfire').addEventListener('pointerover', e => {
  if (e.pressure > 0) {
    firing = true;
    send_turn = true;
  }
});
document.getElementById('btnfire').addEventListener('pointerout', () => {
  firing = false;
  send_turn = true;
});
document.getElementById('btnfire').addEventListener('pointerup', () => {
  firing = false;
  send_turn = true;
});
document.getElementById('btnbrake').addEventListener('pointerdown', () => {
  brake = true;
  send_turn = true;
});
document.getElementById('btnbrake').addEventListener('pointerover', e => {
  if (e.pressure > 0) {
    brake = true;
    send_turn = true;
  }
});
document.getElementById('btnbrake').addEventListener('pointerout', () => {
  brake = false;
  send_turn = true;
});
document.getElementById('btnbrake').addEventListener('pointerup', () => {
  brake = false;
  send_turn = true;
});
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
    send_turn = true;
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
    send_turn = true;
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
  const unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) * ((isMobile() ? 3 / 4 : 1 / 2) / physics.MAX_BULLET_DISTANCE);
  let delta = 0;

  if (last_partial != null) {
    delta = time - last_partial;
    partialTick(delta);

    if (dialogOpacity < 1) {
      dialogOpacity = Math.min(1, dialogOpacity + delta / 250);
      document.getElementById('dialogbox').style.opacity = dialogOpacity;
    }
  }

  last_partial = time;
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
  }

  if (!self.dead) {
    // draw red mask
    const gradient = ctx.createRadialGradient(cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber - 1) * unitSize, cx + self.posX * unitSize, cy + self.posY * unitSize, (rubber + physics.RUBBERBAND_BUFFER - 1) * unitSize);
    gradient.addColorStop(0, 'rgba(192,192,192,0)');
    gradient.addColorStop(1, 'rgba(192,192,192,0.25)');
    ctx.beginPath();
    ctx.arc(cx + self.posX * unitSize, cy + self.posY * unitSize, rubber * unitSize, 0, 2 * Math.PI);
    ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = gradient;
    ctx.fill(); // draw player ship

    ctx.lineWidth = 1.5;
    drawShip(self, unitSize); // draw ships

    ctx.lineWidth = 1;

    for (const ship of ships) {
      drawShip(ship, unitSize);
    } // draw bullets


    for (const bullet of bullets) {
      drawBullet(bullet, unitSize);
    }
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

  if (!self.dead) {
    // draw black mask
    const bgradient = ctx.createRadialGradient(cx, cy, (physics.MAX_BULLET_DISTANCE - 1) * unitSize, cx, cy, (physics.MAX_BULLET_DISTANCE + 10) * unitSize);
    bgradient.addColorStop(0, 'rgba(0,0,0,0)');
    bgradient.addColorStop(0.5, 'rgba(0,0,0,0.2)');
    bgradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.beginPath();
    ctx.arc(cx, cy, (physics.MAX_BULLET_DISTANCE - 1) * unitSize, 0, 2 * Math.PI);
    ctx.rect(ctx.canvas.width, 0, -ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = bgradient;
    ctx.fill();

    if (damageAlpha > 0) {
      ctx.fillStyle = `rgba(128,0,0,${damageAlpha})`;
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fill();

      if (time > damageGot && damageAlpha > 0) {
        damageAlpha = Math.max(0, damageAlpha - delta / 800);
      }
    }
  }

  if (self.health < 0.3) {
    document.getElementById('yourscore').style.color = time % 1000 >= 500 ? '#f00' : '#fff';
    document.getElementById('healthbarhealth').style.background = (time + 250) % 1000 >= 500 ? '#800' : '#c00';
  } else if (self.health < 0.7) {
    document.getElementById('yourscore').style.color = '#fff';
    const t = (self.health - 0.3) / 0.4 * 204;
    document.getElementById('healthbarhealth').style.background = `rgba(204,${t},${t})`;
  } else {
    document.getElementById('yourscore').style.color = '#fff';
    document.getElementById('healthbarhealth').style.background = '#ccc';
  }

  planetAngle += PLANET_SPIN_SPEED;
  planetAngle %= 2 * Math.PI;
  window.requestAnimationFrame(frame);
};

document.getElementById('btnplay').addEventListener('click', () => joinGame());
document.getElementById('btnfs').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});
window.requestAnimationFrame(frame);
leaveGame();
showDialog();
hideLose();

/***/ }),

/***/ "./src/physics.js":
/*!************************!*\
  !*** ./src/physics.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const GRAV = 6.67e-11;
const TICKS_PER_SECOND = 24;
const MAX_SHIP_VELOCITY = 48 / TICKS_PER_SECOND;
const MIN_SHIP_VELOCITY = 0.01;
const LATCH_VELOCITY = 0.2;
const BULLET_VELOCITY = MAX_SHIP_VELOCITY * 1.75;
const BRAKE_MUL = (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 1.5));
const INERTIA_MUL = 1; // (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))

const MAX_BULLET_DISTANCE = 50;
const DELAY_BETWEEN_BULLETS_MS = 250;
const RUBBERBAND_BUFFER = 80;

const LCG = __webpack_require__(/*! ./utils/lcg */ "./src/utils/lcg.js");

const PLANET_CHUNK_SIZE = MAX_BULLET_DISTANCE * 2 + 1;
let PLANET_SEED = 1340985553;

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
  const maxvel = MAX_SHIP_VELOCITY * healthToVelocity(ship.health);
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
  const x2 = Math.floor(x / PLANET_CHUNK_SIZE);
  const x3 = Math.floor((x + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const y1 = Math.floor((y - MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const y2 = Math.floor(y / PLANET_CHUNK_SIZE);
  const y3 = Math.floor((y + MAX_BULLET_DISTANCE) / PLANET_CHUNK_SIZE);
  const xu = [];
  const yu = [];
  let planets = [];
  xu.push(x2);

  if (x1 != x2) {
    xu.push(x1);
  }

  if (x2 != x3) {
    xu.push(x3);
  }

  yu.push(y2);

  if (y1 != y2) {
    yu.push(y1);
  }

  if (y2 != y3) {
    yu.push(y3);
  }

  for (const x of xu) {
    for (const y of yu) {
      planets = [...planets, ...getPlanetsForChunk(x, y)];
    }
  }

  return planets;
};

const accel = (ship, accelTimeMs) => {
  const accelMul = getAccelMul(accelTimeMs) * healthToVelocity(ship.health);
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
  ship.velX -= 0.02 * Math.sin(-ship.orient);
  ship.velY -= 0.02 * Math.cos(-ship.orient);
  checkMaxVelocity(ship);
};

const gravityBullet = (bullet, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(bullet.posX - planet.x, bullet.posY - planet.y);

    if (d > planet.radius + 1.2 && d < planet.radius * 3) {
      const dx = planet.x - bullet.posX;
      const dy = planet.y - bullet.posY;
      const r2 = Math.hypot(dx, dy) ** 2;
      const f = GRAV * 8e+9 / r2 * planet.radius;
      bullet.velX += f * dx;
      bullet.velY += f * dy;
    }
  }

  const d = Math.hypot(bullet.velX, bullet.velY);
  bullet.velX *= BULLET_VELOCITY / d;
  bullet.velY *= BULLET_VELOCITY / d;
};

const gravityShip = (ship, planets) => {
  for (const planet of planets) {
    const d = Math.hypot(ship.posX - planet.x, ship.posY - planet.y);

    if (d > planet.radius + 1 && d < planet.radius * 3) {
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
  return 0.6 + 0.4 * Math.pow(health, 1.5);
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

const EPSILON = 1e-10;

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

const handleZeroEpsilon = x => {
  return Math.abs(x) < EPSILON ? 0 : x;
};

const pointOrientation = (p, q, r) => {
  return Math.sign(handleZeroEpsilon((q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])));
};

const onCollinearSegment = (p, q, r) => {
  return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) && q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
};

const lineIntersectsLine = (a1, a2, b1, b2) => {
  const o1 = pointOrientation(a1, b1, a2);
  const o2 = pointOrientation(a1, b1, b2);
  const o3 = pointOrientation(a2, b2, a1);
  const o4 = pointOrientation(a2, b2, b1);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  return o1 == 0 && onCollinearSegment(a1, a2, b1) || o2 == 0 && onCollinearSegment(a1, b2, b1) || o3 == 0 && onCollinearSegment(a2, a1, b2) || o4 == 0 && onCollinearSegment(a2, b1, b2);
};

const lineIntersectsTriangle = (l1, l2, t1, t2, t3) => {
  return lineIntersectsLine(l1, l2, t1, t2) || lineIntersectsLine(l1, l2, t2, t3) || lineIntersectsLine(l1, l2, t3, t1);
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

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c];

const rotatePointOffset = (s, c, x, y, xo, yo) => [xo + x * c - y * s, yo + x * s + y * c];

const getShipPoints = ship => {
  if (!ship) {
    return [];
  }

  const s = Math.sin(ship.orient);
  const c = Math.cos(ship.orient);
  return [rotatePoint(s, c, 0, -1), rotatePoint(s, c, +1, +1.5), rotatePoint(s, c, 0, +1), rotatePoint(s, c, -1, +1.5)];
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
  return [rotatePointOffset(s, c, 0, 0, ship.posX, ship.posY), rotatePointOffset(s, c, +0.83, +1.25, ship.posX, ship.posY), rotatePointOffset(s, c, -0.83, +1.25, ship.posX, ship.posY)];
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
  lineIntersectsLine,
  lineIntersectsTriangle,
  wrapRadianAngle,
  getPlanetAngleMultiplier,
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