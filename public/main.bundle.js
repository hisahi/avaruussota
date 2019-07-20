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

const PSON = __webpack_require__(/*! pson */ "./node_modules/pson/dist/PSON.js");

const Cookies = __webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/src/js.cookie.js");

const serial = __webpack_require__(/*! ../src/utils/serial */ "./src/utils/serial.js")(PSON);

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
const PLANET_SPIN_SPEED = 0.02;
const BASE_SELF = {
  dead: true,
  posX: 0,
  posY: 0,
  velX: 0,
  velY: 0,
  orient: 0,
  speedMul: 1
};
const ZOOM_LEVELS = [1.0, 1.5, 2.0, 2.5];
const SQRT_H = Math.sqrt(0.5);
const MINE_X = [0, SQRT_H, 1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H];
const MINE_Y = [1, SQRT_H, 0, -SQRT_H, -1, -SQRT_H, 0, SQRT_H];
const fogCanvas = document.createElement('canvas');
const fogCtx = fogCanvas.getContext('2d');
let lcg = new LCG(0);
let inGame = false;
let ws = null;
let token = null;
let self = BASE_SELF;
let connectTimer = null;
let dead = false;
let firing = false;
let accel = false;
let accelStart = 0;
let brake = false;
let turn_left = false;
let turn_right = false;
let turn_left_ramp = 0;
let turn_right_ramp = 0;
let cx = 0;
let cy = 0;
let unitSize = 1;
let ships = [];
let bullets = [];
let lines = [];
let planets = [];
let smokes = [];
let bubbles = [];
let powerups = [];
let tpf = 1;
let planetAngle = 0;
let count = 1;
let leaderboard = [];
let rubber = 150;
let no_data = 0;
let pinger = null;
let seed = 0;
let dialogOpacity = 0;
let damageAlpha = 0;
let damageGot = 0;
let zoom = 1;
let cursorX = -10;
let cursorY = -10;
let lastSmoke = {};
let last_partial = null;
let send_turn = false;
let mouse_locked = false;
document.getElementById('scoreanimation').style.animation = 'none';
document.getElementById('scoreanimation').style.visibility = 'hidden';
document.getElementById('powerupanimation').style.animation = 'none';
document.getElementById('powerupanimation').style.visibility = 'hidden';

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

if (isMobile()) {
  zoom = 1.5;
}

const updateZoomText = () => {
  document.getElementById('btnzoom').textContent = `zoom: ${zoom * 100 | 0}%`;
};

const nextZoom = f => {
  let indx = (ZOOM_LEVELS.indexOf(zoom) + f) % ZOOM_LEVELS.length;

  if (indx < 0) {
    indx += ZOOM_LEVELS.length;
  }

  zoom = ZOOM_LEVELS[indx];
  Cookies.set('avaruuspeli-zoom', indx);
  updateZoomText();
};

const checkSize = () => {
  ctx.canvas.width = window.innerWidth * window.devicePixelRatio;
  ctx.canvas.height = window.innerHeight * window.devicePixelRatio;
  cx = ctx.canvas.width / 2;
  cy = ctx.canvas.height / 2;
  unitSize = Math.min(ctx.canvas.width, ctx.canvas.height) / physics.VIEW_DISTANCE * (zoom / 2);
  drawFog();

  if (dead) {
    document.getElementById('mobilecontrols').style.display = 'none';
  } else {
    document.getElementById('mobilecontrols').style.display = isMobile() ? 'block' : 'none';
  }
};

window.addEventListener('resize', () => checkSize());
checkSize();
updateZoomText();

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
  leaveGame();
};

const formatTime = sec => {
  sec = Math.floor(sec);
  return `${0 | sec / 60}:${('0' + sec % 60).slice(-2)}`;
};

const updatePowerup = () => {
  let resText = '';

  if (!dead) {
    if (self.item !== null) {
      if (isMobile()) {
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

const joinGame = () => {
  if (!inGame) {
    document.getElementById('scoreanimation').style.animation = 'none';
    document.getElementById('scoreanimation').style.visibility = 'hidden';
    document.getElementById('powerupanimation').style.animation = 'none';
    document.getElementById('powerupanimation').style.visibility = 'hidden';
    document.getElementById('onlinestatus').textContent = 'connecting';
    connectTimer = setTimeout(() => disconnect(), 5000);
    document.getElementById('btnplay').blur();
    hideDialog();
    lines = [];
    smokes = [];
    bubbles = [];
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
        document.getElementById('onlinestatus').textContent = 'in game';
        token = obj.token;
      } else if (serial.is_pong(obj)) {
        const now = performance.now();
        document.getElementById('onlinestatus').textContent = `in game, ping: ${Math.max(now - obj.time, 0).toFixed(1)}ms`;
      } else if (serial.is_data(obj)) {
        no_data = 0;
        let you = null;
        let projs = null;
        let oldHealth = {};

        for (const ship of ships) {
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

        for (const ship of ships) {
          if (oldHealth.hasOwnProperty(ship._id) && oldHealth[ship._id] > ship.health) {
            bubbles.push({
              x: ship.posX,
              y: ship.posY,
              alpha: 100,
              radius: 0.3 * (1 + oldHealth[ship._id] - ship.health)
            });
          }
        }

        if (self.dead) {
          self = you;
          self.dead = false;
          self.highAgility = document.getElementById('perkselect').value.trim() == 'movespeed';
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

          if (!accel && you.accel !== null) {
            send_turn = true;
          } else if (accel && you.accel === null) {
            send_turn = true;
          } else if (!brake && you.brake !== null) {
            send_turn = true;
          } else if (brake && you.brake === null) {
            send_turn = true;
          }

          document.getElementById('yourscore').textContent = document.getElementById('scoreanimation').textContent = document.getElementById('finalscorenum').textContent = you.score;

          if (you.score > self.score) {
            document.getElementById('scoreanimation').style.visilbility = 'visible';
            document.getElementById('scoreanimation').style.animation = 'none';
            document.getElementById('scoreanimation').style.animation = '';
          }

          self.name = you.name;
          self.score = you.score;
          self.dead = you.dead;

          if (you.health < self.health) {
            damageAlpha = 0.8 * (self.health - you.health);
            damageGot = performance.now() + (self.health - you.health) * 700;
            bubbles.push({
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
          planets = physics.getPlanets(self.posX, self.posY);
        }

        if (projs.length) {
          bullets = [...bullets, ...projs.filter(x => x)];
        }

        updatePowerup();
        physics.setPlanetSeed(seed);
        document.getElementById('playerCountNum').textContent = count;
        document.getElementById('healthbarhealth').style.width = `${Math.ceil(self.health * 200)}px`;
      } else if (serial.is_board(obj)) {
        leaderboard = obj.board;
        drawLeaderboard();
      } else if (serial.is_orient(obj)) {
        self.orient = obj.orient;
      } else if (serial.is_unauth(obj)) {
        disconnect();
      } else if (serial.is_killed(obj)) {
        explosion(self);
        hideLose();
        leaveGame();
        document.getElementById('defeat').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = obj.ship;
      } else if (serial.is_crashed(obj)) {
        explosion(self);
        hideLose();
        leaveGame();
        document.getElementById('defeatcrash').style.display = 'inline';
        document.getElementById('defeatname').style.display = 'inline';
        document.getElementById('defeatname').innerHTML = obj.ship;
      } else if (serial.is_hitpl(obj)) {
        explosion(self);
        hideLose();
        leaveGame();
        document.getElementById('defeatplanet').style.display = 'inline';
      } else if (serial.is_killship(obj)) {
        const matching = ships.find(ship => ship._id === obj.ship);

        if (matching !== null) {
          explosion(matching);
        }

        ships = ships.filter(ship => ship._id !== obj.ship);
      } else if (serial.is_killproj(obj)) {
        bullets = bullets.filter(bullet => bullet._id !== obj.proj);
      } else if (serial.is_minexpl(obj)) {
        bubbles.push({
          x: obj.mine.posX,
          y: obj.mine.posY,
          alpha: 200,
          radius: 1
        });
      } else if (serial.is_addpup(obj)) {
        powerups.push(obj.powerup); // document.getElementById('powerupanimation').style.visibility = 'visible'

        document.getElementById('powerupanimation').style.animation = 'none';
        document.getElementById('powerupanimation').style.animation = '';
      } else if (serial.is_delpup(obj)) {
        powerups = powerups.filter(powerup => powerup._id !== obj.powerup._id);
      }
    });
    ws.addEventListener('open', () => {
      dead = false;

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
      document.getElementById('onlinestatus').textContent = 'waiting for spawn';
      serial.send(ws, serial.e_join(nick, perk));
      checkSize();
      resetJoystickCenter();
      pinger = setInterval(() => {
        if (++no_data > 8 || ws == null) {
          disconnect();
          return;
        }

        serial.send(ws, serial.e_ping(performance.now()));
      }, 500);
    });
    ws.addEventListener('close', () => {
      if (!dead) {
        disconnect();
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

  if (mouse_locked) {
    document.exitPointerLock();
  }

  token = null;
  dead = self.dead = true;
  ws = null;
  inGame = accel = brake = turn_left = turn_right = firing = false;
  damageGot = damageAlpha = 0;
  powerups = [];
  document.getElementById('onlinestatus').textContent = 'offline';
  showDialog();
  checkSize();
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

  if (!token) {
    return;
  }

  if (send_turn) {
    serial.send(ws, serial.e_ctrl(token, self.orient, accel, brake, firing));
    send_turn = false;
  }

  if (accel) {
    physics.accel(self, chron.timeMs() - accelStart);
  }

  if (brake) {
    physics.brake(self);
  }

  if (firing && self.fireWaitTicks <= 0 && !self.latched) {
    physics.recoil(self);
  }

  physics.inertia(self);

  if (!self.latched) {
    physics.rubberband(self, rubber);
    planets = physics.getPlanets(self.posX, self.posY);
    physics.gravityShip(self, planets);
  }

  for (const ship of ships) {
    if (!ship.latched) {
      physics.gravityShip(ship, physics.getPlanets(ship.posX, ship.posY));
    }
  }

  for (const bullet of bullets) {
    if (bullet.type !== 'mine') {
      physics.gravityBullet(bullet, physics.getPlanets(bullet.posX, bullet.posY));
    }
  }

  const time = performance.now();

  if (self.health < 0.3) {
    document.getElementById('yourscore').style.color = time % 1000 >= 500 ? '#f88' : '#fff';
    document.getElementById('healthbarhealth').style.background = (time + 100) % 800 >= 400 ? '#800' : '#c00';
  } else if (self.health < 0.7) {
    const t = (self.health - 0.3) / 0.4 * 204;
    document.getElementById('yourscore').style.color = '#fff';
    document.getElementById('healthbarhealth').style.background = `rgba(204,${t},${t})`;
  } else {
    document.getElementById('yourscore').style.color = '#fff';
    document.getElementById('healthbarhealth').style.background = '#ccc';
  }
};

setInterval(serverTick, physics.MS_PER_TICK);

const partialTick = delta => {
  tpf = 1.0 * delta / physics.MS_PER_TICK;

  if (!self.latched) {
    // turning
    if (turn_left && !turn_right) {
      self.orient -= turn_left_ramp * TURN_UNIT * tpf;
      turn_left_ramp = Math.min(1, turn_left_ramp + tpf * 0.1);

      if (self.highAgility) {
        accelStart = chron.timeMs() / 16 + accelStart * 15 / 16;
      } else {
        accelStart = chron.timeMs();
      }

      send_turn = true;
    } else if (turn_right && !turn_left) {
      self.orient += turn_right_ramp * TURN_UNIT * tpf;
      turn_right_ramp = Math.min(1, turn_right_ramp + tpf * 0.1);

      if (self.highAgility) {
        accelStart = chron.timeMs() / 16 + accelStart * 15 / 16;
      } else {
        accelStart = chron.timeMs();
      }

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
    if (bullet.type == 'bullet' || bullet.type == 'laser') {
      bullet.posX += tpf * bullet.velX;
      bullet.posY += tpf * bullet.velY;
      bullet.dist += tpf * bullet.velocity;
    } else if (bullet.type == 'mine') {
      bullet.dist += tpf / (physics.TICKS_PER_SECOND * physics.MINE_LIFETIME);
    }
  }

  bullets = bullets.filter(b => b.dist <= physics.MAX_BULLET_DISTANCE);
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
    if (willAccel) {
      self.accel = accelStart = chron.timeMs();
    } else {
      self.accel = null;
    }

    send_turn = true;
  }
};

const resetJoystickCenter = () => {
  jstick.style.top = jbase.offsetTop + jbase.offsetHeight / 2 - jstick.offsetHeight / 2 + 'px';
  jstick.style.left = jbase.offsetLeft + jbase.offsetWidth / 2 - jstick.offsetWidth / 2 + 'px';
  applyPosition();
};

const useItem = () => {
  if (self.item !== null) {
    serial.send(ws, serial.e_useitem(token));
    self.item = null;
  }
};

const tryLockMouse = e => {
  if (isMobile()) {
    return;
  }

  cursorX = e.clientX;
  cursorY = e.clientY;
  canvas.requestPointerLock();
};

const handleMouseDown = e => {
  if (!mouse_locked && !document.hidden && !dead) {
    tryLockMouse(e);
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
    send_turn = true;
  } else if (!leftButton && firing) {
    firing = false;
    send_turn = true;
  }

  if (rightButton) {
    useItem();
  }

  if (mouse_locked) {
    cursorX += e.movementX;
    cursorY += e.movementY;
    const mcx = document.body.clientWidth / 2;
    const mcy = document.body.clientHeight / 2;
    const radius = Math.hypot(cursorX - mcx, mcy - cursorY);

    if (!self.latched && radius > 2) {
      self.orient = Math.atan2(cursorX - mcx, mcy - cursorY);
      send_turn = true;
    }
  }
};

document.addEventListener('pointerlockchange', () => {
  mouse_locked = document.pointerLockElement === canvas;
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
document.getElementById('btnconsume').addEventListener('pointerdown', () => {
  useItem();
});
document.getElementById('btnconsume').addEventListener('pointerover', e => {
  if (e.pressure > 0) {
    useItem();
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
  } else if (e.code == 'KeyQ') {
    useItem();
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
  } else if (e.code == 'KeyZ') {
    nextZoom(e.shiftKey ? -1 : 1);
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
  serial.send(ws, serial.e_quit(token));
}, true);

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
    ctx.moveTo(x, y);
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

const createLine = (x1, y1, x2, y2, xv, yv) => {
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

const explosion = ship => {
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
  lines.push(createLine(x1, y1, x5, y5, ship.velX, ship.velY));
  lines.push(createLine(x5, y5, x2, y2, ship.velX, ship.velY));
  lines.push(createLine(x2, y2, x3, y3, ship.velX, ship.velY));
  lines.push(createLine(x3, y3, x4, y4, ship.velX, ship.velY));
  lines.push(createLine(x4, y4, x6, y6, ship.velX, ship.velY));
  lines.push(createLine(x6, y6, x1, y1, ship.velX, ship.velY));
};

const frame = time => {
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

      if (!lastSmoke.hasOwnProperty(self._id) || time - lastSmoke[self._id] > interval) {
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

    for (const ship of ships) {
      drawShip(ship);

      if (ship.health < 0.75) {
        const interval = 320 ** (ship.health * 0.35 + 0.9) / 2 / (1 + Math.hypot(ship.velX, ship.velY) / 6);

        if (!lastSmoke.hasOwnProperty(ship._id) || time - lastSmoke[ship._id] > interval) {
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

    for (const bullet of bullets) {
      drawBullet(bullet);
    }

    ctx.stroke();
  }

  ctx.beginPath(); // draw planets

  for (const planet of planets) {
    drawPlanet(planet);
  }

  ctx.stroke();

  if (powerups.length) {
    const ctr = 0 | time % 300 / 15;
    const alp = time / 1000 % 1.0;
    const powerupColor = `rgba(${224 + ctr},255,${192 + ctr * 2},${Math.max(alp, 1 - alp)})`; // draw powerups

    for (const powerup of powerups) {
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

  if (mouse_locked) {
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
  window.requestAnimationFrame(frame);
};

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
    zoom = ZOOM_LEVELS[(cookieZoom + 1) % ZOOM_LEVELS.length];
    nextZoom(-1);
  }
};

document.getElementById('btnplay').addEventListener('click', e => {
  tryLockMouse(e);
  joinGame();
});
document.getElementById('btnfs').addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
});
document.getElementById('btnzoom').addEventListener('click', () => nextZoom(1));
window.requestAnimationFrame(frame);
leaveGame();
tryReadCookies();
showDialog();
hideLose();

/***/ }),

/***/ "./node_modules/ByteBuffer/dist/ByteBufferAB.js":
/*!******************************************************!*\
  !*** ./node_modules/ByteBuffer/dist/ByteBufferAB.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Copyright 2013-2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license ByteBuffer.js (c) 2013-2014 Daniel Wirtz <dcode@dcode.io>
 * This version of ByteBuffer.js uses an ArrayBuffer as its backing buffer which is accessed through a DataView and is
 * compatible with modern browsers.
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/ByteBuffer.js for details
 */
//
(function (global) {
  "use strict";
  /**
   * @param {function(new: Long, number, number, boolean=)=} Long
   * @returns {function(new: ByteBuffer, number=, boolean=, boolean=)}}
   * @inner
   */

  function loadByteBuffer(Long) {
    /**
     * Constructs a new ByteBuffer.
     * @class The swiss army knife for binary data in JavaScript.
     * @exports ByteBuffer
     * @constructor
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @expose
     */
    var ByteBuffer = function (capacity, littleEndian, noAssert) {
      if (typeof capacity === 'undefined') capacity = ByteBuffer.DEFAULT_CAPACITY;
      if (typeof littleEndian === 'undefined') littleEndian = ByteBuffer.DEFAULT_ENDIAN;
      if (typeof noAssert === 'undefined') noAssert = ByteBuffer.DEFAULT_NOASSERT;

      if (!noAssert) {
        capacity = capacity | 0;
        if (capacity < 0) throw RangeError("Illegal capacity");
        littleEndian = !!littleEndian;
        noAssert = !!noAssert;
      }
      /**
       * Backing buffer.
       * @type {!ArrayBuffer}
       * @expose
       */


      this.buffer = capacity === 0 ? EMPTY_BUFFER : new ArrayBuffer(capacity);
      /**
       * Data view to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
       * @type {?DataView}
       * @expose
       */

      this.view = capacity === 0 ? null : new DataView(this.buffer);
      /**
       * Absolute read/write offset.
       * @type {number}
       * @expose
       * @see ByteBuffer#flip
       * @see ByteBuffer#clear
       */

      this.offset = 0;
      /**
       * Marked offset.
       * @type {number}
       * @expose
       * @see ByteBuffer#mark
       * @see ByteBuffer#reset
       */

      this.markedOffset = -1;
      /**
       * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
       * @type {number}
       * @expose
       * @see ByteBuffer#flip
       * @see ByteBuffer#clear
       */

      this.limit = capacity;
      /**
       * Whether to use little endian byte order, defaults to `false` for big endian.
       * @type {boolean}
       * @expose
       */

      this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : false;
      /**
       * Whether to skip assertions of offsets and values, defaults to `false`.
       * @type {boolean}
       * @expose
       */

      this.noAssert = !!noAssert;
    };
    /**
     * ByteBuffer version.
     * @type {string}
     * @const
     * @expose
     */


    ByteBuffer.VERSION = "3.5.5";
    /**
     * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
     * @type {boolean}
     * @const
     * @expose
     */

    ByteBuffer.LITTLE_ENDIAN = true;
    /**
     * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
     * @type {boolean}
     * @const
     * @expose
     */

    ByteBuffer.BIG_ENDIAN = false;
    /**
     * Default initial capacity of `16`.
     * @type {number}
     * @expose
     */

    ByteBuffer.DEFAULT_CAPACITY = 16;
    /**
     * Default endianess of `false` for big endian.
     * @type {boolean}
     * @expose
     */

    ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;
    /**
     * Default no assertions flag of `false`.
     * @type {boolean}
     * @expose
     */

    ByteBuffer.DEFAULT_NOASSERT = false;
    /**
     * A `Long` class for representing a 64-bit two's-complement integer value. May be `null` if Long.js has not been loaded
     *  and int64 support is not available.
     * @type {?Long}
     * @const
     * @see https://github.com/dcodeIO/Long.js
     * @expose
     */

    ByteBuffer.Long = Long || null;
    /**
     * @alias ByteBuffer.prototype
     * @inner
     */

    var ByteBufferPrototype = ByteBuffer.prototype; // helpers

    /**
     * @type {!ArrayBuffer}
     * @inner
     */

    var EMPTY_BUFFER = new ArrayBuffer(0);
    /**
     * String.fromCharCode reference for compile-time renaming.
     * @type {function(...number):string}
     * @inner
     */

    var stringFromCharCode = String.fromCharCode;
    /**
     * Creates a source function for a string.
     * @param {string} s String to read from
     * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
     *  no more characters left.
     * @throws {TypeError} If the argument is invalid
     * @inner
     */

    function stringSource(s) {
      var i = 0;
      return function () {
        return i < s.length ? s.charCodeAt(i++) : null;
      };
    }
    /**
     * Creates a destination function for a string.
     * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
     *  Returns the final string when called without arguments.
     * @inner
     */


    function stringDestination() {
      var cs = [],
          ps = [];
      return function () {
        if (arguments.length === 0) return ps.join('') + stringFromCharCode.apply(String, cs);
        if (cs.length + arguments.length > 1024) ps.push(stringFromCharCode.apply(String, cs)), cs.length = 0;
        Array.prototype.push.apply(cs, arguments);
      };
    }
    /**
     * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer}
     * @expose
     */


    ByteBuffer.allocate = function (capacity, littleEndian, noAssert) {
      return new ByteBuffer(capacity, littleEndian, noAssert);
    };
    /**
     * Concatenates multiple ByteBuffers into one.
     * @param {!Array.<!ByteBuffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
     * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
     *  defaults to "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
     *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} Concatenated ByteBuffer
     * @expose
     */


    ByteBuffer.concat = function (buffers, encoding, littleEndian, noAssert) {
      if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
      }

      var capacity = 0;

      for (var i = 0, k = buffers.length, length; i < k; ++i) {
        if (!ByteBuffer.isByteBuffer(buffers[i])) buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
        length = buffers[i].limit - buffers[i].offset;
        if (length > 0) capacity += length;
      }

      if (capacity === 0) return new ByteBuffer(0, littleEndian, noAssert);
      var bb = new ByteBuffer(capacity, littleEndian, noAssert),
          bi;
      var view = new Uint8Array(bb.buffer);
      i = 0;

      while (i < k) {
        bi = buffers[i++];
        length = bi.limit - bi.offset;
        if (length <= 0) continue;
        view.set(new Uint8Array(bi.buffer).subarray(bi.offset, bi.limit), bb.offset);
        bb.offset += length;
      }

      bb.limit = bb.offset;
      bb.offset = 0;
      return bb;
    };
    /**
     * Tests if the specified type is a ByteBuffer.
     * @param {*} bb ByteBuffer to test
     * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
     * @expose
     */


    ByteBuffer.isByteBuffer = function (bb) {
      return (bb && bb instanceof ByteBuffer) === true;
    };
    /**
     * Gets the backing buffer type.
     * @returns {Function} `Buffer` for NB builds, `ArrayBuffer` for AB builds (classes)
     * @expose
     */


    ByteBuffer.type = function () {
      return ArrayBuffer;
    };
    /**
     * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
     *  {@link ByteBuffer#limit} to the length of the wrapped data.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
     * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
     *  "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
     * @expose
     */


    ByteBuffer.wrap = function (buffer, encoding, littleEndian, noAssert) {
      if (typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
      }

      if (typeof buffer === 'string') {
        if (typeof encoding === 'undefined') encoding = "utf8";

        switch (encoding) {
          case "base64":
            return ByteBuffer.fromBase64(buffer, littleEndian);

          case "hex":
            return ByteBuffer.fromHex(buffer, littleEndian);

          case "binary":
            return ByteBuffer.fromBinary(buffer, littleEndian);

          case "utf8":
            return ByteBuffer.fromUTF8(buffer, littleEndian);

          case "debug":
            return ByteBuffer.fromDebug(buffer, littleEndian);

          default:
            throw Error("Unsupported encoding: " + encoding);
        }
      }

      if (buffer === null || typeof buffer !== 'object') throw TypeError("Illegal buffer");
      var bb;

      if (ByteBuffer.isByteBuffer(buffer)) {
        bb = ByteBufferPrototype.clone.call(buffer);
        bb.markedOffset = -1;
        return bb;
      }

      if (buffer instanceof Uint8Array) {
        // Extract ArrayBuffer from Uint8Array
        bb = new ByteBuffer(0, littleEndian, noAssert);

        if (buffer.length > 0) {
          // Avoid references to more than one EMPTY_BUFFER
          bb.buffer = buffer.buffer;
          bb.offset = buffer.byteOffset;
          bb.limit = buffer.byteOffset + buffer.length;
          bb.view = buffer.length > 0 ? new DataView(buffer.buffer) : null;
        }
      } else if (buffer instanceof ArrayBuffer) {
        // Reuse ArrayBuffer
        bb = new ByteBuffer(0, littleEndian, noAssert);

        if (buffer.byteLength > 0) {
          bb.buffer = buffer;
          bb.offset = 0;
          bb.limit = buffer.byteLength;
          bb.view = buffer.byteLength > 0 ? new DataView(buffer) : null;
        }
      } else if (Object.prototype.toString.call(buffer) === "[object Array]") {
        // Create from octets
        bb = new ByteBuffer(buffer.length, littleEndian, noAssert);
        bb.limit = buffer.length;

        for (i = 0; i < buffer.length; ++i) bb.view.setUint8(i, buffer[i]);
      } else throw TypeError("Illegal buffer"); // Otherwise fail


      return bb;
    }; // types/ints/int8

    /**
     * Writes an 8bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeInt8 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 1;
      var capacity0 = this.buffer.byteLength;
      if (offset > capacity0) this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
      offset -= 1;
      this.view.setInt8(offset, value);
      if (relative) this.offset += 1;
      return this;
    };
    /**
     * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;
    /**
     * Reads an 8bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */

    ByteBufferPrototype.readInt8 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt8(offset);
      if (relative) this.offset += 1;
      return value;
    };
    /**
     * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;
    /**
     * Writes an 8bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */

    ByteBufferPrototype.writeUint8 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 1;
      var capacity1 = this.buffer.byteLength;
      if (offset > capacity1) this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
      offset -= 1;
      this.view.setUint8(offset, value);
      if (relative) this.offset += 1;
      return this;
    };
    /**
     * Reads an 8bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readUint8 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint8(offset);
      if (relative) this.offset += 1;
      return value;
    }; // types/ints/int16

    /**
     * Writes a 16bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.writeInt16 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 2;
      var capacity2 = this.buffer.byteLength;
      if (offset > capacity2) this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
      offset -= 2;
      this.view.setInt16(offset, value, this.littleEndian);
      if (relative) this.offset += 2;
      return this;
    };
    /**
     * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;
    /**
     * Reads a 16bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */

    ByteBufferPrototype.readInt16 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt16(offset, this.littleEndian);
      if (relative) this.offset += 2;
      return value;
    };
    /**
     * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;
    /**
     * Writes a 16bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */

    ByteBufferPrototype.writeUint16 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 2;
      var capacity3 = this.buffer.byteLength;
      if (offset > capacity3) this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
      offset -= 2;
      this.view.setUint16(offset, value, this.littleEndian);
      if (relative) this.offset += 2;
      return this;
    };
    /**
     * Reads a 16bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.readUint16 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint16(offset, this.littleEndian);
      if (relative) this.offset += 2;
      return value;
    }; // types/ints/int32

    /**
     * Writes a 32bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */


    ByteBufferPrototype.writeInt32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity4 = this.buffer.byteLength;
      if (offset > capacity4) this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
      offset -= 4;
      this.view.setInt32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */


    ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;
    /**
     * Reads a 32bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */

    ByteBufferPrototype.readInt32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    };
    /**
     * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;
    /**
     * Writes a 32bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */

    ByteBufferPrototype.writeUint32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity5 = this.buffer.byteLength;
      if (offset > capacity5) this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
      offset -= 4;
      this.view.setUint32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Reads a 32bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readUint32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    }; // types/ints/int64


    if (Long) {
      /**
       * Writes a 64bit signed integer.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */
      ByteBufferPrototype.writeInt64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
        offset += 8;
        var capacity6 = this.buffer.byteLength;
        if (offset > capacity6) this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
        offset -= 8;

        if (this.littleEndian) {
          this.view.setInt32(offset, value.low, true);
          this.view.setInt32(offset + 4, value.high, true);
        } else {
          this.view.setInt32(offset, value.high, false);
          this.view.setInt32(offset + 4, value.low, false);
        }

        if (relative) this.offset += 8;
        return this;
      };
      /**
       * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */


      ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;
      /**
       * Reads a 64bit signed integer.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */

      ByteBufferPrototype.readInt64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }

        var value = this.littleEndian ? new Long(this.view.getInt32(offset, true), this.view.getInt32(offset + 4, true), false) : new Long(this.view.getInt32(offset + 4, false), this.view.getInt32(offset, false), false);
        if (relative) this.offset += 8;
        return value;
      };
      /**
       * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */


      ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;
      /**
       * Writes a 64bit unsigned integer.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */

      ByteBufferPrototype.writeUint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
        offset += 8;
        var capacity7 = this.buffer.byteLength;
        if (offset > capacity7) this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
        offset -= 8;

        if (this.littleEndian) {
          this.view.setInt32(offset, value.low, true);
          this.view.setInt32(offset + 4, value.high, true);
        } else {
          this.view.setInt32(offset, value.high, false);
          this.view.setInt32(offset + 4, value.low, false);
        }

        if (relative) this.offset += 8;
        return this;
      };
      /**
       * Reads a 64bit unsigned integer.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */


      ByteBufferPrototype.readUint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }

        var value = this.littleEndian ? new Long(this.view.getInt32(offset, true), this.view.getInt32(offset + 4, true), true) : new Long(this.view.getInt32(offset + 4, false), this.view.getInt32(offset, false), true);
        if (relative) this.offset += 8;
        return value;
      };
    } // Long
    // types/floats/float32

    /**
     * Writes a 32bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeFloat32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity8 = this.buffer.byteLength;
      if (offset > capacity8) this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
      offset -= 4;
      this.view.setFloat32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;
    /**
     * Reads a 32bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */

    ByteBufferPrototype.readFloat32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getFloat32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    };
    /**
     * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */


    ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32; // types/floats/float64

    /**
     * Writes a 64bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */

    ByteBufferPrototype.writeFloat64 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 8;
      var capacity9 = this.buffer.byteLength;
      if (offset > capacity9) this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
      offset -= 8;
      this.view.setFloat64(offset, value, this.littleEndian);
      if (relative) this.offset += 8;
      return this;
    };
    /**
     * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;
    /**
     * Reads a 64bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */

    ByteBufferPrototype.readFloat64 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getFloat64(offset, this.littleEndian);
      if (relative) this.offset += 8;
      return value;
    };
    /**
     * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */


    ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64; // types/varints/varint32

    /**
     * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */

    ByteBuffer.MAX_VARINT32_BYTES = 5;
    /**
     * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
     * @param {number} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
     * @expose
     */

    ByteBuffer.calculateVarint32 = function (value) {
      // ref: src/google/protobuf/io/coded_stream.cc
      value = value >>> 0;
      if (value < 1 << 7) return 1;else if (value < 1 << 14) return 2;else if (value < 1 << 21) return 3;else if (value < 1 << 28) return 4;else return 5;
    };
    /**
     * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
     * @param {number} n Signed 32bit integer
     * @returns {number} Unsigned zigzag encoded 32bit integer
     * @expose
     */


    ByteBuffer.zigZagEncode32 = function (n) {
      return ((n |= 0) << 1 ^ n >> 31) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
    };
    /**
     * Decodes a zigzag encoded signed 32bit integer.
     * @param {number} n Unsigned zigzag encoded 32bit integer
     * @returns {number} Signed 32bit integer
     * @expose
     */


    ByteBuffer.zigZagDecode32 = function (n) {
      return n >>> 1 ^ -(n & 1) | 0; // // ref: src/google/protobuf/wire_format_lite.h
    };
    /**
     * Writes a 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeVarint32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var size = ByteBuffer.calculateVarint32(value),
          b;
      offset += size;
      var capacity10 = this.buffer.byteLength;
      if (offset > capacity10) this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
      offset -= size; // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc

      this.view.setUint8(offset, b = value | 0x80);
      value >>>= 0;

      if (value >= 1 << 7) {
        b = value >> 7 | 0x80;
        this.view.setUint8(offset + 1, b);

        if (value >= 1 << 14) {
          b = value >> 14 | 0x80;
          this.view.setUint8(offset + 2, b);

          if (value >= 1 << 21) {
            b = value >> 21 | 0x80;
            this.view.setUint8(offset + 3, b);

            if (value >= 1 << 28) {
              this.view.setUint8(offset + 4, value >> 28 & 0x0F);
              size = 5;
            } else {
              this.view.setUint8(offset + 3, b & 0x7F);
              size = 4;
            }
          } else {
            this.view.setUint8(offset + 2, b & 0x7F);
            size = 3;
          }
        } else {
          this.view.setUint8(offset + 1, b & 0x7F);
          size = 2;
        }
      } else {
        this.view.setUint8(offset, b & 0x7F);
        size = 1;
      }

      if (relative) {
        this.offset += size;
        return this;
      }

      return size;
    };
    /**
     * Writes a zig-zag encoded 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeVarint32ZigZag = function (value, offset) {
      return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
    };
    /**
     * Reads a 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
     *  to fully decode the varint.
     * @expose
     */


    ByteBufferPrototype.readVarint32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      } // ref: src/google/protobuf/io/coded_stream.cc


      var size = 0,
          value = 0 >>> 0,
          temp,
          ioffset;

      do {
        ioffset = offset + size;

        if (!this.noAssert && ioffset > this.limit) {
          var err = Error("Truncated");
          err['truncated'] = true;
          throw err;
        }

        temp = this.view.getUint8(ioffset);
        if (size < 5) value |= (temp & 0x7F) << 7 * size >>> 0;
        ++size;
      } while ((temp & 0x80) === 0x80);

      value = value | 0; // Make sure to discard the higher order bits

      if (relative) {
        this.offset += size;
        return value;
      }

      return {
        "value": value,
        "length": size
      };
    };
    /**
     * Reads a zig-zag encoded 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */


    ByteBufferPrototype.readVarint32ZigZag = function (offset) {
      var val = this.readVarint32(offset);
      if (typeof val === 'object') val["value"] = ByteBuffer.zigZagDecode32(val["value"]);else val = ByteBuffer.zigZagDecode32(val);
      return val;
    }; // types/varints/varint64


    if (Long) {
      /**
       * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
       * @type {number}
       * @const
       * @expose
       */
      ByteBuffer.MAX_VARINT64_BYTES = 10;
      /**
       * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
       * @param {number|!Long} value Value to encode
       * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
       * @expose
       */

      ByteBuffer.calculateVarint64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value); // ref: src/google/protobuf/io/coded_stream.cc

        var part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;

        if (part2 == 0) {
          if (part1 == 0) {
            if (part0 < 1 << 14) return part0 < 1 << 7 ? 1 : 2;else return part0 < 1 << 21 ? 3 : 4;
          } else {
            if (part1 < 1 << 14) return part1 < 1 << 7 ? 5 : 6;else return part1 < 1 << 21 ? 7 : 8;
          }
        } else return part2 < 1 << 7 ? 9 : 10;
      };
      /**
       * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
       * @param {number|!Long} value Signed long
       * @returns {!Long} Unsigned zigzag encoded long
       * @expose
       */


      ByteBuffer.zigZagEncode64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned(); // ref: src/google/protobuf/wire_format_lite.h

        return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
      };
      /**
       * Decodes a zigzag encoded signed 64bit integer.
       * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
       * @returns {!Long} Signed long
       * @expose
       */


      ByteBuffer.zigZagDecode64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned(); // ref: src/google/protobuf/wire_format_lite.h

        return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
      };
      /**
       * Writes a 64bit base 128 variable-length integer.
       * @param {number|Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  written if omitted.
       * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
       * @expose
       */


      ByteBufferPrototype.writeVarint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned();
        var size = ByteBuffer.calculateVarint64(value),
            part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        offset += size;
        var capacity11 = this.buffer.byteLength;
        if (offset > capacity11) this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
        offset -= size;

        switch (size) {
          case 10:
            this.view.setUint8(offset + 9, part2 >>> 7 & 0x01);

          case 9:
            this.view.setUint8(offset + 8, size !== 9 ? part2 | 0x80 : part2 & 0x7F);

          case 8:
            this.view.setUint8(offset + 7, size !== 8 ? part1 >>> 21 | 0x80 : part1 >>> 21 & 0x7F);

          case 7:
            this.view.setUint8(offset + 6, size !== 7 ? part1 >>> 14 | 0x80 : part1 >>> 14 & 0x7F);

          case 6:
            this.view.setUint8(offset + 5, size !== 6 ? part1 >>> 7 | 0x80 : part1 >>> 7 & 0x7F);

          case 5:
            this.view.setUint8(offset + 4, size !== 5 ? part1 | 0x80 : part1 & 0x7F);

          case 4:
            this.view.setUint8(offset + 3, size !== 4 ? part0 >>> 21 | 0x80 : part0 >>> 21 & 0x7F);

          case 3:
            this.view.setUint8(offset + 2, size !== 3 ? part0 >>> 14 | 0x80 : part0 >>> 14 & 0x7F);

          case 2:
            this.view.setUint8(offset + 1, size !== 2 ? part0 >>> 7 | 0x80 : part0 >>> 7 & 0x7F);

          case 1:
            this.view.setUint8(offset, size !== 1 ? part0 | 0x80 : part0 & 0x7F);
        }

        if (relative) {
          this.offset += size;
          return this;
        } else {
          return size;
        }
      };
      /**
       * Writes a zig-zag encoded 64bit base 128 variable-length integer.
       * @param {number|Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  written if omitted.
       * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
       * @expose
       */


      ByteBufferPrototype.writeVarint64ZigZag = function (value, offset) {
        return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
      };
      /**
       * Reads a 64bit base 128 variable-length integer. Requires Long.js.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  read if omitted.
       * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
       *  the actual number of bytes read.
       * @throws {Error} If it's not a valid varint
       * @expose
       */


      ByteBufferPrototype.readVarint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
        } // ref: src/google/protobuf/io/coded_stream.cc


        var start = offset,
            part0 = 0,
            part1 = 0,
            part2 = 0,
            b = 0;
        b = this.view.getUint8(offset++);
        part0 = b & 0x7F;

        if (b & 0x80) {
          b = this.view.getUint8(offset++);
          part0 |= (b & 0x7F) << 7;

          if (b & 0x80) {
            b = this.view.getUint8(offset++);
            part0 |= (b & 0x7F) << 14;

            if (b & 0x80) {
              b = this.view.getUint8(offset++);
              part0 |= (b & 0x7F) << 21;

              if (b & 0x80) {
                b = this.view.getUint8(offset++);
                part1 = b & 0x7F;

                if (b & 0x80) {
                  b = this.view.getUint8(offset++);
                  part1 |= (b & 0x7F) << 7;

                  if (b & 0x80) {
                    b = this.view.getUint8(offset++);
                    part1 |= (b & 0x7F) << 14;

                    if (b & 0x80) {
                      b = this.view.getUint8(offset++);
                      part1 |= (b & 0x7F) << 21;

                      if (b & 0x80) {
                        b = this.view.getUint8(offset++);
                        part2 = b & 0x7F;

                        if (b & 0x80) {
                          b = this.view.getUint8(offset++);
                          part2 |= (b & 0x7F) << 7;

                          if (b & 0x80) {
                            throw Error("Buffer overrun");
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        var value = Long.fromBits(part0 | part1 << 28, part1 >>> 4 | part2 << 24, false);

        if (relative) {
          this.offset = offset;
          return value;
        } else {
          return {
            'value': value,
            'length': offset - start
          };
        }
      };
      /**
       * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  read if omitted.
       * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
       *  the actual number of bytes read.
       * @throws {Error} If it's not a valid varint
       * @expose
       */


      ByteBufferPrototype.readVarint64ZigZag = function (offset) {
        var val = this.readVarint64(offset);
        if (val && val['value'] instanceof Long) val["value"] = ByteBuffer.zigZagDecode64(val["value"]);else val = ByteBuffer.zigZagDecode64(val);
        return val;
      };
    } // Long
    // types/strings/cstring

    /**
     * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
     *  characters itself.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  contained in `str` + 1 if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeCString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      var i,
          k = str.length;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");

        for (i = 0; i < k; ++i) {
          if (str.charCodeAt(i) === 0) throw RangeError("Illegal str: Contains NULL-characters");
        }

        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      } // UTF8 strings do not contain zero bytes in between except for the zero character, so:


      k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
      offset += k + 1;
      var capacity12 = this.buffer.byteLength;
      if (offset > capacity12) this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
      offset -= k + 1;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      this.view.setUint8(offset++, 0);

      if (relative) {
        this.offset = offset;
        return this;
      }

      return k;
    };
    /**
     * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
     *  itself.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readCString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          temp; // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:

      var sd,
          b = -1;
      utfx.decodeUTF8toUTF16(function () {
        if (b === 0) return null;
        if (offset >= this.limit) throw RangeError("Illegal range: Truncated data, " + offset + " < " + this.limit);
        return (b = this.view.getUint8(offset++)) === 0 ? null : b;
      }.bind(this), sd = stringDestination(), true);

      if (relative) {
        this.offset = offset;
        return sd();
      } else {
        return {
          "string": sd(),
          "length": offset - start
        };
      }
    }; // types/strings/istring

    /**
     * Writes a length as uint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */


    ByteBufferPrototype.writeIString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          k;
      k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
      offset += 4 + k;
      var capacity13 = this.buffer.byteLength;
      if (offset > capacity13) this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
      offset -= 4 + k;
      this.view.setUint32(offset, k, this.littleEndian);
      offset += 4;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      if (offset !== start + 4 + k) throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + 4 + k));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Reads a length as uint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */


    ByteBufferPrototype.readIString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var temp = 0,
          start = offset,
          str;
      temp = this.view.getUint32(offset, this.littleEndian);
      offset += 4;
      var k = offset + temp,
          sd;
      utfx.decodeUTF8toUTF16(function () {
        return offset < k ? this.view.getUint8(offset++) : null;
      }.bind(this), sd = stringDestination(), this.noAssert);
      str = sd();

      if (relative) {
        this.offset = offset;
        return str;
      } else {
        return {
          'string': str,
          'length': offset - start
        };
      }
    }; // types/strings/utf8string

    /**
     * Metrics representing number of UTF8 characters. Evaluates to `c`.
     * @type {string}
     * @const
     * @expose
     */


    ByteBuffer.METRICS_CHARS = 'c';
    /**
     * Metrics representing number of bytes. Evaluates to `b`.
     * @type {string}
     * @const
     * @expose
     */

    ByteBuffer.METRICS_BYTES = 'b';
    /**
     * Writes an UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */

    ByteBufferPrototype.writeUTF8String = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var k;
      var start = offset;
      k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
      offset += k;
      var capacity14 = this.buffer.byteLength;
      if (offset > capacity14) this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
      offset -= k;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
     * @function
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */


    ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;
    /**
     * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
     *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 characters
     * @expose
     */

    ByteBuffer.calculateUTF8Chars = function (str) {
      return utfx.calculateUTF16asUTF8(stringSource(str))[0];
    };
    /**
     * Calculates the number of UTF8 bytes of a string.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */


    ByteBuffer.calculateUTF8Bytes = function (str) {
      return utfx.calculateUTF16asUTF8(stringSource(str))[1];
    };
    /**
     * Reads an UTF8 encoded string.
     * @param {number} length Number of characters or bytes to read.
     * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readUTF8String = function (length, metrics, offset) {
      if (typeof metrics === 'number') {
        offset = metrics;
        metrics = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;

      if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var i = 0,
          start = offset,
          sd;

      if (metrics === ByteBuffer.METRICS_CHARS) {
        // The same for node and the browser
        sd = stringDestination();
        utfx.decodeUTF8(function () {
          return i < length && offset < this.limit ? this.view.getUint8(offset++) : null;
        }.bind(this), function (cp) {
          ++i;
          utfx.UTF8toUTF16(cp, sd);
        }.bind(this));
        if (i !== length) throw RangeError("Illegal range: Truncated data, " + i + " == " + length);

        if (relative) {
          this.offset = offset;
          return sd();
        } else {
          return {
            "string": sd(),
            "length": offset - start
          };
        }
      } else if (metrics === ByteBuffer.METRICS_BYTES) {
        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + length > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.byteLength);
        }

        var k = offset + length;
        utfx.decodeUTF8toUTF16(function () {
          return offset < k ? this.view.getUint8(offset++) : null;
        }.bind(this), sd = stringDestination(), this.noAssert);
        if (offset !== k) throw RangeError("Illegal range: Truncated data, " + offset + " == " + k);

        if (relative) {
          this.offset = offset;
          return sd();
        } else {
          return {
            'string': sd(),
            'length': offset - start
          };
        }
      } else throw TypeError("Unsupported metrics: " + metrics);
    };
    /**
     * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
     * @function
     * @param {number} length Number of characters or bytes to read
     * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String; // types/strings/vstring

    /**
     * Writes a length as varint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */

    ByteBufferPrototype.writeVString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          k,
          l;
      k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
      l = ByteBuffer.calculateVarint32(k);
      offset += l + k;
      var capacity15 = this.buffer.byteLength;
      if (offset > capacity15) this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
      offset -= l + k;
      offset += this.writeVarint32(k, offset);
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      if (offset !== start + k + l) throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + k + l));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Reads a length as varint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */


    ByteBufferPrototype.readVString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var temp = this.readVarint32(offset),
          start = offset,
          str;
      offset += temp['length'];
      temp = temp['value'];
      var k = offset + temp,
          sd = stringDestination();
      utfx.decodeUTF8toUTF16(function () {
        return offset < k ? this.view.getUint8(offset++) : null;
      }.bind(this), sd, this.noAssert);
      str = sd();

      if (relative) {
        this.offset = offset;
        return str;
      } else {
        return {
          'string': str,
          'length': offset - start
        };
      }
    };
    /**
     * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
     *  data's length.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its offsets
     *  will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
     * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
     */


    ByteBufferPrototype.append = function (source, encoding, offset) {
      if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
      var length = source.limit - source.offset;
      if (length <= 0) return this; // Nothing to append

      offset += length;
      var capacity16 = this.buffer.byteLength;
      if (offset > capacity16) this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
      offset -= length;
      new Uint8Array(this.buffer, offset).set(new Uint8Array(source.buffer).subarray(source.offset, source.limit));
      source.offset += length;
      if (relative) this.offset += length;
      return this;
    };
    /**
     * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
        specified offset up to the length of this ByteBuffer's data.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#append
     */


    ByteBufferPrototype.appendTo = function (target, offset) {
      target.append(this, offset);
      return this;
    };
    /**
     * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
     *  disable them if your code already makes sure that everything is valid.
     * @param {boolean} assert `true` to enable assertions, otherwise `false`
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.assert = function (assert) {
      this.noAssert = !assert;
      return this;
    };
    /**
     * Gets the capacity of this ByteBuffer's backing buffer.
     * @returns {number} Capacity of the backing buffer
     * @expose
     */


    ByteBufferPrototype.capacity = function () {
      return this.buffer.byteLength;
    };
    /**
     * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
     *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.clear = function () {
      this.offset = 0;
      this.limit = this.buffer.byteLength;
      this.markedOffset = -1;
      return this;
    };
    /**
     * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
     *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
     * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
     * @returns {!ByteBuffer} Cloned instance
     * @expose
     */


    ByteBufferPrototype.clone = function (copy) {
      var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);

      if (copy) {
        var buffer = new ArrayBuffer(this.buffer.byteLength);
        new Uint8Array(buffer).set(this.buffer);
        bb.buffer = buffer;
        bb.view = new DataView(buffer);
      } else {
        bb.buffer = this.buffer;
        bb.view = this.view;
      }

      bb.offset = this.offset;
      bb.markedOffset = this.markedOffset;
      bb.limit = this.limit;
      return bb;
    };
    /**
     * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
     *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
     *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.compact = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === 0 && end === this.buffer.byteLength) return this; // Already compacted

      var len = end - begin;

      if (len === 0) {
        this.buffer = EMPTY_BUFFER;
        this.view = null;
        if (this.markedOffset >= 0) this.markedOffset -= begin;
        this.offset = 0;
        this.limit = 0;
        return this;
      }

      var buffer = new ArrayBuffer(len);
      new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(begin, end));
      this.buffer = buffer;
      this.view = new DataView(buffer);
      if (this.markedOffset >= 0) this.markedOffset -= begin;
      this.offset = 0;
      this.limit = len;
      return this;
    };
    /**
     * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Copy
     * @expose
     */


    ByteBufferPrototype.copy = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return new ByteBuffer(0, this.littleEndian, this.noAssert);
      var capacity = end - begin,
          bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
      bb.offset = 0;
      bb.limit = capacity;
      if (bb.markedOffset >= 0) bb.markedOffset -= begin;
      this.copyTo(bb, 0, begin, end);
      return bb;
    };
    /**
     * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
     *  by the number of bytes copied if omitted.
     * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
     *  number of bytes copied if omitted.
     * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.copyTo = function (target, targetOffset, sourceOffset, sourceLimit) {
      var relative, targetRelative;

      if (!this.noAssert) {
        if (!ByteBuffer.isByteBuffer(target)) throw TypeError("Illegal target: Not a ByteBuffer");
      }

      targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
      sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
      sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;
      if (targetOffset < 0 || targetOffset > target.buffer.byteLength) throw RangeError("Illegal target range: 0 <= " + targetOffset + " <= " + target.buffer.byteLength);
      if (sourceOffset < 0 || sourceLimit > this.buffer.byteLength) throw RangeError("Illegal source range: 0 <= " + sourceOffset + " <= " + this.buffer.byteLength);
      var len = sourceLimit - sourceOffset;
      if (len === 0) return target; // Nothing to copy

      target.ensureCapacity(targetOffset + len);
      new Uint8Array(target.buffer).set(new Uint8Array(this.buffer).subarray(sourceOffset, sourceLimit), targetOffset);
      if (relative) this.offset += len;
      if (targetRelative) target.offset += len;
      return this;
    };
    /**
     * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
     *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
     *  the required capacity will be used instead.
     * @param {number} capacity Required capacity
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.ensureCapacity = function (capacity) {
      var current = this.buffer.byteLength;
      if (current < capacity) return this.resize((current *= 2) > capacity ? current : capacity);
      return this;
    };
    /**
     * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
     * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted. defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} this
     * @expose
     * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
     */


    ByteBufferPrototype.fill = function (value, begin, end) {
      var relative = typeof begin === 'undefined';
      if (relative) begin = this.offset;
      if (typeof value === 'string' && value.length > 0) value = value.charCodeAt(0);
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin >= end) return this; // Nothing to fill

      while (begin < end) this.view.setUint8(begin++, value);

      if (relative) this.offset = begin;
      return this;
    };
    /**
     * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
     *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.flip = function () {
      this.limit = this.offset;
      this.offset = 0;
      return this;
    };
    /**
     * Marks an offset on this ByteBuffer to be used later.
     * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @see ByteBuffer#reset
     * @expose
     */


    ByteBufferPrototype.mark = function (offset) {
      offset = typeof offset === 'undefined' ? this.offset : offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      this.markedOffset = offset;
      return this;
    };
    /**
     * Sets the byte order.
     * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.order = function (littleEndian) {
      if (!this.noAssert) {
        if (typeof littleEndian !== 'boolean') throw TypeError("Illegal littleEndian: Not a boolean");
      }

      this.littleEndian = !!littleEndian;
      return this;
    };
    /**
     * Switches (to) little endian byte order.
     * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.LE = function (littleEndian) {
      this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
      return this;
    };
    /**
     * Switches (to) big endian byte order.
     * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.BE = function (bigEndian) {
      this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
      return this;
    };
    /**
     * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer|string|!ArrayBuffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be
     *  modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
     * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
     */


    ByteBufferPrototype.prepend = function (source, encoding, offset) {
      if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
      var len = source.limit - source.offset;
      if (len <= 0) return this; // Nothing to prepend

      var diff = len - offset;
      var arrayView;

      if (diff > 0) {
        // Not enough space before offset, so resize + move
        var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
        arrayView = new Uint8Array(buffer);
        arrayView.set(new Uint8Array(this.buffer).subarray(offset, this.buffer.byteLength), len);
        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.offset += diff;
        if (this.markedOffset >= 0) this.markedOffset += diff;
        this.limit += diff;
        offset += diff;
      } else {
        arrayView = new Uint8Array(this.buffer);
      }

      arrayView.set(new Uint8Array(source.buffer).subarray(source.offset, source.limit), offset - len);
      source.offset = source.limit;
      if (relative) this.offset -= len;
      return this;
    };
    /**
     * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#prepend
     */


    ByteBufferPrototype.prependTo = function (target, offset) {
      target.prepend(this, offset);
      return this;
    };
    /**
     * Prints debug information about this ByteBuffer's contents.
     * @param {function(string)=} out Output function to call, defaults to console.log
     * @expose
     */


    ByteBufferPrototype.printDebug = function (out) {
      if (typeof out !== 'function') out = console.log.bind(console);
      out(this.toString() + "\n" + "-------------------------------------------------------------------\n" + this.toDebug(
      /* columns */
      true));
    };
    /**
     * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
     * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
     * @expose
     */


    ByteBufferPrototype.remaining = function () {
      return this.limit - this.offset;
    };
    /**
     * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
     *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
     *  marked, sets `offset = 0`.
     * @returns {!ByteBuffer} this
     * @see ByteBuffer#mark
     * @expose
     */


    ByteBufferPrototype.reset = function () {
      if (this.markedOffset >= 0) {
        this.offset = this.markedOffset;
        this.markedOffset = -1;
      } else {
        this.offset = 0;
      }

      return this;
    };
    /**
     * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
     *  large or larger.
     * @param {number} capacity Capacity required
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `capacity` is not a number
     * @throws {RangeError} If `capacity < 0`
     * @expose
     */


    ByteBufferPrototype.resize = function (capacity) {
      if (!this.noAssert) {
        if (typeof capacity !== 'number' || capacity % 1 !== 0) throw TypeError("Illegal capacity: " + capacity + " (not an integer)");
        capacity |= 0;
        if (capacity < 0) throw RangeError("Illegal capacity: 0 <= " + capacity);
      }

      if (this.buffer.byteLength < capacity) {
        var buffer = new ArrayBuffer(capacity);
        new Uint8Array(buffer).set(new Uint8Array(this.buffer));
        this.buffer = buffer;
        this.view = new DataView(buffer);
      }

      return this;
    };
    /**
     * Reverses this ByteBuffer's contents.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.reverse = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return this; // Nothing to reverse

      Array.prototype.reverse.call(new Uint8Array(this.buffer).subarray(begin, end));
      this.view = new DataView(this.buffer); // FIXME: Why exactly is this necessary?

      return this;
    };
    /**
     * Skips the next `length` bytes. This will just advance
     * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.skip = function (length) {
      if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
      }

      var offset = this.offset + length;

      if (!this.noAssert) {
        if (offset < 0 || offset > this.buffer.byteLength) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + length + " <= " + this.buffer.byteLength);
      }

      this.offset = offset;
      return this;
    };
    /**
     * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
     * @expose
     */


    ByteBufferPrototype.slice = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var bb = this.clone();
      bb.offset = begin;
      bb.limit = end;
      return bb;
    };
    /**
     * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will transparently {@link ByteBuffer#flip} this
     *  ByteBuffer if `offset > limit` but the actual offsets remain untouched.
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
     *  possible. Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */


    ByteBufferPrototype.toBuffer = function (forceCopy) {
      var offset = this.offset,
          limit = this.limit;

      if (offset > limit) {
        var t = offset;
        offset = limit;
        limit = t;
      }

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: Not an integer");
        offset >>>= 0;
        if (typeof limit !== 'number' || limit % 1 !== 0) throw TypeError("Illegal limit: Not an integer");
        limit >>>= 0;
        if (offset < 0 || offset > limit || limit > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.byteLength);
      } // NOTE: It's not possible to have another ArrayBuffer reference the same memory as the backing buffer. This is
      // possible with Uint8Array#subarray only, but we have to return an ArrayBuffer by contract. So:


      if (!forceCopy && offset === 0 && limit === this.buffer.byteLength) {
        return this.buffer;
      }

      if (offset === limit) {
        return EMPTY_BUFFER;
      }

      var buffer = new ArrayBuffer(limit - offset);
      new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(offset, limit), 0);
      return buffer;
    };
    /**
     * Returns a raw buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will transparently {@link ByteBuffer#flip} this
     *  ByteBuffer if `offset > limit` but the actual offsets remain untouched. This is an alias of
     *  {@link ByteBuffer#toBuffer}.
     * @function
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory.
     *  Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */


    ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;
    /**
     * Converts the ByteBuffer's contents to a string.
     * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
     *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
     *  highlighted offsets.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {string} String representation
     * @throws {Error} If `encoding` is invalid
     * @expose
     */

    ByteBufferPrototype.toString = function (encoding, begin, end) {
      if (typeof encoding === 'undefined') return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
      if (typeof encoding === 'number') encoding = "utf8", begin = encoding, end = begin;

      switch (encoding) {
        case "utf8":
          return this.toUTF8(begin, end);

        case "base64":
          return this.toBase64(begin, end);

        case "hex":
          return this.toHex(begin, end);

        case "binary":
          return this.toBinary(begin, end);

        case "debug":
          return this.toDebug();

        case "columns":
          return this.toColumns();

        default:
          throw Error("Unsupported encoding: " + encoding);
      }
    }; // lxiv-embeddable

    /**
     * lxiv-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/lxiv for details
     */


    var lxiv = function () {
      "use strict";
      /**
       * lxiv namespace.
       * @type {!Object.<string,*>}
       * @exports lxiv
       */

      var lxiv = {};
      /**
       * Character codes for output.
       * @type {!Array.<number>}
       * @inner
       */

      var aout = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];
      /**
       * Character codes for input.
       * @type {!Array.<number>}
       * @inner
       */

      var ain = [];

      for (var i = 0, k = aout.length; i < k; ++i) ain[aout[i]] = i;
      /**
       * Encodes bytes to base64 char codes.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if
       *  there are no more bytes left.
       * @param {!function(number)} dst Characters destination as a function successively called with each encoded char
       *  code.
       */


      lxiv.encode = function (src, dst) {
        var b, t;

        while ((b = src()) !== null) {
          dst(aout[b >> 2 & 0x3f]);
          t = (b & 0x3) << 4;

          if ((b = src()) !== null) {
            t |= b >> 4 & 0xf;
            dst(aout[(t | b >> 4 & 0xf) & 0x3f]);
            t = (b & 0xf) << 2;
            if ((b = src()) !== null) dst(aout[(t | b >> 6 & 0x3) & 0x3f]), dst(aout[b & 0x3f]);else dst(aout[t & 0x3f]), dst(61);
          } else dst(aout[t & 0x3f]), dst(61), dst(61);
        }
      };
      /**
       * Decodes base64 char codes to bytes.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
       * @throws {Error} If a character code is invalid
       */


      lxiv.decode = function (src, dst) {
        var c, t1, t2;

        function fail(c) {
          throw Error("Illegal character code: " + c);
        }

        while ((c = src()) !== null) {
          t1 = ain[c];
          if (typeof t1 === 'undefined') fail(c);

          if ((c = src()) !== null) {
            t2 = ain[c];
            if (typeof t2 === 'undefined') fail(c);
            dst(t1 << 2 >>> 0 | (t2 & 0x30) >> 4);

            if ((c = src()) !== null) {
              t1 = ain[c];
              if (typeof t1 === 'undefined') if (c === 61) break;else fail(c);
              dst((t2 & 0xf) << 4 >>> 0 | (t1 & 0x3c) >> 2);

              if ((c = src()) !== null) {
                t2 = ain[c];
                if (typeof t2 === 'undefined') if (c === 61) break;else fail(c);
                dst((t1 & 0x3) << 6 >>> 0 | t2);
              }
            }
          }
        }
      };
      /**
       * Tests if a string is valid base64.
       * @param {string} str String to test
       * @returns {boolean} `true` if valid, otherwise `false`
       */


      lxiv.test = function (str) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
      };

      return lxiv;
    }(); // encodings/base64

    /**
     * Encodes this ByteBuffer's contents to a base64 encoded string.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
     * @returns {string} Base64 encoded string
     * @expose
     */


    ByteBufferPrototype.toBase64 = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var sd;
      lxiv.encode(function () {
        return begin < end ? this.view.getUint8(begin++) : null;
      }.bind(this), sd = stringDestination());
      return sd();
    };
    /**
     * Decodes a base64 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromBase64 = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (str.length % 4 !== 0) throw TypeError("Illegal str: Length not a multiple of 4");
      }

      var bb = new ByteBuffer(str.length / 4 * 3, littleEndian, noAssert),
          i = 0;
      lxiv.decode(stringSource(str), function (b) {
        bb.view.setUint8(i++, b);
      });
      bb.limit = i;
      return bb;
    };
    /**
     * Encodes a binary string to base64 like `window.btoa` does.
     * @param {string} str Binary string
     * @returns {string} Base64 encoded string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
     * @expose
     */


    ByteBuffer.btoa = function (str) {
      return ByteBuffer.fromBinary(str).toBase64();
    };
    /**
     * Decodes a base64 encoded string to binary like `window.atob` does.
     * @param {string} b64 Base64 encoded string
     * @returns {string} Binary string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
     * @expose
     */


    ByteBuffer.atob = function (b64) {
      return ByteBuffer.fromBase64(b64).toBinary();
    }; // encodings/binary

    /**
     * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Binary encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */


    ByteBufferPrototype.toBinary = function (begin, end) {
      begin = typeof begin === 'undefined' ? this.offset : begin;
      end = typeof end === 'undefined' ? this.limit : end;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return "";
      var cc = [],
          pt = [];

      while (begin < end) {
        cc.push(this.view.getUint8(begin++));
        if (cc.length >= 1024) pt.push(String.fromCharCode.apply(String, cc)), cc = [];
      }

      return pt.join('') + String.fromCharCode.apply(String, cc);
    };
    /**
     * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromBinary = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      }

      var i = 0,
          k = str.length,
          charCode,
          bb = new ByteBuffer(k, littleEndian, noAssert);

      while (i < k) {
        charCode = str.charCodeAt(i);
        if (!noAssert && charCode > 255) throw RangeError("Illegal charCode at " + i + ": 0 <= " + charCode + " <= 255");
        bb.view.setUint8(i++, charCode);
      }

      bb.limit = k;
      return bb;
    }; // encodings/debug

    /**
     * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
     * * `<` : offset,
     * * `'` : markedOffset,
     * * `>` : limit,
     * * `|` : offset and limit,
     * * `[` : offset and markedOffset,
     * * `]` : markedOffset and limit,
     * * `!` : offset, markedOffset and limit
     * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
     * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
     * @expose
     * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
     * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
     * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
     * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
     */


    ByteBufferPrototype.toDebug = function (columns) {
      var i = -1,
          k = this.buffer.byteLength,
          b,
          hex = "",
          asc = "",
          out = "";

      while (i < k) {
        if (i !== -1) {
          b = this.view.getUint8(i);
          if (b < 0x10) hex += "0" + b.toString(16).toUpperCase();else hex += b.toString(16).toUpperCase();

          if (columns) {
            asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
          }
        }

        ++i;

        if (columns) {
          if (i > 0 && i % 16 === 0 && i !== k) {
            while (hex.length < 3 * 16 + 3) hex += " ";

            out += hex + asc + "\n";
            hex = asc = "";
          }
        }

        if (i === this.offset && i === this.limit) hex += i === this.markedOffset ? "!" : "|";else if (i === this.offset) hex += i === this.markedOffset ? "[" : "<";else if (i === this.limit) hex += i === this.markedOffset ? "]" : ">";else hex += i === this.markedOffset ? "'" : columns || i !== 0 && i !== k ? " " : "";
      }

      if (columns && hex !== " ") {
        while (hex.length < 3 * 16 + 3) hex += " ";

        out += hex + asc + "\n";
      }

      return columns ? out : hex;
    };
    /**
     * Decodes a hex encoded string with marked offsets to a ByteBuffer.
     * @param {string} str Debug string to decode (not be generated with `columns = true`)
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     * @see ByteBuffer#toDebug
     */


    ByteBuffer.fromDebug = function (str, littleEndian, noAssert) {
      var k = str.length,
          bb = new ByteBuffer((k + 1) / 3 | 0, littleEndian, noAssert);
      var i = 0,
          j = 0,
          ch,
          b,
          rs = false,
          // Require symbol next
      ho = false,
          hm = false,
          hl = false,
          // Already has offset, markedOffset, limit?
      fail = false;

      while (i < k) {
        switch (ch = str.charAt(i++)) {
          case '!':
            if (!noAssert) {
              if (ho || hm || hl) {
                fail = true;
                break;
              }

              ho = hm = hl = true;
            }

            bb.offset = bb.markedOffset = bb.limit = j;
            rs = false;
            break;

          case '|':
            if (!noAssert) {
              if (ho || hl) {
                fail = true;
                break;
              }

              ho = hl = true;
            }

            bb.offset = bb.limit = j;
            rs = false;
            break;

          case '[':
            if (!noAssert) {
              if (ho || hm) {
                fail = true;
                break;
              }

              ho = hm = true;
            }

            bb.offset = bb.markedOffset = j;
            rs = false;
            break;

          case '<':
            if (!noAssert) {
              if (ho) {
                fail = true;
                break;
              }

              ho = true;
            }

            bb.offset = j;
            rs = false;
            break;

          case ']':
            if (!noAssert) {
              if (hl || hm) {
                fail = true;
                break;
              }

              hl = hm = true;
            }

            bb.limit = bb.markedOffset = j;
            rs = false;
            break;

          case '>':
            if (!noAssert) {
              if (hl) {
                fail = true;
                break;
              }

              hl = true;
            }

            bb.limit = j;
            rs = false;
            break;

          case "'":
            if (!noAssert) {
              if (hm) {
                fail = true;
                break;
              }

              hm = true;
            }

            bb.markedOffset = j;
            rs = false;
            break;

          case ' ':
            rs = false;
            break;

          default:
            if (!noAssert) {
              if (rs) {
                fail = true;
                break;
              }
            }

            b = parseInt(ch + str.charAt(i++), 16);

            if (!noAssert) {
              if (isNaN(b) || b < 0 || b > 255) throw TypeError("Illegal str: Not a debug encoded string");
            }

            bb.view.setUint8(j++, b);
            rs = true;
        }

        if (fail) throw TypeError("Illegal str: Invalid symbol at " + i);
      }

      if (!noAssert) {
        if (!ho || !hl) throw TypeError("Illegal str: Missing offset or limit");
        if (j < bb.buffer.byteLength) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + j + " < " + k);
      }

      return bb;
    }; // encodings/hex

    /**
     * Encodes this ByteBuffer's contents to a hex encoded string.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Hex encoded string
     * @expose
     */


    ByteBufferPrototype.toHex = function (begin, end) {
      begin = typeof begin === 'undefined' ? this.offset : begin;
      end = typeof end === 'undefined' ? this.limit : end;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var out = new Array(end - begin),
          b;

      while (begin < end) {
        b = this.view.getUint8(begin++);
        if (b < 0x10) out.push("0", b.toString(16));else out.push(b.toString(16));
      }

      return out.join('');
    };
    /**
     * Decodes a hex encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromHex = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (str.length % 2 !== 0) throw TypeError("Illegal str: Length not a multiple of 2");
      }

      var k = str.length,
          bb = new ByteBuffer(k / 2 | 0, littleEndian),
          b;

      for (var i = 0, j = 0; i < k; i += 2) {
        b = parseInt(str.substring(i, i + 2), 16);
        if (!noAssert) if (!isFinite(b) || b < 0 || b > 255) throw TypeError("Illegal str: Contains non-hex characters");
        bb.view.setUint8(j++, b);
      }

      bb.limit = j;
      return bb;
    }; // utfx-embeddable

    /**
     * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/utfx for details
     */


    var utfx = function () {
      "use strict";
      /**
       * utfx namespace.
       * @inner
       * @type {!Object.<string,*>}
       */

      var utfx = {};
      /**
       * Maximum valid code point.
       * @type {number}
       * @const
       */

      utfx.MAX_CODEPOINT = 0x10FFFF;
      /**
       * Encodes UTF8 code points to UTF8 bytes.
       * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
       *  respectively `null` if there are no more code points left or a single numeric code point.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
       */

      utfx.encodeUTF8 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number') cp = src, src = function () {
          return null;
        };

        while (cp !== null || (cp = src()) !== null) {
          if (cp < 0x80) dst(cp & 0x7F);else if (cp < 0x800) dst(cp >> 6 & 0x1F | 0xC0), dst(cp & 0x3F | 0x80);else if (cp < 0x10000) dst(cp >> 12 & 0x0F | 0xE0), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);else dst(cp >> 18 & 0x07 | 0xF0), dst(cp >> 12 & 0x3F | 0x80), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);
          cp = null;
        }
      };
      /**
       * Decodes UTF8 bytes to UTF8 code points.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
       *  are no more bytes left.
       * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
       * @throws {RangeError} If a starting byte is invalid in UTF8
       * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
       *  remaining bytes.
       */


      utfx.decodeUTF8 = function (src, dst) {
        var a,
            b,
            c,
            d,
            fail = function (b) {
          b = b.slice(0, b.indexOf(null));
          var err = Error(b.toString());
          err.name = "TruncatedError";
          err['bytes'] = b;
          throw err;
        };

        while ((a = src()) !== null) {
          if ((a & 0x80) === 0) dst(a);else if ((a & 0xE0) === 0xC0) (b = src()) === null && fail([a, b]), dst((a & 0x1F) << 6 | b & 0x3F);else if ((a & 0xF0) === 0xE0) ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 0x0F) << 12 | (b & 0x3F) << 6 | c & 0x3F);else if ((a & 0xF8) === 0xF0) ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 0x07) << 18 | (b & 0x3F) << 12 | (c & 0x3F) << 6 | d & 0x3F);else throw RangeError("Illegal starting byte: " + a);
        }
      };
      /**
       * Converts UTF16 characters to UTF8 code points.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @param {!function(number)} dst Code points destination as a function successively called with each converted code
       *  point.
       */


      utfx.UTF16toUTF8 = function (src, dst) {
        var c1,
            c2 = null;

        while (true) {
          if ((c1 = c2 !== null ? c2 : src()) === null) break;

          if (c1 >= 0xD800 && c1 <= 0xDFFF) {
            if ((c2 = src()) !== null) {
              if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                dst((c1 - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000);
                c2 = null;
                continue;
              }
            }
          }

          dst(c1);
        }

        if (c2 !== null) dst(c2);
      };
      /**
       * Converts UTF8 code points to UTF16 characters.
       * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
       *  respectively `null` if there are no more code points left or a single numeric code point.
       * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
       * @throws {RangeError} If a code point is out of range
       */


      utfx.UTF8toUTF16 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number') cp = src, src = function () {
          return null;
        };

        while (cp !== null || (cp = src()) !== null) {
          if (cp <= 0xFFFF) dst(cp);else cp -= 0x10000, dst((cp >> 10) + 0xD800), dst(cp % 0x400 + 0xDC00);
          cp = null;
        }
      };
      /**
       * Converts and encodes UTF16 characters to UTF8 bytes.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
       *  if there are no more characters left.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
       */


      utfx.encodeUTF16toUTF8 = function (src, dst) {
        utfx.UTF16toUTF8(src, function (cp) {
          utfx.encodeUTF8(cp, dst);
        });
      };
      /**
       * Decodes and converts UTF8 bytes to UTF16 characters.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
       *  are no more bytes left.
       * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
       * @throws {RangeError} If a starting byte is invalid in UTF8
       * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
       */


      utfx.decodeUTF8toUTF16 = function (src, dst) {
        utfx.decodeUTF8(src, function (cp) {
          utfx.UTF8toUTF16(cp, dst);
        });
      };
      /**
       * Calculates the byte length of an UTF8 code point.
       * @param {number} cp UTF8 code point
       * @returns {number} Byte length
       */


      utfx.calculateCodePoint = function (cp) {
        return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      };
      /**
       * Calculates the number of UTF8 bytes required to store UTF8 code points.
       * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
       *  `null` if there are no more code points left.
       * @returns {number} The number of UTF8 bytes required
       */


      utfx.calculateUTF8 = function (src) {
        var cp,
            l = 0;

        while ((cp = src()) !== null) l += utfx.calculateCodePoint(cp);

        return l;
      };
      /**
       * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
       * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
       */


      utfx.calculateUTF16asUTF8 = function (src) {
        var n = 0,
            l = 0;
        utfx.UTF16toUTF8(src, function (cp) {
          ++n;
          l += utfx.calculateCodePoint(cp);
        });
        return [n, l];
      };

      return utfx;
    }(); // encodings/utf8

    /**
     * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
     *  string.
     * @returns {string} Hex encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */


    ByteBufferPrototype.toUTF8 = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var sd;

      try {
        utfx.decodeUTF8toUTF16(function () {
          return begin < end ? this.view.getUint8(begin++) : null;
        }.bind(this), sd = stringDestination());
      } catch (e) {
        if (begin !== end) throw RangeError("Illegal range: Truncated data, " + begin + " != " + end);
      }

      return sd();
    };
    /**
     * Decodes an UTF8 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromUTF8 = function (str, littleEndian, noAssert) {
      if (!noAssert) if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      var bb = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(str), true)[1], littleEndian, noAssert),
          i = 0;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        bb.view.setUint8(i++, b);
      });
      bb.limit = i;
      return bb;
    };

    return ByteBuffer;
  }
  /* CommonJS */


  if ( true && module && typeof exports === 'object' && exports) module['exports'] = function () {
    var Long;

    try {
      Long = __webpack_require__(/*! long */ "./node_modules/long/dist/Long.js");
    } catch (e) {}

    return loadByteBuffer(Long);
  }();
  /* AMD */
  else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! Long */ "./node_modules/Long/dist/Long.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Long) {
      return loadByteBuffer(Long);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    /* Global */
    else {}
})(this);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/Long/dist/Long.js":
/*!****************************************!*\
  !*** ./node_modules/Long/dist/Long.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license Long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/Long.js for details
 */
(function (global, factory) {
  /* AMD */
  if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  /* CommonJS */
  else {}
})(this, function () {
  "use strict";
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @constructor
   */

  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     * @expose
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     * @expose
     */

    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     * @expose
     */

    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.

  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @expose
   * @private
   */


  Long.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true,
    enumerable: false,
    configurable: false
  });
  /**
   * Tests if the specified object is a Long.
   * @param {*} obj Object
   * @returns {boolean}
   * @expose
   */

  Long.isLong = function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  };
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */


  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */

  var UINT_CACHE = {};
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */

  Long.fromInt = function fromInt(value, unsigned) {
    var obj, cachedObj;

    if (!unsigned) {
      value = value | 0;

      if (-128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }

      obj = new Long(value, value < 0 ? -1 : 0, false);
      if (-128 <= value && value < 128) INT_CACHE[value] = obj;
      return obj;
    } else {
      value = value >>> 0;

      if (0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }

      obj = new Long(value, (value | 0) < 0 ? -1 : 0, true);
      if (0 <= value && value < 256) UINT_CACHE[value] = obj;
      return obj;
    }
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromNumber = function fromNumber(value, unsigned) {
    unsigned = !!unsigned;
    if (isNaN(value) || !isFinite(value)) return Long.ZERO;
    if (!unsigned && value <= -TWO_PWR_63_DBL) return Long.MIN_VALUE;
    if (!unsigned && value + 1 >= TWO_PWR_63_DBL) return Long.MAX_VALUE;
    if (unsigned && value >= TWO_PWR_64_DBL) return Long.MAX_UNSIGNED_VALUE;
    if (value < 0) return Long.fromNumber(-value, unsigned).negate();
    return new Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  };
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromBits = function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  };
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromString = function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('number format error: empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return Long.ZERO;
    if (typeof unsigned === 'number') // For goog.math.long compatibility
      radix = unsigned, unsigned = false;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw Error('radix out of range: ' + radix);
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('number format error: interior "-" character: ' + str);else if (p === 0) return Long.fromString(str.substring(1), unsigned, radix).negate(); // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.

    var radixToPower = Long.fromNumber(Math.pow(radix, 8));
    var result = Long.ZERO;

    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);

      if (size < 8) {
        var power = Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(Long.fromNumber(value));
      }
    }

    result.unsigned = unsigned;
    return result;
  };
  /**
   * Converts the specified value to a Long.
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @returns {!Long}
   * @expose
   */


  Long.fromValue = function fromValue(val) {
    if (val
    /* is compatible */
    instanceof Long) return val;
    if (typeof val === 'number') return Long.fromNumber(val);
    if (typeof val === 'string') return Long.fromString(val); // Throws for non-objects, converts non-instanceof Long:

    return new Long(val.low, val.high, val.unsigned);
  }; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.

  /**
   * @type {number}
   * @const
   * @inner
   */


  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */

  var TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
  /**
   * Signed zero.
   * @type {!Long}
   * @expose
   */

  Long.ZERO = Long.fromInt(0);
  /**
   * Unsigned zero.
   * @type {!Long}
   * @expose
   */

  Long.UZERO = Long.fromInt(0, true);
  /**
   * Signed one.
   * @type {!Long}
   * @expose
   */

  Long.ONE = Long.fromInt(1);
  /**
   * Unsigned one.
   * @type {!Long}
   * @expose
   */

  Long.UONE = Long.fromInt(1, true);
  /**
   * Signed negative one.
   * @type {!Long}
   * @expose
   */

  Long.NEG_ONE = Long.fromInt(-1);
  /**
   * Maximum signed value.
   * @type {!Long}
   * @expose
   */

  Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   * @expose
   */

  Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Minimum signed value.
   * @type {!Long}
   * @expose
   */

  Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @returns {number}
   * @expose
   */

  Long.prototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @returns {number}
   * @expose
   */


  Long.prototype.toNumber = function toNumber() {
    if (this.unsigned) {
      return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    }

    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   * @expose
   */


  Long.prototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix out of range: ' + radix);
    if (this.isZero()) return '0';
    var rem;

    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.equals(Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = Long.fromNumber(radix);
        var div = this.divide(radixLong);
        rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else return '-' + this.negate().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.


    var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
    rem = this;
    var result = '';

    while (true) {
      var remDiv = rem.divide(radixToPower),
          intval = rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;

        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @returns {number} Signed high bits
   * @expose
   */


  Long.prototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @returns {number} Unsigned high bits
   * @expose
   */


  Long.prototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @returns {number} Signed low bits
   * @expose
   */


  Long.prototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @returns {number} Unsigned low bits
   * @expose
   */


  Long.prototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @returns {number}
   * @expose
   */


  Long.prototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.equals(Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;

    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;

    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value is negative.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.equals = function equals(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.eq = Long.prototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.notEquals = function notEquals(other) {
    return !this.equals(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.neq = Long.prototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.lessThan = function lessThan(other) {
    return this.compare(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.lt = Long.prototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.compare(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.lte = Long.prototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.greaterThan = function greaterThan(other) {
    return this.compare(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.gt = Long.prototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.compare(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.gte = Long.prototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   * @expose
   */

  Long.prototype.compare = function compare(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    if (this.equals(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same

    if (!this.unsigned) return this.subtract(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned

    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Negates this Long's value.
   * @returns {!Long} Negated Long
   * @expose
   */


  Long.prototype.negate = function negate() {
    if (!this.unsigned && this.equals(Long.MIN_VALUE)) return Long.MIN_VALUE;
    return this.not().add(Long.ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   * @expose
   */


  Long.prototype.neg = Long.prototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   * @expose
   */

  Long.prototype.add = function add(addend) {
    if (!Long.isLong(addend)) addend = Long.fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   * @expose
   */


  Long.prototype.subtract = function subtract(subtrahend) {
    if (!Long.isLong(subtrahend)) subtrahend = Long.fromValue(subtrahend);
    return this.add(subtrahend.negate());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   * @expose
   */


  Long.prototype.sub = Long.prototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   * @expose
   */

  Long.prototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return Long.ZERO;
    if (!Long.isLong(multiplier)) multiplier = Long.fromValue(multiplier);
    if (multiplier.isZero()) return Long.ZERO;
    if (this.equals(Long.MIN_VALUE)) return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
    if (multiplier.equals(Long.MIN_VALUE)) return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;

    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.negate().multiply(multiplier.negate());else return this.negate().multiply(multiplier).negate();
    } else if (multiplier.isNegative()) return this.multiply(multiplier.negate()).negate(); // If both longs are small, use float multiplication


    if (this.lessThan(TWO_PWR_24) && multiplier.lessThan(TWO_PWR_24)) return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   * @expose
   */


  Long.prototype.mul = Long.prototype.multiply;
  /**
   * Returns this Long divided by the specified.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   * @expose
   */

  Long.prototype.divide = function divide(divisor) {
    if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
    if (divisor.isZero()) throw new Error('division by zero');
    if (this.isZero()) return this.unsigned ? Long.UZERO : Long.ZERO;
    var approx, rem, res;

    if (this.equals(Long.MIN_VALUE)) {
      if (divisor.equals(Long.ONE) || divisor.equals(Long.NEG_ONE)) return Long.MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
      else if (divisor.equals(Long.MIN_VALUE)) return Long.ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shiftRight(1);
          approx = halfThis.divide(divisor).shiftLeft(1);

          if (approx.equals(Long.ZERO)) {
            return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
          } else {
            rem = this.subtract(divisor.multiply(approx));
            res = approx.add(rem.divide(divisor));
            return res;
          }
        }
    } else if (divisor.equals(Long.MIN_VALUE)) return this.unsigned ? Long.UZERO : Long.ZERO;

    if (this.isNegative()) {
      if (divisor.isNegative()) return this.negate().divide(divisor.negate());
      return this.negate().divide(divisor).negate();
    } else if (divisor.isNegative()) return this.divide(divisor.negate()).negate(); // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.


    res = Long.ZERO;
    rem = this;

    while (rem.greaterThanOrEqual(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.

      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = Long.fromNumber(approx),
          approxRem = approxRes.multiply(divisor);

      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = Long.fromNumber(approx, this.unsigned);
        approxRem = approxRes.multiply(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.


      if (approxRes.isZero()) approxRes = Long.ONE;
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }

    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   * @expose
   */


  Long.prototype.div = Long.prototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   * @expose
   */

  Long.prototype.modulo = function modulo(divisor) {
    if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
    return this.subtract(this.divide(divisor).multiply(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   * @expose
   */


  Long.prototype.mod = Long.prototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @returns {!Long}
   * @expose
   */

  Long.prototype.not = function not() {
    return Long.fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.and = function and(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.or = function or(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.xor = function xor(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shiftLeft = function shiftLeft(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return Long.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return Long.fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shl = Long.prototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */

  Long.prototype.shiftRight = function shiftRight(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return Long.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return Long.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shr = Long.prototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */

  Long.prototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    numBits &= 63;
    if (numBits === 0) return this;else {
      var high = this.high;

      if (numBits < 32) {
        var low = this.low;
        return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
      } else if (numBits === 32) return Long.fromBits(high, 0, this.unsigned);else return Long.fromBits(high >>> numBits - 32, 0, this.unsigned);
    }
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shru = Long.prototype.shiftRightUnsigned;
  /**
   * Converts this Long to signed.
   * @returns {!Long} Signed long
   * @expose
   */

  Long.prototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return new Long(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @returns {!Long} Unsigned long
   * @expose
   */


  Long.prototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return new Long(this.low, this.high, true);
  };

  return Long;
});

/***/ }),

/***/ "./node_modules/bytebuffer/dist/ByteBufferAB.js":
/*!******************************************************!*\
  !*** ./node_modules/bytebuffer/dist/ByteBufferAB.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Copyright 2013-2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license ByteBuffer.js (c) 2013-2014 Daniel Wirtz <dcode@dcode.io>
 * This version of ByteBuffer.js uses an ArrayBuffer as its backing buffer which is accessed through a DataView and is
 * compatible with modern browsers.
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/ByteBuffer.js for details
 */
//
(function (global) {
  "use strict";
  /**
   * @param {function(new: Long, number, number, boolean=)=} Long
   * @returns {function(new: ByteBuffer, number=, boolean=, boolean=)}}
   * @inner
   */

  function loadByteBuffer(Long) {
    /**
     * Constructs a new ByteBuffer.
     * @class The swiss army knife for binary data in JavaScript.
     * @exports ByteBuffer
     * @constructor
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @expose
     */
    var ByteBuffer = function (capacity, littleEndian, noAssert) {
      if (typeof capacity === 'undefined') capacity = ByteBuffer.DEFAULT_CAPACITY;
      if (typeof littleEndian === 'undefined') littleEndian = ByteBuffer.DEFAULT_ENDIAN;
      if (typeof noAssert === 'undefined') noAssert = ByteBuffer.DEFAULT_NOASSERT;

      if (!noAssert) {
        capacity = capacity | 0;
        if (capacity < 0) throw RangeError("Illegal capacity");
        littleEndian = !!littleEndian;
        noAssert = !!noAssert;
      }
      /**
       * Backing buffer.
       * @type {!ArrayBuffer}
       * @expose
       */


      this.buffer = capacity === 0 ? EMPTY_BUFFER : new ArrayBuffer(capacity);
      /**
       * Data view to manipulate the backing buffer. Becomes `null` if the backing buffer has a capacity of `0`.
       * @type {?DataView}
       * @expose
       */

      this.view = capacity === 0 ? null : new DataView(this.buffer);
      /**
       * Absolute read/write offset.
       * @type {number}
       * @expose
       * @see ByteBuffer#flip
       * @see ByteBuffer#clear
       */

      this.offset = 0;
      /**
       * Marked offset.
       * @type {number}
       * @expose
       * @see ByteBuffer#mark
       * @see ByteBuffer#reset
       */

      this.markedOffset = -1;
      /**
       * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
       * @type {number}
       * @expose
       * @see ByteBuffer#flip
       * @see ByteBuffer#clear
       */

      this.limit = capacity;
      /**
       * Whether to use little endian byte order, defaults to `false` for big endian.
       * @type {boolean}
       * @expose
       */

      this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : false;
      /**
       * Whether to skip assertions of offsets and values, defaults to `false`.
       * @type {boolean}
       * @expose
       */

      this.noAssert = !!noAssert;
    };
    /**
     * ByteBuffer version.
     * @type {string}
     * @const
     * @expose
     */


    ByteBuffer.VERSION = "3.5.5";
    /**
     * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
     * @type {boolean}
     * @const
     * @expose
     */

    ByteBuffer.LITTLE_ENDIAN = true;
    /**
     * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
     * @type {boolean}
     * @const
     * @expose
     */

    ByteBuffer.BIG_ENDIAN = false;
    /**
     * Default initial capacity of `16`.
     * @type {number}
     * @expose
     */

    ByteBuffer.DEFAULT_CAPACITY = 16;
    /**
     * Default endianess of `false` for big endian.
     * @type {boolean}
     * @expose
     */

    ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;
    /**
     * Default no assertions flag of `false`.
     * @type {boolean}
     * @expose
     */

    ByteBuffer.DEFAULT_NOASSERT = false;
    /**
     * A `Long` class for representing a 64-bit two's-complement integer value. May be `null` if Long.js has not been loaded
     *  and int64 support is not available.
     * @type {?Long}
     * @const
     * @see https://github.com/dcodeIO/Long.js
     * @expose
     */

    ByteBuffer.Long = Long || null;
    /**
     * @alias ByteBuffer.prototype
     * @inner
     */

    var ByteBufferPrototype = ByteBuffer.prototype; // helpers

    /**
     * @type {!ArrayBuffer}
     * @inner
     */

    var EMPTY_BUFFER = new ArrayBuffer(0);
    /**
     * String.fromCharCode reference for compile-time renaming.
     * @type {function(...number):string}
     * @inner
     */

    var stringFromCharCode = String.fromCharCode;
    /**
     * Creates a source function for a string.
     * @param {string} s String to read from
     * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
     *  no more characters left.
     * @throws {TypeError} If the argument is invalid
     * @inner
     */

    function stringSource(s) {
      var i = 0;
      return function () {
        return i < s.length ? s.charCodeAt(i++) : null;
      };
    }
    /**
     * Creates a destination function for a string.
     * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
     *  Returns the final string when called without arguments.
     * @inner
     */


    function stringDestination() {
      var cs = [],
          ps = [];
      return function () {
        if (arguments.length === 0) return ps.join('') + stringFromCharCode.apply(String, cs);
        if (cs.length + arguments.length > 1024) ps.push(stringFromCharCode.apply(String, cs)), cs.length = 0;
        Array.prototype.push.apply(cs, arguments);
      };
    }
    /**
     * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer}
     * @expose
     */


    ByteBuffer.allocate = function (capacity, littleEndian, noAssert) {
      return new ByteBuffer(capacity, littleEndian, noAssert);
    };
    /**
     * Concatenates multiple ByteBuffers into one.
     * @param {!Array.<!ByteBuffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
     * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
     *  defaults to "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
     *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} Concatenated ByteBuffer
     * @expose
     */


    ByteBuffer.concat = function (buffers, encoding, littleEndian, noAssert) {
      if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
      }

      var capacity = 0;

      for (var i = 0, k = buffers.length, length; i < k; ++i) {
        if (!ByteBuffer.isByteBuffer(buffers[i])) buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
        length = buffers[i].limit - buffers[i].offset;
        if (length > 0) capacity += length;
      }

      if (capacity === 0) return new ByteBuffer(0, littleEndian, noAssert);
      var bb = new ByteBuffer(capacity, littleEndian, noAssert),
          bi;
      var view = new Uint8Array(bb.buffer);
      i = 0;

      while (i < k) {
        bi = buffers[i++];
        length = bi.limit - bi.offset;
        if (length <= 0) continue;
        view.set(new Uint8Array(bi.buffer).subarray(bi.offset, bi.limit), bb.offset);
        bb.offset += length;
      }

      bb.limit = bb.offset;
      bb.offset = 0;
      return bb;
    };
    /**
     * Tests if the specified type is a ByteBuffer.
     * @param {*} bb ByteBuffer to test
     * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
     * @expose
     */


    ByteBuffer.isByteBuffer = function (bb) {
      return (bb && bb instanceof ByteBuffer) === true;
    };
    /**
     * Gets the backing buffer type.
     * @returns {Function} `Buffer` for NB builds, `ArrayBuffer` for AB builds (classes)
     * @expose
     */


    ByteBuffer.type = function () {
      return ArrayBuffer;
    };
    /**
     * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
     *  {@link ByteBuffer#limit} to the length of the wrapped data.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
     * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
     *  "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
     * @expose
     */


    ByteBuffer.wrap = function (buffer, encoding, littleEndian, noAssert) {
      if (typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
      }

      if (typeof buffer === 'string') {
        if (typeof encoding === 'undefined') encoding = "utf8";

        switch (encoding) {
          case "base64":
            return ByteBuffer.fromBase64(buffer, littleEndian);

          case "hex":
            return ByteBuffer.fromHex(buffer, littleEndian);

          case "binary":
            return ByteBuffer.fromBinary(buffer, littleEndian);

          case "utf8":
            return ByteBuffer.fromUTF8(buffer, littleEndian);

          case "debug":
            return ByteBuffer.fromDebug(buffer, littleEndian);

          default:
            throw Error("Unsupported encoding: " + encoding);
        }
      }

      if (buffer === null || typeof buffer !== 'object') throw TypeError("Illegal buffer");
      var bb;

      if (ByteBuffer.isByteBuffer(buffer)) {
        bb = ByteBufferPrototype.clone.call(buffer);
        bb.markedOffset = -1;
        return bb;
      }

      if (buffer instanceof Uint8Array) {
        // Extract ArrayBuffer from Uint8Array
        bb = new ByteBuffer(0, littleEndian, noAssert);

        if (buffer.length > 0) {
          // Avoid references to more than one EMPTY_BUFFER
          bb.buffer = buffer.buffer;
          bb.offset = buffer.byteOffset;
          bb.limit = buffer.byteOffset + buffer.length;
          bb.view = buffer.length > 0 ? new DataView(buffer.buffer) : null;
        }
      } else if (buffer instanceof ArrayBuffer) {
        // Reuse ArrayBuffer
        bb = new ByteBuffer(0, littleEndian, noAssert);

        if (buffer.byteLength > 0) {
          bb.buffer = buffer;
          bb.offset = 0;
          bb.limit = buffer.byteLength;
          bb.view = buffer.byteLength > 0 ? new DataView(buffer) : null;
        }
      } else if (Object.prototype.toString.call(buffer) === "[object Array]") {
        // Create from octets
        bb = new ByteBuffer(buffer.length, littleEndian, noAssert);
        bb.limit = buffer.length;

        for (i = 0; i < buffer.length; ++i) bb.view.setUint8(i, buffer[i]);
      } else throw TypeError("Illegal buffer"); // Otherwise fail


      return bb;
    }; // types/ints/int8

    /**
     * Writes an 8bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeInt8 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 1;
      var capacity0 = this.buffer.byteLength;
      if (offset > capacity0) this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
      offset -= 1;
      this.view.setInt8(offset, value);
      if (relative) this.offset += 1;
      return this;
    };
    /**
     * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;
    /**
     * Reads an 8bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */

    ByteBufferPrototype.readInt8 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt8(offset);
      if (relative) this.offset += 1;
      return value;
    };
    /**
     * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;
    /**
     * Writes an 8bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */

    ByteBufferPrototype.writeUint8 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 1;
      var capacity1 = this.buffer.byteLength;
      if (offset > capacity1) this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
      offset -= 1;
      this.view.setUint8(offset, value);
      if (relative) this.offset += 1;
      return this;
    };
    /**
     * Reads an 8bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readUint8 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint8(offset);
      if (relative) this.offset += 1;
      return value;
    }; // types/ints/int16

    /**
     * Writes a 16bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.writeInt16 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 2;
      var capacity2 = this.buffer.byteLength;
      if (offset > capacity2) this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
      offset -= 2;
      this.view.setInt16(offset, value, this.littleEndian);
      if (relative) this.offset += 2;
      return this;
    };
    /**
     * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;
    /**
     * Reads a 16bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */

    ByteBufferPrototype.readInt16 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt16(offset, this.littleEndian);
      if (relative) this.offset += 2;
      return value;
    };
    /**
     * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;
    /**
     * Writes a 16bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */

    ByteBufferPrototype.writeUint16 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 2;
      var capacity3 = this.buffer.byteLength;
      if (offset > capacity3) this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
      offset -= 2;
      this.view.setUint16(offset, value, this.littleEndian);
      if (relative) this.offset += 2;
      return this;
    };
    /**
     * Reads a 16bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */


    ByteBufferPrototype.readUint16 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 2 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint16(offset, this.littleEndian);
      if (relative) this.offset += 2;
      return value;
    }; // types/ints/int32

    /**
     * Writes a 32bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */


    ByteBufferPrototype.writeInt32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity4 = this.buffer.byteLength;
      if (offset > capacity4) this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
      offset -= 4;
      this.view.setInt32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */


    ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;
    /**
     * Reads a 32bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */

    ByteBufferPrototype.readInt32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getInt32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    };
    /**
     * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;
    /**
     * Writes a 32bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */

    ByteBufferPrototype.writeUint32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value >>>= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity5 = this.buffer.byteLength;
      if (offset > capacity5) this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
      offset -= 4;
      this.view.setUint32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Reads a 32bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */


    ByteBufferPrototype.readUint32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getUint32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    }; // types/ints/int64


    if (Long) {
      /**
       * Writes a 64bit signed integer.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */
      ByteBufferPrototype.writeInt64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
        offset += 8;
        var capacity6 = this.buffer.byteLength;
        if (offset > capacity6) this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
        offset -= 8;

        if (this.littleEndian) {
          this.view.setInt32(offset, value.low, true);
          this.view.setInt32(offset + 4, value.high, true);
        } else {
          this.view.setInt32(offset, value.high, false);
          this.view.setInt32(offset + 4, value.low, false);
        }

        if (relative) this.offset += 8;
        return this;
      };
      /**
       * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */


      ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;
      /**
       * Reads a 64bit signed integer.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */

      ByteBufferPrototype.readInt64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }

        var value = this.littleEndian ? new Long(this.view.getInt32(offset, true), this.view.getInt32(offset + 4, true), false) : new Long(this.view.getInt32(offset + 4, false), this.view.getInt32(offset, false), false);
        if (relative) this.offset += 8;
        return value;
      };
      /**
       * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */


      ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;
      /**
       * Writes a 64bit unsigned integer.
       * @param {number|!Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!ByteBuffer} this
       * @expose
       */

      ByteBufferPrototype.writeUint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);
        offset += 8;
        var capacity7 = this.buffer.byteLength;
        if (offset > capacity7) this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
        offset -= 8;

        if (this.littleEndian) {
          this.view.setInt32(offset, value.low, true);
          this.view.setInt32(offset + 4, value.high, true);
        } else {
          this.view.setInt32(offset, value.high, false);
          this.view.setInt32(offset + 4, value.low, false);
        }

        if (relative) this.offset += 8;
        return this;
      };
      /**
       * Reads a 64bit unsigned integer.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
       * @returns {!Long}
       * @expose
       */


      ByteBufferPrototype.readUint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
        }

        var value = this.littleEndian ? new Long(this.view.getInt32(offset, true), this.view.getInt32(offset + 4, true), true) : new Long(this.view.getInt32(offset + 4, false), this.view.getInt32(offset, false), true);
        if (relative) this.offset += 8;
        return value;
      };
    } // Long
    // types/floats/float32

    /**
     * Writes a 32bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeFloat32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 4;
      var capacity8 = this.buffer.byteLength;
      if (offset > capacity8) this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
      offset -= 4;
      this.view.setFloat32(offset, value, this.littleEndian);
      if (relative) this.offset += 4;
      return this;
    };
    /**
     * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;
    /**
     * Reads a 32bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */

    ByteBufferPrototype.readFloat32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getFloat32(offset, this.littleEndian);
      if (relative) this.offset += 4;
      return value;
    };
    /**
     * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */


    ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32; // types/floats/float64

    /**
     * Writes a 64bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */

    ByteBufferPrototype.writeFloat64 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number') throw TypeError("Illegal value: " + value + " (not a number)");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      offset += 8;
      var capacity9 = this.buffer.byteLength;
      if (offset > capacity9) this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
      offset -= 8;
      this.view.setFloat64(offset, value, this.littleEndian);
      if (relative) this.offset += 8;
      return this;
    };
    /**
     * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;
    /**
     * Reads a 64bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */

    ByteBufferPrototype.readFloat64 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 8 + ") <= " + this.buffer.byteLength);
      }

      var value = this.view.getFloat64(offset, this.littleEndian);
      if (relative) this.offset += 8;
      return value;
    };
    /**
     * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */


    ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64; // types/varints/varint32

    /**
     * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */

    ByteBuffer.MAX_VARINT32_BYTES = 5;
    /**
     * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
     * @param {number} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
     * @expose
     */

    ByteBuffer.calculateVarint32 = function (value) {
      // ref: src/google/protobuf/io/coded_stream.cc
      value = value >>> 0;
      if (value < 1 << 7) return 1;else if (value < 1 << 14) return 2;else if (value < 1 << 21) return 3;else if (value < 1 << 28) return 4;else return 5;
    };
    /**
     * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
     * @param {number} n Signed 32bit integer
     * @returns {number} Unsigned zigzag encoded 32bit integer
     * @expose
     */


    ByteBuffer.zigZagEncode32 = function (n) {
      return ((n |= 0) << 1 ^ n >> 31) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
    };
    /**
     * Decodes a zigzag encoded signed 32bit integer.
     * @param {number} n Unsigned zigzag encoded 32bit integer
     * @returns {number} Signed 32bit integer
     * @expose
     */


    ByteBuffer.zigZagDecode32 = function (n) {
      return n >>> 1 ^ -(n & 1) | 0; // // ref: src/google/protobuf/wire_format_lite.h
    };
    /**
     * Writes a 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeVarint32 = function (value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var size = ByteBuffer.calculateVarint32(value),
          b;
      offset += size;
      var capacity10 = this.buffer.byteLength;
      if (offset > capacity10) this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
      offset -= size; // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc

      this.view.setUint8(offset, b = value | 0x80);
      value >>>= 0;

      if (value >= 1 << 7) {
        b = value >> 7 | 0x80;
        this.view.setUint8(offset + 1, b);

        if (value >= 1 << 14) {
          b = value >> 14 | 0x80;
          this.view.setUint8(offset + 2, b);

          if (value >= 1 << 21) {
            b = value >> 21 | 0x80;
            this.view.setUint8(offset + 3, b);

            if (value >= 1 << 28) {
              this.view.setUint8(offset + 4, value >> 28 & 0x0F);
              size = 5;
            } else {
              this.view.setUint8(offset + 3, b & 0x7F);
              size = 4;
            }
          } else {
            this.view.setUint8(offset + 2, b & 0x7F);
            size = 3;
          }
        } else {
          this.view.setUint8(offset + 1, b & 0x7F);
          size = 2;
        }
      } else {
        this.view.setUint8(offset, b & 0x7F);
        size = 1;
      }

      if (relative) {
        this.offset += size;
        return this;
      }

      return size;
    };
    /**
     * Writes a zig-zag encoded 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeVarint32ZigZag = function (value, offset) {
      return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
    };
    /**
     * Reads a 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
     *  to fully decode the varint.
     * @expose
     */


    ByteBufferPrototype.readVarint32 = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      } // ref: src/google/protobuf/io/coded_stream.cc


      var size = 0,
          value = 0 >>> 0,
          temp,
          ioffset;

      do {
        ioffset = offset + size;

        if (!this.noAssert && ioffset > this.limit) {
          var err = Error("Truncated");
          err['truncated'] = true;
          throw err;
        }

        temp = this.view.getUint8(ioffset);
        if (size < 5) value |= (temp & 0x7F) << 7 * size >>> 0;
        ++size;
      } while ((temp & 0x80) === 0x80);

      value = value | 0; // Make sure to discard the higher order bits

      if (relative) {
        this.offset += size;
        return value;
      }

      return {
        "value": value,
        "length": size
      };
    };
    /**
     * Reads a zig-zag encoded 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */


    ByteBufferPrototype.readVarint32ZigZag = function (offset) {
      var val = this.readVarint32(offset);
      if (typeof val === 'object') val["value"] = ByteBuffer.zigZagDecode32(val["value"]);else val = ByteBuffer.zigZagDecode32(val);
      return val;
    }; // types/varints/varint64


    if (Long) {
      /**
       * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
       * @type {number}
       * @const
       * @expose
       */
      ByteBuffer.MAX_VARINT64_BYTES = 10;
      /**
       * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
       * @param {number|!Long} value Value to encode
       * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
       * @expose
       */

      ByteBuffer.calculateVarint64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value); // ref: src/google/protobuf/io/coded_stream.cc

        var part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;

        if (part2 == 0) {
          if (part1 == 0) {
            if (part0 < 1 << 14) return part0 < 1 << 7 ? 1 : 2;else return part0 < 1 << 21 ? 3 : 4;
          } else {
            if (part1 < 1 << 14) return part1 < 1 << 7 ? 5 : 6;else return part1 < 1 << 21 ? 7 : 8;
          }
        } else return part2 < 1 << 7 ? 9 : 10;
      };
      /**
       * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
       * @param {number|!Long} value Signed long
       * @returns {!Long} Unsigned zigzag encoded long
       * @expose
       */


      ByteBuffer.zigZagEncode64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned(); // ref: src/google/protobuf/wire_format_lite.h

        return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
      };
      /**
       * Decodes a zigzag encoded signed 64bit integer.
       * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
       * @returns {!Long} Signed long
       * @expose
       */


      ByteBuffer.zigZagDecode64 = function (value) {
        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned(); // ref: src/google/protobuf/wire_format_lite.h

        return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
      };
      /**
       * Writes a 64bit base 128 variable-length integer.
       * @param {number|Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  written if omitted.
       * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
       * @expose
       */


      ByteBufferPrototype.writeVarint64 = function (value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof value === 'number') value = Long.fromNumber(value);else if (typeof value === 'string') value = Long.fromString(value);else if (!(value && value instanceof Long)) throw TypeError("Illegal value: " + value + " (not an integer or Long)");
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
        }

        if (typeof value === 'number') value = Long.fromNumber(value, false);else if (typeof value === 'string') value = Long.fromString(value, false);else if (value.unsigned !== false) value = value.toSigned();
        var size = ByteBuffer.calculateVarint64(value),
            part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        offset += size;
        var capacity11 = this.buffer.byteLength;
        if (offset > capacity11) this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
        offset -= size;

        switch (size) {
          case 10:
            this.view.setUint8(offset + 9, part2 >>> 7 & 0x01);

          case 9:
            this.view.setUint8(offset + 8, size !== 9 ? part2 | 0x80 : part2 & 0x7F);

          case 8:
            this.view.setUint8(offset + 7, size !== 8 ? part1 >>> 21 | 0x80 : part1 >>> 21 & 0x7F);

          case 7:
            this.view.setUint8(offset + 6, size !== 7 ? part1 >>> 14 | 0x80 : part1 >>> 14 & 0x7F);

          case 6:
            this.view.setUint8(offset + 5, size !== 6 ? part1 >>> 7 | 0x80 : part1 >>> 7 & 0x7F);

          case 5:
            this.view.setUint8(offset + 4, size !== 5 ? part1 | 0x80 : part1 & 0x7F);

          case 4:
            this.view.setUint8(offset + 3, size !== 4 ? part0 >>> 21 | 0x80 : part0 >>> 21 & 0x7F);

          case 3:
            this.view.setUint8(offset + 2, size !== 3 ? part0 >>> 14 | 0x80 : part0 >>> 14 & 0x7F);

          case 2:
            this.view.setUint8(offset + 1, size !== 2 ? part0 >>> 7 | 0x80 : part0 >>> 7 & 0x7F);

          case 1:
            this.view.setUint8(offset, size !== 1 ? part0 | 0x80 : part0 & 0x7F);
        }

        if (relative) {
          this.offset += size;
          return this;
        } else {
          return size;
        }
      };
      /**
       * Writes a zig-zag encoded 64bit base 128 variable-length integer.
       * @param {number|Long} value Value to write
       * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  written if omitted.
       * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
       * @expose
       */


      ByteBufferPrototype.writeVarint64ZigZag = function (value, offset) {
        return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
      };
      /**
       * Reads a 64bit base 128 variable-length integer. Requires Long.js.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  read if omitted.
       * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
       *  the actual number of bytes read.
       * @throws {Error} If it's not a valid varint
       * @expose
       */


      ByteBufferPrototype.readVarint64 = function (offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;

        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
        } // ref: src/google/protobuf/io/coded_stream.cc


        var start = offset,
            part0 = 0,
            part1 = 0,
            part2 = 0,
            b = 0;
        b = this.view.getUint8(offset++);
        part0 = b & 0x7F;

        if (b & 0x80) {
          b = this.view.getUint8(offset++);
          part0 |= (b & 0x7F) << 7;

          if (b & 0x80) {
            b = this.view.getUint8(offset++);
            part0 |= (b & 0x7F) << 14;

            if (b & 0x80) {
              b = this.view.getUint8(offset++);
              part0 |= (b & 0x7F) << 21;

              if (b & 0x80) {
                b = this.view.getUint8(offset++);
                part1 = b & 0x7F;

                if (b & 0x80) {
                  b = this.view.getUint8(offset++);
                  part1 |= (b & 0x7F) << 7;

                  if (b & 0x80) {
                    b = this.view.getUint8(offset++);
                    part1 |= (b & 0x7F) << 14;

                    if (b & 0x80) {
                      b = this.view.getUint8(offset++);
                      part1 |= (b & 0x7F) << 21;

                      if (b & 0x80) {
                        b = this.view.getUint8(offset++);
                        part2 = b & 0x7F;

                        if (b & 0x80) {
                          b = this.view.getUint8(offset++);
                          part2 |= (b & 0x7F) << 7;

                          if (b & 0x80) {
                            throw Error("Buffer overrun");
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        var value = Long.fromBits(part0 | part1 << 28, part1 >>> 4 | part2 << 24, false);

        if (relative) {
          this.offset = offset;
          return value;
        } else {
          return {
            'value': value,
            'length': offset - start
          };
        }
      };
      /**
       * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
       * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
       *  read if omitted.
       * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
       *  the actual number of bytes read.
       * @throws {Error} If it's not a valid varint
       * @expose
       */


      ByteBufferPrototype.readVarint64ZigZag = function (offset) {
        var val = this.readVarint64(offset);
        if (val && val['value'] instanceof Long) val["value"] = ByteBuffer.zigZagDecode64(val["value"]);else val = ByteBuffer.zigZagDecode64(val);
        return val;
      };
    } // Long
    // types/strings/cstring

    /**
     * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
     *  characters itself.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  contained in `str` + 1 if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
     * @expose
     */


    ByteBufferPrototype.writeCString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      var i,
          k = str.length;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");

        for (i = 0; i < k; ++i) {
          if (str.charCodeAt(i) === 0) throw RangeError("Illegal str: Contains NULL-characters");
        }

        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      } // UTF8 strings do not contain zero bytes in between except for the zero character, so:


      k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
      offset += k + 1;
      var capacity12 = this.buffer.byteLength;
      if (offset > capacity12) this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
      offset -= k + 1;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      this.view.setUint8(offset++, 0);

      if (relative) {
        this.offset = offset;
        return this;
      }

      return k;
    };
    /**
     * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
     *  itself.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readCString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          temp; // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:

      var sd,
          b = -1;
      utfx.decodeUTF8toUTF16(function () {
        if (b === 0) return null;
        if (offset >= this.limit) throw RangeError("Illegal range: Truncated data, " + offset + " < " + this.limit);
        return (b = this.view.getUint8(offset++)) === 0 ? null : b;
      }.bind(this), sd = stringDestination(), true);

      if (relative) {
        this.offset = offset;
        return sd();
      } else {
        return {
          "string": sd(),
          "length": offset - start
        };
      }
    }; // types/strings/istring

    /**
     * Writes a length as uint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */


    ByteBufferPrototype.writeIString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          k;
      k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
      offset += 4 + k;
      var capacity13 = this.buffer.byteLength;
      if (offset > capacity13) this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
      offset -= 4 + k;
      this.view.setUint32(offset, k, this.littleEndian);
      offset += 4;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      if (offset !== start + 4 + k) throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + 4 + k));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Reads a length as uint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */


    ByteBufferPrototype.readIString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 4 + ") <= " + this.buffer.byteLength);
      }

      var temp = 0,
          start = offset,
          str;
      temp = this.view.getUint32(offset, this.littleEndian);
      offset += 4;
      var k = offset + temp,
          sd;
      utfx.decodeUTF8toUTF16(function () {
        return offset < k ? this.view.getUint8(offset++) : null;
      }.bind(this), sd = stringDestination(), this.noAssert);
      str = sd();

      if (relative) {
        this.offset = offset;
        return str;
      } else {
        return {
          'string': str,
          'length': offset - start
        };
      }
    }; // types/strings/utf8string

    /**
     * Metrics representing number of UTF8 characters. Evaluates to `c`.
     * @type {string}
     * @const
     * @expose
     */


    ByteBuffer.METRICS_CHARS = 'c';
    /**
     * Metrics representing number of bytes. Evaluates to `b`.
     * @type {string}
     * @const
     * @expose
     */

    ByteBuffer.METRICS_BYTES = 'b';
    /**
     * Writes an UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */

    ByteBufferPrototype.writeUTF8String = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var k;
      var start = offset;
      k = utfx.calculateUTF16asUTF8(stringSource(str))[1];
      offset += k;
      var capacity14 = this.buffer.byteLength;
      if (offset > capacity14) this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
      offset -= k;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
     * @function
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */


    ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;
    /**
     * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
     *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 characters
     * @expose
     */

    ByteBuffer.calculateUTF8Chars = function (str) {
      return utfx.calculateUTF16asUTF8(stringSource(str))[0];
    };
    /**
     * Calculates the number of UTF8 bytes of a string.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */


    ByteBuffer.calculateUTF8Bytes = function (str) {
      return utfx.calculateUTF16asUTF8(stringSource(str))[1];
    };
    /**
     * Reads an UTF8 encoded string.
     * @param {number} length Number of characters or bytes to read.
     * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readUTF8String = function (length, metrics, offset) {
      if (typeof metrics === 'number') {
        offset = metrics;
        metrics = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;

      if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var i = 0,
          start = offset,
          sd;

      if (metrics === ByteBuffer.METRICS_CHARS) {
        // The same for node and the browser
        sd = stringDestination();
        utfx.decodeUTF8(function () {
          return i < length && offset < this.limit ? this.view.getUint8(offset++) : null;
        }.bind(this), function (cp) {
          ++i;
          utfx.UTF8toUTF16(cp, sd);
        }.bind(this));
        if (i !== length) throw RangeError("Illegal range: Truncated data, " + i + " == " + length);

        if (relative) {
          this.offset = offset;
          return sd();
        } else {
          return {
            "string": sd(),
            "length": offset - start
          };
        }
      } else if (metrics === ByteBuffer.METRICS_BYTES) {
        if (!this.noAssert) {
          if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
          offset >>>= 0;
          if (offset < 0 || offset + length > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + length + ") <= " + this.buffer.byteLength);
        }

        var k = offset + length;
        utfx.decodeUTF8toUTF16(function () {
          return offset < k ? this.view.getUint8(offset++) : null;
        }.bind(this), sd = stringDestination(), this.noAssert);
        if (offset !== k) throw RangeError("Illegal range: Truncated data, " + offset + " == " + k);

        if (relative) {
          this.offset = offset;
          return sd();
        } else {
          return {
            'string': sd(),
            'length': offset - start
          };
        }
      } else throw TypeError("Unsupported metrics: " + metrics);
    };
    /**
     * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
     * @function
     * @param {number} length Number of characters or bytes to read
     * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */


    ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String; // types/strings/vstring

    /**
     * Writes a length as varint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */

    ByteBufferPrototype.writeVString = function (str, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      var start = offset,
          k,
          l;
      k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
      l = ByteBuffer.calculateVarint32(k);
      offset += l + k;
      var capacity15 = this.buffer.byteLength;
      if (offset > capacity15) this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
      offset -= l + k;
      offset += this.writeVarint32(k, offset);
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        this.view.setUint8(offset++, b);
      }.bind(this));
      if (offset !== start + k + l) throw RangeError("Illegal range: Truncated data, " + offset + " == " + (offset + k + l));

      if (relative) {
        this.offset = offset;
        return this;
      }

      return offset - start;
    };
    /**
     * Reads a length as varint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */


    ByteBufferPrototype.readVString = function (offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 1 + ") <= " + this.buffer.byteLength);
      }

      var temp = this.readVarint32(offset),
          start = offset,
          str;
      offset += temp['length'];
      temp = temp['value'];
      var k = offset + temp,
          sd = stringDestination();
      utfx.decodeUTF8toUTF16(function () {
        return offset < k ? this.view.getUint8(offset++) : null;
      }.bind(this), sd, this.noAssert);
      str = sd();

      if (relative) {
        this.offset = offset;
        return str;
      } else {
        return {
          'string': str,
          'length': offset - start
        };
      }
    };
    /**
     * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
     *  data's length.
     * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its offsets
     *  will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
     * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
     */


    ByteBufferPrototype.append = function (source, encoding, offset) {
      if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
      var length = source.limit - source.offset;
      if (length <= 0) return this; // Nothing to append

      offset += length;
      var capacity16 = this.buffer.byteLength;
      if (offset > capacity16) this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
      offset -= length;
      new Uint8Array(this.buffer, offset).set(new Uint8Array(source.buffer).subarray(source.offset, source.limit));
      source.offset += length;
      if (relative) this.offset += length;
      return this;
    };
    /**
     * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
        specified offset up to the length of this ByteBuffer's data.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#append
     */


    ByteBufferPrototype.appendTo = function (target, offset) {
      target.append(this, offset);
      return this;
    };
    /**
     * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
     *  disable them if your code already makes sure that everything is valid.
     * @param {boolean} assert `true` to enable assertions, otherwise `false`
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.assert = function (assert) {
      this.noAssert = !assert;
      return this;
    };
    /**
     * Gets the capacity of this ByteBuffer's backing buffer.
     * @returns {number} Capacity of the backing buffer
     * @expose
     */


    ByteBufferPrototype.capacity = function () {
      return this.buffer.byteLength;
    };
    /**
     * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
     *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.clear = function () {
      this.offset = 0;
      this.limit = this.buffer.byteLength;
      this.markedOffset = -1;
      return this;
    };
    /**
     * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
     *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
     * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
     * @returns {!ByteBuffer} Cloned instance
     * @expose
     */


    ByteBufferPrototype.clone = function (copy) {
      var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);

      if (copy) {
        var buffer = new ArrayBuffer(this.buffer.byteLength);
        new Uint8Array(buffer).set(this.buffer);
        bb.buffer = buffer;
        bb.view = new DataView(buffer);
      } else {
        bb.buffer = this.buffer;
        bb.view = this.view;
      }

      bb.offset = this.offset;
      bb.markedOffset = this.markedOffset;
      bb.limit = this.limit;
      return bb;
    };
    /**
     * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
     *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
     *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.compact = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === 0 && end === this.buffer.byteLength) return this; // Already compacted

      var len = end - begin;

      if (len === 0) {
        this.buffer = EMPTY_BUFFER;
        this.view = null;
        if (this.markedOffset >= 0) this.markedOffset -= begin;
        this.offset = 0;
        this.limit = 0;
        return this;
      }

      var buffer = new ArrayBuffer(len);
      new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(begin, end));
      this.buffer = buffer;
      this.view = new DataView(buffer);
      if (this.markedOffset >= 0) this.markedOffset -= begin;
      this.offset = 0;
      this.limit = len;
      return this;
    };
    /**
     * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Copy
     * @expose
     */


    ByteBufferPrototype.copy = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return new ByteBuffer(0, this.littleEndian, this.noAssert);
      var capacity = end - begin,
          bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
      bb.offset = 0;
      bb.limit = capacity;
      if (bb.markedOffset >= 0) bb.markedOffset -= begin;
      this.copyTo(bb, 0, begin, end);
      return bb;
    };
    /**
     * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
     *  by the number of bytes copied if omitted.
     * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
     *  number of bytes copied if omitted.
     * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.copyTo = function (target, targetOffset, sourceOffset, sourceLimit) {
      var relative, targetRelative;

      if (!this.noAssert) {
        if (!ByteBuffer.isByteBuffer(target)) throw TypeError("Illegal target: Not a ByteBuffer");
      }

      targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
      sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
      sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;
      if (targetOffset < 0 || targetOffset > target.buffer.byteLength) throw RangeError("Illegal target range: 0 <= " + targetOffset + " <= " + target.buffer.byteLength);
      if (sourceOffset < 0 || sourceLimit > this.buffer.byteLength) throw RangeError("Illegal source range: 0 <= " + sourceOffset + " <= " + this.buffer.byteLength);
      var len = sourceLimit - sourceOffset;
      if (len === 0) return target; // Nothing to copy

      target.ensureCapacity(targetOffset + len);
      new Uint8Array(target.buffer).set(new Uint8Array(this.buffer).subarray(sourceOffset, sourceLimit), targetOffset);
      if (relative) this.offset += len;
      if (targetRelative) target.offset += len;
      return this;
    };
    /**
     * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
     *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
     *  the required capacity will be used instead.
     * @param {number} capacity Required capacity
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.ensureCapacity = function (capacity) {
      var current = this.buffer.byteLength;
      if (current < capacity) return this.resize((current *= 2) > capacity ? current : capacity);
      return this;
    };
    /**
     * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
     * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted. defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} this
     * @expose
     * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
     */


    ByteBufferPrototype.fill = function (value, begin, end) {
      var relative = typeof begin === 'undefined';
      if (relative) begin = this.offset;
      if (typeof value === 'string' && value.length > 0) value = value.charCodeAt(0);
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof value !== 'number' || value % 1 !== 0) throw TypeError("Illegal value: " + value + " (not an integer)");
        value |= 0;
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin >= end) return this; // Nothing to fill

      while (begin < end) this.view.setUint8(begin++, value);

      if (relative) this.offset = begin;
      return this;
    };
    /**
     * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
     *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.flip = function () {
      this.limit = this.offset;
      this.offset = 0;
      return this;
    };
    /**
     * Marks an offset on this ByteBuffer to be used later.
     * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @see ByteBuffer#reset
     * @expose
     */


    ByteBufferPrototype.mark = function (offset) {
      offset = typeof offset === 'undefined' ? this.offset : offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      this.markedOffset = offset;
      return this;
    };
    /**
     * Sets the byte order.
     * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.order = function (littleEndian) {
      if (!this.noAssert) {
        if (typeof littleEndian !== 'boolean') throw TypeError("Illegal littleEndian: Not a boolean");
      }

      this.littleEndian = !!littleEndian;
      return this;
    };
    /**
     * Switches (to) little endian byte order.
     * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.LE = function (littleEndian) {
      this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
      return this;
    };
    /**
     * Switches (to) big endian byte order.
     * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.BE = function (bigEndian) {
      this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
      return this;
    };
    /**
     * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer|string|!ArrayBuffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be
     *  modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
     * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
     */


    ByteBufferPrototype.prepend = function (source, encoding, offset) {
      if (typeof encoding === 'number' || typeof encoding !== 'string') {
        offset = encoding;
        encoding = undefined;
      }

      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: " + offset + " (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + this.buffer.byteLength);
      }

      if (!(source instanceof ByteBuffer)) source = ByteBuffer.wrap(source, encoding);
      var len = source.limit - source.offset;
      if (len <= 0) return this; // Nothing to prepend

      var diff = len - offset;
      var arrayView;

      if (diff > 0) {
        // Not enough space before offset, so resize + move
        var buffer = new ArrayBuffer(this.buffer.byteLength + diff);
        arrayView = new Uint8Array(buffer);
        arrayView.set(new Uint8Array(this.buffer).subarray(offset, this.buffer.byteLength), len);
        this.buffer = buffer;
        this.view = new DataView(buffer);
        this.offset += diff;
        if (this.markedOffset >= 0) this.markedOffset += diff;
        this.limit += diff;
        offset += diff;
      } else {
        arrayView = new Uint8Array(this.buffer);
      }

      arrayView.set(new Uint8Array(source.buffer).subarray(source.offset, source.limit), offset - len);
      source.offset = source.limit;
      if (relative) this.offset -= len;
      return this;
    };
    /**
     * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#prepend
     */


    ByteBufferPrototype.prependTo = function (target, offset) {
      target.prepend(this, offset);
      return this;
    };
    /**
     * Prints debug information about this ByteBuffer's contents.
     * @param {function(string)=} out Output function to call, defaults to console.log
     * @expose
     */


    ByteBufferPrototype.printDebug = function (out) {
      if (typeof out !== 'function') out = console.log.bind(console);
      out(this.toString() + "\n" + "-------------------------------------------------------------------\n" + this.toDebug(
      /* columns */
      true));
    };
    /**
     * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
     * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
     * @expose
     */


    ByteBufferPrototype.remaining = function () {
      return this.limit - this.offset;
    };
    /**
     * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
     *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
     *  marked, sets `offset = 0`.
     * @returns {!ByteBuffer} this
     * @see ByteBuffer#mark
     * @expose
     */


    ByteBufferPrototype.reset = function () {
      if (this.markedOffset >= 0) {
        this.offset = this.markedOffset;
        this.markedOffset = -1;
      } else {
        this.offset = 0;
      }

      return this;
    };
    /**
     * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
     *  large or larger.
     * @param {number} capacity Capacity required
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `capacity` is not a number
     * @throws {RangeError} If `capacity < 0`
     * @expose
     */


    ByteBufferPrototype.resize = function (capacity) {
      if (!this.noAssert) {
        if (typeof capacity !== 'number' || capacity % 1 !== 0) throw TypeError("Illegal capacity: " + capacity + " (not an integer)");
        capacity |= 0;
        if (capacity < 0) throw RangeError("Illegal capacity: 0 <= " + capacity);
      }

      if (this.buffer.byteLength < capacity) {
        var buffer = new ArrayBuffer(capacity);
        new Uint8Array(buffer).set(new Uint8Array(this.buffer));
        this.buffer = buffer;
        this.view = new DataView(buffer);
      }

      return this;
    };
    /**
     * Reverses this ByteBuffer's contents.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.reverse = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return this; // Nothing to reverse

      Array.prototype.reverse.call(new Uint8Array(this.buffer).subarray(begin, end));
      this.view = new DataView(this.buffer); // FIXME: Why exactly is this necessary?

      return this;
    };
    /**
     * Skips the next `length` bytes. This will just advance
     * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
     * @returns {!ByteBuffer} this
     * @expose
     */


    ByteBufferPrototype.skip = function (length) {
      if (!this.noAssert) {
        if (typeof length !== 'number' || length % 1 !== 0) throw TypeError("Illegal length: " + length + " (not an integer)");
        length |= 0;
      }

      var offset = this.offset + length;

      if (!this.noAssert) {
        if (offset < 0 || offset > this.buffer.byteLength) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + length + " <= " + this.buffer.byteLength);
      }

      this.offset = offset;
      return this;
    };
    /**
     * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
     * @expose
     */


    ByteBufferPrototype.slice = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var bb = this.clone();
      bb.offset = begin;
      bb.limit = end;
      return bb;
    };
    /**
     * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will transparently {@link ByteBuffer#flip} this
     *  ByteBuffer if `offset > limit` but the actual offsets remain untouched.
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
     *  possible. Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */


    ByteBufferPrototype.toBuffer = function (forceCopy) {
      var offset = this.offset,
          limit = this.limit;

      if (offset > limit) {
        var t = offset;
        offset = limit;
        limit = t;
      }

      if (!this.noAssert) {
        if (typeof offset !== 'number' || offset % 1 !== 0) throw TypeError("Illegal offset: Not an integer");
        offset >>>= 0;
        if (typeof limit !== 'number' || limit % 1 !== 0) throw TypeError("Illegal limit: Not an integer");
        limit >>>= 0;
        if (offset < 0 || offset > limit || limit > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + offset + " <= " + limit + " <= " + this.buffer.byteLength);
      } // NOTE: It's not possible to have another ArrayBuffer reference the same memory as the backing buffer. This is
      // possible with Uint8Array#subarray only, but we have to return an ArrayBuffer by contract. So:


      if (!forceCopy && offset === 0 && limit === this.buffer.byteLength) {
        return this.buffer;
      }

      if (offset === limit) {
        return EMPTY_BUFFER;
      }

      var buffer = new ArrayBuffer(limit - offset);
      new Uint8Array(buffer).set(new Uint8Array(this.buffer).subarray(offset, limit), 0);
      return buffer;
    };
    /**
     * Returns a raw buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will transparently {@link ByteBuffer#flip} this
     *  ByteBuffer if `offset > limit` but the actual offsets remain untouched. This is an alias of
     *  {@link ByteBuffer#toBuffer}.
     * @function
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory.
     *  Defaults to `false`
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     * @expose
     */


    ByteBufferPrototype.toArrayBuffer = ByteBufferPrototype.toBuffer;
    /**
     * Converts the ByteBuffer's contents to a string.
     * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
     *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
     *  highlighted offsets.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {string} String representation
     * @throws {Error} If `encoding` is invalid
     * @expose
     */

    ByteBufferPrototype.toString = function (encoding, begin, end) {
      if (typeof encoding === 'undefined') return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
      if (typeof encoding === 'number') encoding = "utf8", begin = encoding, end = begin;

      switch (encoding) {
        case "utf8":
          return this.toUTF8(begin, end);

        case "base64":
          return this.toBase64(begin, end);

        case "hex":
          return this.toHex(begin, end);

        case "binary":
          return this.toBinary(begin, end);

        case "debug":
          return this.toDebug();

        case "columns":
          return this.toColumns();

        default:
          throw Error("Unsupported encoding: " + encoding);
      }
    }; // lxiv-embeddable

    /**
     * lxiv-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/lxiv for details
     */


    var lxiv = function () {
      "use strict";
      /**
       * lxiv namespace.
       * @type {!Object.<string,*>}
       * @exports lxiv
       */

      var lxiv = {};
      /**
       * Character codes for output.
       * @type {!Array.<number>}
       * @inner
       */

      var aout = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];
      /**
       * Character codes for input.
       * @type {!Array.<number>}
       * @inner
       */

      var ain = [];

      for (var i = 0, k = aout.length; i < k; ++i) ain[aout[i]] = i;
      /**
       * Encodes bytes to base64 char codes.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if
       *  there are no more bytes left.
       * @param {!function(number)} dst Characters destination as a function successively called with each encoded char
       *  code.
       */


      lxiv.encode = function (src, dst) {
        var b, t;

        while ((b = src()) !== null) {
          dst(aout[b >> 2 & 0x3f]);
          t = (b & 0x3) << 4;

          if ((b = src()) !== null) {
            t |= b >> 4 & 0xf;
            dst(aout[(t | b >> 4 & 0xf) & 0x3f]);
            t = (b & 0xf) << 2;
            if ((b = src()) !== null) dst(aout[(t | b >> 6 & 0x3) & 0x3f]), dst(aout[b & 0x3f]);else dst(aout[t & 0x3f]), dst(61);
          } else dst(aout[t & 0x3f]), dst(61), dst(61);
        }
      };
      /**
       * Decodes base64 char codes to bytes.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
       * @throws {Error} If a character code is invalid
       */


      lxiv.decode = function (src, dst) {
        var c, t1, t2;

        function fail(c) {
          throw Error("Illegal character code: " + c);
        }

        while ((c = src()) !== null) {
          t1 = ain[c];
          if (typeof t1 === 'undefined') fail(c);

          if ((c = src()) !== null) {
            t2 = ain[c];
            if (typeof t2 === 'undefined') fail(c);
            dst(t1 << 2 >>> 0 | (t2 & 0x30) >> 4);

            if ((c = src()) !== null) {
              t1 = ain[c];
              if (typeof t1 === 'undefined') if (c === 61) break;else fail(c);
              dst((t2 & 0xf) << 4 >>> 0 | (t1 & 0x3c) >> 2);

              if ((c = src()) !== null) {
                t2 = ain[c];
                if (typeof t2 === 'undefined') if (c === 61) break;else fail(c);
                dst((t1 & 0x3) << 6 >>> 0 | t2);
              }
            }
          }
        }
      };
      /**
       * Tests if a string is valid base64.
       * @param {string} str String to test
       * @returns {boolean} `true` if valid, otherwise `false`
       */


      lxiv.test = function (str) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(str);
      };

      return lxiv;
    }(); // encodings/base64

    /**
     * Encodes this ByteBuffer's contents to a base64 encoded string.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
     * @returns {string} Base64 encoded string
     * @expose
     */


    ByteBufferPrototype.toBase64 = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var sd;
      lxiv.encode(function () {
        return begin < end ? this.view.getUint8(begin++) : null;
      }.bind(this), sd = stringDestination());
      return sd();
    };
    /**
     * Decodes a base64 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromBase64 = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (str.length % 4 !== 0) throw TypeError("Illegal str: Length not a multiple of 4");
      }

      var bb = new ByteBuffer(str.length / 4 * 3, littleEndian, noAssert),
          i = 0;
      lxiv.decode(stringSource(str), function (b) {
        bb.view.setUint8(i++, b);
      });
      bb.limit = i;
      return bb;
    };
    /**
     * Encodes a binary string to base64 like `window.btoa` does.
     * @param {string} str Binary string
     * @returns {string} Base64 encoded string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
     * @expose
     */


    ByteBuffer.btoa = function (str) {
      return ByteBuffer.fromBinary(str).toBase64();
    };
    /**
     * Decodes a base64 encoded string to binary like `window.atob` does.
     * @param {string} b64 Base64 encoded string
     * @returns {string} Binary string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
     * @expose
     */


    ByteBuffer.atob = function (b64) {
      return ByteBuffer.fromBase64(b64).toBinary();
    }; // encodings/binary

    /**
     * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Binary encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */


    ByteBufferPrototype.toBinary = function (begin, end) {
      begin = typeof begin === 'undefined' ? this.offset : begin;
      end = typeof end === 'undefined' ? this.limit : end;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      if (begin === end) return "";
      var cc = [],
          pt = [];

      while (begin < end) {
        cc.push(this.view.getUint8(begin++));
        if (cc.length >= 1024) pt.push(String.fromCharCode.apply(String, cc)), cc = [];
      }

      return pt.join('') + String.fromCharCode.apply(String, cc);
    };
    /**
     * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromBinary = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      }

      var i = 0,
          k = str.length,
          charCode,
          bb = new ByteBuffer(k, littleEndian, noAssert);

      while (i < k) {
        charCode = str.charCodeAt(i);
        if (!noAssert && charCode > 255) throw RangeError("Illegal charCode at " + i + ": 0 <= " + charCode + " <= 255");
        bb.view.setUint8(i++, charCode);
      }

      bb.limit = k;
      return bb;
    }; // encodings/debug

    /**
     * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
     * * `<` : offset,
     * * `'` : markedOffset,
     * * `>` : limit,
     * * `|` : offset and limit,
     * * `[` : offset and markedOffset,
     * * `]` : markedOffset and limit,
     * * `!` : offset, markedOffset and limit
     * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
     * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
     * @expose
     * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
     * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
     * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
     * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
     */


    ByteBufferPrototype.toDebug = function (columns) {
      var i = -1,
          k = this.buffer.byteLength,
          b,
          hex = "",
          asc = "",
          out = "";

      while (i < k) {
        if (i !== -1) {
          b = this.view.getUint8(i);
          if (b < 0x10) hex += "0" + b.toString(16).toUpperCase();else hex += b.toString(16).toUpperCase();

          if (columns) {
            asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
          }
        }

        ++i;

        if (columns) {
          if (i > 0 && i % 16 === 0 && i !== k) {
            while (hex.length < 3 * 16 + 3) hex += " ";

            out += hex + asc + "\n";
            hex = asc = "";
          }
        }

        if (i === this.offset && i === this.limit) hex += i === this.markedOffset ? "!" : "|";else if (i === this.offset) hex += i === this.markedOffset ? "[" : "<";else if (i === this.limit) hex += i === this.markedOffset ? "]" : ">";else hex += i === this.markedOffset ? "'" : columns || i !== 0 && i !== k ? " " : "";
      }

      if (columns && hex !== " ") {
        while (hex.length < 3 * 16 + 3) hex += " ";

        out += hex + asc + "\n";
      }

      return columns ? out : hex;
    };
    /**
     * Decodes a hex encoded string with marked offsets to a ByteBuffer.
     * @param {string} str Debug string to decode (not be generated with `columns = true`)
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     * @see ByteBuffer#toDebug
     */


    ByteBuffer.fromDebug = function (str, littleEndian, noAssert) {
      var k = str.length,
          bb = new ByteBuffer((k + 1) / 3 | 0, littleEndian, noAssert);
      var i = 0,
          j = 0,
          ch,
          b,
          rs = false,
          // Require symbol next
      ho = false,
          hm = false,
          hl = false,
          // Already has offset, markedOffset, limit?
      fail = false;

      while (i < k) {
        switch (ch = str.charAt(i++)) {
          case '!':
            if (!noAssert) {
              if (ho || hm || hl) {
                fail = true;
                break;
              }

              ho = hm = hl = true;
            }

            bb.offset = bb.markedOffset = bb.limit = j;
            rs = false;
            break;

          case '|':
            if (!noAssert) {
              if (ho || hl) {
                fail = true;
                break;
              }

              ho = hl = true;
            }

            bb.offset = bb.limit = j;
            rs = false;
            break;

          case '[':
            if (!noAssert) {
              if (ho || hm) {
                fail = true;
                break;
              }

              ho = hm = true;
            }

            bb.offset = bb.markedOffset = j;
            rs = false;
            break;

          case '<':
            if (!noAssert) {
              if (ho) {
                fail = true;
                break;
              }

              ho = true;
            }

            bb.offset = j;
            rs = false;
            break;

          case ']':
            if (!noAssert) {
              if (hl || hm) {
                fail = true;
                break;
              }

              hl = hm = true;
            }

            bb.limit = bb.markedOffset = j;
            rs = false;
            break;

          case '>':
            if (!noAssert) {
              if (hl) {
                fail = true;
                break;
              }

              hl = true;
            }

            bb.limit = j;
            rs = false;
            break;

          case "'":
            if (!noAssert) {
              if (hm) {
                fail = true;
                break;
              }

              hm = true;
            }

            bb.markedOffset = j;
            rs = false;
            break;

          case ' ':
            rs = false;
            break;

          default:
            if (!noAssert) {
              if (rs) {
                fail = true;
                break;
              }
            }

            b = parseInt(ch + str.charAt(i++), 16);

            if (!noAssert) {
              if (isNaN(b) || b < 0 || b > 255) throw TypeError("Illegal str: Not a debug encoded string");
            }

            bb.view.setUint8(j++, b);
            rs = true;
        }

        if (fail) throw TypeError("Illegal str: Invalid symbol at " + i);
      }

      if (!noAssert) {
        if (!ho || !hl) throw TypeError("Illegal str: Missing offset or limit");
        if (j < bb.buffer.byteLength) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + j + " < " + k);
      }

      return bb;
    }; // encodings/hex

    /**
     * Encodes this ByteBuffer's contents to a hex encoded string.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Hex encoded string
     * @expose
     */


    ByteBufferPrototype.toHex = function (begin, end) {
      begin = typeof begin === 'undefined' ? this.offset : begin;
      end = typeof end === 'undefined' ? this.limit : end;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var out = new Array(end - begin),
          b;

      while (begin < end) {
        b = this.view.getUint8(begin++);
        if (b < 0x10) out.push("0", b.toString(16));else out.push(b.toString(16));
      }

      return out.join('');
    };
    /**
     * Decodes a hex encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromHex = function (str, littleEndian, noAssert) {
      if (!noAssert) {
        if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
        if (str.length % 2 !== 0) throw TypeError("Illegal str: Length not a multiple of 2");
      }

      var k = str.length,
          bb = new ByteBuffer(k / 2 | 0, littleEndian),
          b;

      for (var i = 0, j = 0; i < k; i += 2) {
        b = parseInt(str.substring(i, i + 2), 16);
        if (!noAssert) if (!isFinite(b) || b < 0 || b > 255) throw TypeError("Illegal str: Contains non-hex characters");
        bb.view.setUint8(j++, b);
      }

      bb.limit = j;
      return bb;
    }; // utfx-embeddable

    /**
     * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/utfx for details
     */


    var utfx = function () {
      "use strict";
      /**
       * utfx namespace.
       * @inner
       * @type {!Object.<string,*>}
       */

      var utfx = {};
      /**
       * Maximum valid code point.
       * @type {number}
       * @const
       */

      utfx.MAX_CODEPOINT = 0x10FFFF;
      /**
       * Encodes UTF8 code points to UTF8 bytes.
       * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
       *  respectively `null` if there are no more code points left or a single numeric code point.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
       */

      utfx.encodeUTF8 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number') cp = src, src = function () {
          return null;
        };

        while (cp !== null || (cp = src()) !== null) {
          if (cp < 0x80) dst(cp & 0x7F);else if (cp < 0x800) dst(cp >> 6 & 0x1F | 0xC0), dst(cp & 0x3F | 0x80);else if (cp < 0x10000) dst(cp >> 12 & 0x0F | 0xE0), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);else dst(cp >> 18 & 0x07 | 0xF0), dst(cp >> 12 & 0x3F | 0x80), dst(cp >> 6 & 0x3F | 0x80), dst(cp & 0x3F | 0x80);
          cp = null;
        }
      };
      /**
       * Decodes UTF8 bytes to UTF8 code points.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
       *  are no more bytes left.
       * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
       * @throws {RangeError} If a starting byte is invalid in UTF8
       * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
       *  remaining bytes.
       */


      utfx.decodeUTF8 = function (src, dst) {
        var a,
            b,
            c,
            d,
            fail = function (b) {
          b = b.slice(0, b.indexOf(null));
          var err = Error(b.toString());
          err.name = "TruncatedError";
          err['bytes'] = b;
          throw err;
        };

        while ((a = src()) !== null) {
          if ((a & 0x80) === 0) dst(a);else if ((a & 0xE0) === 0xC0) (b = src()) === null && fail([a, b]), dst((a & 0x1F) << 6 | b & 0x3F);else if ((a & 0xF0) === 0xE0) ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 0x0F) << 12 | (b & 0x3F) << 6 | c & 0x3F);else if ((a & 0xF8) === 0xF0) ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 0x07) << 18 | (b & 0x3F) << 12 | (c & 0x3F) << 6 | d & 0x3F);else throw RangeError("Illegal starting byte: " + a);
        }
      };
      /**
       * Converts UTF16 characters to UTF8 code points.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @param {!function(number)} dst Code points destination as a function successively called with each converted code
       *  point.
       */


      utfx.UTF16toUTF8 = function (src, dst) {
        var c1,
            c2 = null;

        while (true) {
          if ((c1 = c2 !== null ? c2 : src()) === null) break;

          if (c1 >= 0xD800 && c1 <= 0xDFFF) {
            if ((c2 = src()) !== null) {
              if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                dst((c1 - 0xD800) * 0x400 + c2 - 0xDC00 + 0x10000);
                c2 = null;
                continue;
              }
            }
          }

          dst(c1);
        }

        if (c2 !== null) dst(c2);
      };
      /**
       * Converts UTF8 code points to UTF16 characters.
       * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
       *  respectively `null` if there are no more code points left or a single numeric code point.
       * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
       * @throws {RangeError} If a code point is out of range
       */


      utfx.UTF8toUTF16 = function (src, dst) {
        var cp = null;
        if (typeof src === 'number') cp = src, src = function () {
          return null;
        };

        while (cp !== null || (cp = src()) !== null) {
          if (cp <= 0xFFFF) dst(cp);else cp -= 0x10000, dst((cp >> 10) + 0xD800), dst(cp % 0x400 + 0xDC00);
          cp = null;
        }
      };
      /**
       * Converts and encodes UTF16 characters to UTF8 bytes.
       * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
       *  if there are no more characters left.
       * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
       */


      utfx.encodeUTF16toUTF8 = function (src, dst) {
        utfx.UTF16toUTF8(src, function (cp) {
          utfx.encodeUTF8(cp, dst);
        });
      };
      /**
       * Decodes and converts UTF8 bytes to UTF16 characters.
       * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
       *  are no more bytes left.
       * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
       * @throws {RangeError} If a starting byte is invalid in UTF8
       * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
       */


      utfx.decodeUTF8toUTF16 = function (src, dst) {
        utfx.decodeUTF8(src, function (cp) {
          utfx.UTF8toUTF16(cp, dst);
        });
      };
      /**
       * Calculates the byte length of an UTF8 code point.
       * @param {number} cp UTF8 code point
       * @returns {number} Byte length
       */


      utfx.calculateCodePoint = function (cp) {
        return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      };
      /**
       * Calculates the number of UTF8 bytes required to store UTF8 code points.
       * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
       *  `null` if there are no more code points left.
       * @returns {number} The number of UTF8 bytes required
       */


      utfx.calculateUTF8 = function (src) {
        var cp,
            l = 0;

        while ((cp = src()) !== null) l += utfx.calculateCodePoint(cp);

        return l;
      };
      /**
       * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
       * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
       *  `null` if there are no more characters left.
       * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
       */


      utfx.calculateUTF16asUTF8 = function (src) {
        var n = 0,
            l = 0;
        utfx.UTF16toUTF8(src, function (cp) {
          ++n;
          l += utfx.calculateCodePoint(cp);
        });
        return [n, l];
      };

      return utfx;
    }(); // encodings/utf8

    /**
     * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
     *  string.
     * @returns {string} Hex encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */


    ByteBufferPrototype.toUTF8 = function (begin, end) {
      if (typeof begin === 'undefined') begin = this.offset;
      if (typeof end === 'undefined') end = this.limit;

      if (!this.noAssert) {
        if (typeof begin !== 'number' || begin % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
        begin >>>= 0;
        if (typeof end !== 'number' || end % 1 !== 0) throw TypeError("Illegal end: Not an integer");
        end >>>= 0;
        if (begin < 0 || begin > end || end > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + begin + " <= " + end + " <= " + this.buffer.byteLength);
      }

      var sd;

      try {
        utfx.decodeUTF8toUTF16(function () {
          return begin < end ? this.view.getUint8(begin++) : null;
        }.bind(this), sd = stringDestination());
      } catch (e) {
        if (begin !== end) throw RangeError("Illegal range: Truncated data, " + begin + " != " + end);
      }

      return sd();
    };
    /**
     * Decodes an UTF8 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */


    ByteBuffer.fromUTF8 = function (str, littleEndian, noAssert) {
      if (!noAssert) if (typeof str !== 'string') throw TypeError("Illegal str: Not a string");
      var bb = new ByteBuffer(utfx.calculateUTF16asUTF8(stringSource(str), true)[1], littleEndian, noAssert),
          i = 0;
      utfx.encodeUTF16toUTF8(stringSource(str), function (b) {
        bb.view.setUint8(i++, b);
      });
      bb.limit = i;
      return bb;
    };

    return ByteBuffer;
  }
  /* CommonJS */


  if ( true && module && typeof exports === 'object' && exports) module['exports'] = function () {
    var Long;

    try {
      Long = __webpack_require__(/*! long */ "./node_modules/long/dist/Long.js");
    } catch (e) {}

    return loadByteBuffer(Long);
  }();
  /* AMD */
  else if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! Long */ "./node_modules/Long/dist/Long.js")], __WEBPACK_AMD_DEFINE_RESULT__ = (function (Long) {
      return loadByteBuffer(Long);
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    /* Global */
    else {}
})(this);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/js-cookie/src/js.cookie.js":
/*!*************************************************!*\
  !*** ./node_modules/js-cookie/src/js.cookie.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;

(function (factory) {
  var registeredInModuleLoader = false;

  if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    registeredInModuleLoader = true;
  }

  if (true) {
    module.exports = factory();
    registeredInModuleLoader = true;
  }

  if (!registeredInModuleLoader) {
    var OldCookies = window.Cookies;
    var api = window.Cookies = factory();

    api.noConflict = function () {
      window.Cookies = OldCookies;
      return api;
    };
  }
})(function () {
  function extend() {
    var i = 0;
    var result = {};

    for (; i < arguments.length; i++) {
      var attributes = arguments[i];

      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }

    return result;
  }

  function init(converter) {
    function api(key, value, attributes) {
      var result;

      if (typeof document === 'undefined') {
        return;
      } // Write


      if (arguments.length > 1) {
        attributes = extend({
          path: '/'
        }, api.defaults, attributes);

        if (typeof attributes.expires === 'number') {
          var expires = new Date();
          expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
          attributes.expires = expires;
        } // We're using "expires" because "max-age" is not supported by IE


        attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

        try {
          result = JSON.stringify(value);

          if (/^[\{\[]/.test(result)) {
            value = result;
          }
        } catch (e) {}

        if (!converter.write) {
          value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
        } else {
          value = converter.write(value, key);
        }

        key = encodeURIComponent(String(key));
        key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        key = key.replace(/[\(\)]/g, escape);
        var stringifiedAttributes = '';

        for (var attributeName in attributes) {
          if (!attributes[attributeName]) {
            continue;
          }

          stringifiedAttributes += '; ' + attributeName;

          if (attributes[attributeName] === true) {
            continue;
          }

          stringifiedAttributes += '=' + attributes[attributeName];
        }

        return document.cookie = key + '=' + value + stringifiedAttributes;
      } // Read


      if (!key) {
        result = {};
      } // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all. Also prevents odd result when
      // calling "get()"


      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var rdecode = /(%[0-9A-Z]{2})+/g;
      var i = 0;

      for (; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var cookie = parts.slice(1).join('=');

        if (!this.json && cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = parts[0].replace(rdecode, decodeURIComponent);
          cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

          if (this.json) {
            try {
              cookie = JSON.parse(cookie);
            } catch (e) {}
          }

          if (key === name) {
            result = cookie;
            break;
          }

          if (!key) {
            result[name] = cookie;
          }
        } catch (e) {}
      }

      return result;
    }

    api.set = api;

    api.get = function (key) {
      return api.call(api, key);
    };

    api.getJSON = function () {
      return api.apply({
        json: true
      }, [].slice.call(arguments));
    };

    api.defaults = {};

    api.remove = function (key, attributes) {
      api(key, '', extend(attributes, {
        expires: -1
      }));
    };

    api.withConverter = init;
    return api;
  }

  return init(function () {});
});

/***/ }),

/***/ "./node_modules/long/dist/Long.js":
/*!****************************************!*\
  !*** ./node_modules/long/dist/Long.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license Long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/Long.js for details
 */
(function (global, factory) {
  /* AMD */
  if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  /* CommonJS */
  else {}
})(this, function () {
  "use strict";
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @constructor
   */

  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     * @expose
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     * @expose
     */

    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     * @expose
     */

    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.

  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @expose
   * @private
   */


  Long.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true,
    enumerable: false,
    configurable: false
  });
  /**
   * Tests if the specified object is a Long.
   * @param {*} obj Object
   * @returns {boolean}
   * @expose
   */

  Long.isLong = function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  };
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */


  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */

  var UINT_CACHE = {};
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */

  Long.fromInt = function fromInt(value, unsigned) {
    var obj, cachedObj;

    if (!unsigned) {
      value = value | 0;

      if (-128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }

      obj = new Long(value, value < 0 ? -1 : 0, false);
      if (-128 <= value && value < 128) INT_CACHE[value] = obj;
      return obj;
    } else {
      value = value >>> 0;

      if (0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }

      obj = new Long(value, (value | 0) < 0 ? -1 : 0, true);
      if (0 <= value && value < 256) UINT_CACHE[value] = obj;
      return obj;
    }
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromNumber = function fromNumber(value, unsigned) {
    unsigned = !!unsigned;
    if (isNaN(value) || !isFinite(value)) return Long.ZERO;
    if (!unsigned && value <= -TWO_PWR_63_DBL) return Long.MIN_VALUE;
    if (!unsigned && value + 1 >= TWO_PWR_63_DBL) return Long.MAX_VALUE;
    if (unsigned && value >= TWO_PWR_64_DBL) return Long.MAX_UNSIGNED_VALUE;
    if (value < 0) return Long.fromNumber(-value, unsigned).negate();
    return new Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  };
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromBits = function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  };
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   * @expose
   */


  Long.fromString = function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('number format error: empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return Long.ZERO;
    if (typeof unsigned === 'number') // For goog.math.long compatibility
      radix = unsigned, unsigned = false;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw Error('radix out of range: ' + radix);
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('number format error: interior "-" character: ' + str);else if (p === 0) return Long.fromString(str.substring(1), unsigned, radix).negate(); // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.

    var radixToPower = Long.fromNumber(Math.pow(radix, 8));
    var result = Long.ZERO;

    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);

      if (size < 8) {
        var power = Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(Long.fromNumber(value));
      }
    }

    result.unsigned = unsigned;
    return result;
  };
  /**
   * Converts the specified value to a Long.
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @returns {!Long}
   * @expose
   */


  Long.fromValue = function fromValue(val) {
    if (val
    /* is compatible */
    instanceof Long) return val;
    if (typeof val === 'number') return Long.fromNumber(val);
    if (typeof val === 'string') return Long.fromString(val); // Throws for non-objects, converts non-instanceof Long:

    return new Long(val.low, val.high, val.unsigned);
  }; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.

  /**
   * @type {number}
   * @const
   * @inner
   */


  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */

  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */

  var TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
  /**
   * Signed zero.
   * @type {!Long}
   * @expose
   */

  Long.ZERO = Long.fromInt(0);
  /**
   * Unsigned zero.
   * @type {!Long}
   * @expose
   */

  Long.UZERO = Long.fromInt(0, true);
  /**
   * Signed one.
   * @type {!Long}
   * @expose
   */

  Long.ONE = Long.fromInt(1);
  /**
   * Unsigned one.
   * @type {!Long}
   * @expose
   */

  Long.UONE = Long.fromInt(1, true);
  /**
   * Signed negative one.
   * @type {!Long}
   * @expose
   */

  Long.NEG_ONE = Long.fromInt(-1);
  /**
   * Maximum signed value.
   * @type {!Long}
   * @expose
   */

  Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   * @expose
   */

  Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Minimum signed value.
   * @type {!Long}
   * @expose
   */

  Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @returns {number}
   * @expose
   */

  Long.prototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @returns {number}
   * @expose
   */


  Long.prototype.toNumber = function toNumber() {
    if (this.unsigned) {
      return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    }

    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   * @expose
   */


  Long.prototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix out of range: ' + radix);
    if (this.isZero()) return '0';
    var rem;

    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.equals(Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = Long.fromNumber(radix);
        var div = this.divide(radixLong);
        rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else return '-' + this.negate().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.


    var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
    rem = this;
    var result = '';

    while (true) {
      var remDiv = rem.divide(radixToPower),
          intval = rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;

        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @returns {number} Signed high bits
   * @expose
   */


  Long.prototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @returns {number} Unsigned high bits
   * @expose
   */


  Long.prototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @returns {number} Signed low bits
   * @expose
   */


  Long.prototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @returns {number} Unsigned low bits
   * @expose
   */


  Long.prototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @returns {number}
   * @expose
   */


  Long.prototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.equals(Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;

    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;

    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value is negative.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @returns {boolean}
   * @expose
   */


  Long.prototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.equals = function equals(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.eq = Long.prototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.notEquals = function notEquals(other) {
    return !this.equals(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.neq = Long.prototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.lessThan = function lessThan(other) {
    return this.compare(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.lt = Long.prototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.compare(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.lte = Long.prototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.greaterThan = function greaterThan(other) {
    return this.compare(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.gt = Long.prototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */

  Long.prototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.compare(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   * @expose
   */


  Long.prototype.gte = Long.prototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   * @expose
   */

  Long.prototype.compare = function compare(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    if (this.equals(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same

    if (!this.unsigned) return this.subtract(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned

    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Negates this Long's value.
   * @returns {!Long} Negated Long
   * @expose
   */


  Long.prototype.negate = function negate() {
    if (!this.unsigned && this.equals(Long.MIN_VALUE)) return Long.MIN_VALUE;
    return this.not().add(Long.ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   * @expose
   */


  Long.prototype.neg = Long.prototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   * @expose
   */

  Long.prototype.add = function add(addend) {
    if (!Long.isLong(addend)) addend = Long.fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   * @expose
   */


  Long.prototype.subtract = function subtract(subtrahend) {
    if (!Long.isLong(subtrahend)) subtrahend = Long.fromValue(subtrahend);
    return this.add(subtrahend.negate());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   * @expose
   */


  Long.prototype.sub = Long.prototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   * @expose
   */

  Long.prototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return Long.ZERO;
    if (!Long.isLong(multiplier)) multiplier = Long.fromValue(multiplier);
    if (multiplier.isZero()) return Long.ZERO;
    if (this.equals(Long.MIN_VALUE)) return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
    if (multiplier.equals(Long.MIN_VALUE)) return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;

    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.negate().multiply(multiplier.negate());else return this.negate().multiply(multiplier).negate();
    } else if (multiplier.isNegative()) return this.multiply(multiplier.negate()).negate(); // If both longs are small, use float multiplication


    if (this.lessThan(TWO_PWR_24) && multiplier.lessThan(TWO_PWR_24)) return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return Long.fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   * @expose
   */


  Long.prototype.mul = Long.prototype.multiply;
  /**
   * Returns this Long divided by the specified.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   * @expose
   */

  Long.prototype.divide = function divide(divisor) {
    if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
    if (divisor.isZero()) throw new Error('division by zero');
    if (this.isZero()) return this.unsigned ? Long.UZERO : Long.ZERO;
    var approx, rem, res;

    if (this.equals(Long.MIN_VALUE)) {
      if (divisor.equals(Long.ONE) || divisor.equals(Long.NEG_ONE)) return Long.MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
      else if (divisor.equals(Long.MIN_VALUE)) return Long.ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shiftRight(1);
          approx = halfThis.divide(divisor).shiftLeft(1);

          if (approx.equals(Long.ZERO)) {
            return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
          } else {
            rem = this.subtract(divisor.multiply(approx));
            res = approx.add(rem.divide(divisor));
            return res;
          }
        }
    } else if (divisor.equals(Long.MIN_VALUE)) return this.unsigned ? Long.UZERO : Long.ZERO;

    if (this.isNegative()) {
      if (divisor.isNegative()) return this.negate().divide(divisor.negate());
      return this.negate().divide(divisor).negate();
    } else if (divisor.isNegative()) return this.divide(divisor.negate()).negate(); // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.


    res = Long.ZERO;
    rem = this;

    while (rem.greaterThanOrEqual(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.

      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = Long.fromNumber(approx),
          approxRem = approxRes.multiply(divisor);

      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = Long.fromNumber(approx, this.unsigned);
        approxRem = approxRes.multiply(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.


      if (approxRes.isZero()) approxRes = Long.ONE;
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }

    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   * @expose
   */


  Long.prototype.div = Long.prototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   * @expose
   */

  Long.prototype.modulo = function modulo(divisor) {
    if (!Long.isLong(divisor)) divisor = Long.fromValue(divisor);
    return this.subtract(this.divide(divisor).multiply(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   * @expose
   */


  Long.prototype.mod = Long.prototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @returns {!Long}
   * @expose
   */

  Long.prototype.not = function not() {
    return Long.fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.and = function and(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.or = function or(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   * @expose
   */


  Long.prototype.xor = function xor(other) {
    if (!Long.isLong(other)) other = Long.fromValue(other);
    return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shiftLeft = function shiftLeft(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return Long.fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return Long.fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shl = Long.prototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */

  Long.prototype.shiftRight = function shiftRight(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return Long.fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return Long.fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shr = Long.prototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */

  Long.prototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (Long.isLong(numBits)) numBits = numBits.toInt();
    numBits &= 63;
    if (numBits === 0) return this;else {
      var high = this.high;

      if (numBits < 32) {
        var low = this.low;
        return Long.fromBits(low >>> numBits | high << 32 - numBits, high >>> numBits, this.unsigned);
      } else if (numBits === 32) return Long.fromBits(high, 0, this.unsigned);else return Long.fromBits(high >>> numBits - 32, 0, this.unsigned);
    }
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   * @expose
   */


  Long.prototype.shru = Long.prototype.shiftRightUnsigned;
  /**
   * Converts this Long to signed.
   * @returns {!Long} Signed long
   * @expose
   */

  Long.prototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return new Long(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @returns {!Long} Unsigned long
   * @expose
   */


  Long.prototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return new Long(this.low, this.high, true);
  };

  return Long;
});

/***/ }),

/***/ "./node_modules/pson/dist/PSON.js":
/*!****************************************!*\
  !*** ./node_modules/pson/dist/PSON.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license PSON (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/PSON for details
 */
(function (global) {
  "use strict";

  function loadPSON(ByteBuffer) {
    if (!ByteBuffer) {
      throw new Error("PSON requires ByteBuffer.js: Get it at https://github.com/dcodeIO/ByteBuffer.js");
    }
    /**
     * PSON namespace.
     * @exports PSON
     * @namespace
     */


    var PSON = {};
    /**
     * @alias PSON.T
     */

    PSON.T = function () {
      /**
       * PSON byte types.
       * @exports PSON.T
       * @namespace
       */
      var T = {};
      T.ZERO = 0x00; // 0
      //             0x01; // -1
      //             0x02; // 1
      //             ...   // zig-zag encoded varints

      T.MAX = 0xEF; // -120, max. zig-zag encoded varint

      T.NULL = 0xF0; // null

      T.TRUE = 0xF1; // true

      T.FALSE = 0xF2; // false

      T.EOBJECT = 0xF3; // {}

      T.EARRAY = 0xF4; // []

      T.ESTRING = 0xF5; // ""

      T.OBJECT = 0xF6; // {...}

      T.ARRAY = 0xF7; // [...]

      T.INTEGER = 0xF8; // number (zig-zag encoded varint32)

      T.LONG = 0xF9; // Long   (zig-zag encoded varint64)

      T.FLOAT = 0xFA; // number (float32)

      T.DOUBLE = 0xFB; // number (float64)

      T.STRING = 0xFC; // string (varint length + data)

      T.STRING_ADD = 0xFD; // string (varint length + data, add to dictionary)

      T.STRING_GET = 0xFE; // string (varint index to get from dictionary)

      T.BINARY = 0xFF; // bytes (varint length + data)

      return T;
    }();
    /**
     * @alias PSON.Encoder
     */


    PSON.Encoder = function (ByteBuffer, T) {
      /**
       * Float conversion test buffer.
       * @type {!ByteBuffer}
       */
      var fbuf = new ByteBuffer(4);
      fbuf.length = 4;
      /**
       * Long.js.
       * @type {?Long}
       */

      var Long = ByteBuffer.Long;
      /**
       * Constructs a new PSON Encoder.
       * @exports PSON.Encoder
       * @class A PSON Encoder.
       * @param {Array.<string>=} dict Initial dictionary
       * @param {boolean} progressive Whether this is a progressive or a static encoder
       * @param {Object.<string,*>=} options Options
       * @constructor
       */

      var Encoder = function (dict, progressive, options) {
        /**
         * Dictionary hash.
         * @type {Object.<string,number>}
         */
        this.dict = {};
        /**
         * Next dictionary index.
         * @type {number}
         */

        this.next = 0;

        if (dict && Array.isArray(dict)) {
          while (this.next < dict.length) {
            this.dict[dict[this.next]] = this.next++;
          }
        }
        /**
         * Whether the encoder is progressive or static.
         * @type {boolean}
         */


        this.progressive = !!progressive;
        /**
         * Options.
         * @type {Object.<string,*>}
         */

        this.options = options || {};
      };
      /**
       * Encodes JSON to PSON.
       * @param {*} json JSON
       * @param {(!ByteBuffer)=} buf Buffer to encode to. When omitted, the resulting ByteBuffer will be flipped. When
       *  specified, it will not be flipped.
       * @returns {!ByteBuffer} PSON
       */


      Encoder.prototype.encode = function (json, buf) {
        var doFlip = false;

        if (!buf) {
          buf = new ByteBuffer();
          doFlip = true;
        }

        var le = buf.littleEndian;

        try {
          this._encodeValue(json, buf.LE());

          buf.littleEndian = le;
          return doFlip ? buf.flip() : buf;
        } catch (e) {
          buf.littleEndian = le;
          throw e;
        }
      };
      /**
       * Encodes a single JSON value to PSON.
       * @param {*} val JSON value
       * @param {!ByteBuffer} buf Target buffer
       * @param {boolean=} excluded Whether keywords are to be excluded or not
       * @private
       */


      Encoder.prototype._encodeValue = function (val, buf, excluded) {
        if (val === null) {
          buf.writeUint8(T.NULL);
        } else {
          switch (typeof val) {
            case 'function':
              val = val.toString();
            // fall through

            case 'string':
              if (val.length === 0) {
                buf.writeUint8(T.ESTRING);
              } else {
                if (this.dict.hasOwnProperty(val)) {
                  buf.writeUint8(T.STRING_GET);
                  buf.writeVarint32(this.dict[val]);
                } else {
                  buf.writeUint8(T.STRING);
                  buf.writeVString(val);
                }
              }

              break;

            case 'number':
              var intVal = parseInt(val);

              if (val === intVal) {
                var zzval = ByteBuffer.zigZagEncode32(val); // unsigned

                if (zzval <= T.MAX) {
                  buf.writeUint8(zzval);
                } else {
                  buf.writeUint8(T.INTEGER);
                  buf.writeVarint32ZigZag(val);
                }
              } else {
                fbuf.writeFloat32(val, 0);

                if (val === fbuf.readFloat32(0)) {
                  buf.writeUint8(T.FLOAT);
                  buf.writeFloat32(val);
                } else {
                  buf.writeUint8(T.DOUBLE);
                  buf.writeFloat64(val);
                }
              }

              break;

            case 'boolean':
              buf.writeUint8(val ? T.TRUE : T.FALSE);
              break;

            case 'object':
              var i;

              if (Array.isArray(val)) {
                if (val.length === 0) {
                  buf.writeUint8(T.EARRAY);
                } else {
                  buf.writeUint8(T.ARRAY);
                  buf.writeVarint32(val.length);

                  for (i = 0; i < val.length; i++) {
                    this._encodeValue(val[i], buf);
                  }
                }
              } else if (Long && val instanceof Long) {
                buf.writeUint8(T.LONG);
                buf.writeVarint64ZigZag(val);
              } else {
                try {
                  val = ByteBuffer.wrap(val);
                  buf.writeUint8(T.BINARY);
                  buf.writeVarint32(val.remaining());
                  buf.append(val);
                } catch (e) {
                  var keys = Object.keys(val);
                  var n = 0;

                  for (i = 0; i < keys.length; i++) {
                    if (typeof val[keys[i]] !== 'undefined') n++;
                  }

                  if (n === 0) {
                    buf.writeUint8(T.EOBJECT);
                  } else {
                    buf.writeUint8(T.OBJECT);
                    buf.writeVarint32(n);
                    if (!excluded) excluded = !!val._PSON_EXCL_;

                    for (i = 0; i < keys.length; i++) {
                      var key = keys[i];
                      if (typeof val[key] === 'undefined') continue;

                      if (this.dict.hasOwnProperty(key)) {
                        buf.writeUint8(T.STRING_GET);
                        buf.writeVarint32(this.dict[key]);
                      } else {
                        if (this.progressive && !excluded) {
                          // Add to dictionary
                          this.dict[key] = this.next++;
                          buf.writeUint8(T.STRING_ADD);
                        } else {
                          // Plain string
                          buf.writeUint8(T.STRING);
                        }

                        buf.writeVString(key);
                      }

                      this._encodeValue(val[key], buf);
                    }
                  }
                }
              }

              break;

            case 'undefined':
              buf.writeUint8(T.NULL);
              break;
          }
        }
      };

      return Encoder;
    }(ByteBuffer, PSON.T);
    /**
     * @alias PSON.Decoder
     */


    PSON.Decoder = function (ByteBuffer, T) {
      /**
       * Long.js.
       * @type {?Long}
       */
      var Long = ByteBuffer.Long;
      /**
       * Constructs a new PSON Decoder.
       * @exports PSON.Decoder
       * @class A PSON Decoder.
       * @param {Array.<string>} dict Initial dictionary values
       * @param {boolean} progressive Whether this is a progressive or a static decoder
       * @param {Object.<string,*>=} options Options
       * @constructor
       */

      var Decoder = function (dict, progressive, options) {
        /**
         * Dictionary array.
         * @type {Array.<string>}
         */
        this.dict = dict && Array.isArray(dict) ? dict : [];
        /**
         * Whether this is a progressive or a static decoder.
         * @type {boolean}
         */

        this.progressive = !!progressive;
        /**
         * Options.
         * @type {Object.<string,*>}
         */

        this.options = options || {};
      };
      /**
       * Decodes PSON to JSON.
       * @param {!(ByteBuffer|ArrayBuffer|Buffer)} buf PSON
       * @returns {?} JSON
       */


      Decoder.prototype.decode = function (buf) {
        if (!(buf instanceof ByteBuffer)) {
          buf = ByteBuffer.wrap(buf);
        }

        var le = buf.littleEndian;

        try {
          var val = this._decodeValue(buf.LE());

          buf.littleEndian = le;
          return val;
        } catch (e) {
          buf.littleEndian = le;
          throw e;
        }
      };
      /**
       * Decodes a single PSON value to JSON.
       * @param {!ByteBuffer} buf Buffer to decode from
       * @returns {?} JSON
       * @private
       */


      Decoder.prototype._decodeValue = function (buf) {
        var t = buf.readUint8();

        if (t <= T.MAX) {
          return ByteBuffer.zigZagDecode32(t);
        } else {
          switch (t) {
            case T.NULL:
              return null;

            case T.TRUE:
              return true;

            case T.FALSE:
              return false;

            case T.EOBJECT:
              return {};

            case T.EARRAY:
              return [];

            case T.ESTRING:
              return "";

            case T.OBJECT:
              t = buf.readVarint32(); // #keys

              var obj = {};

              while (--t >= 0) {
                obj[this._decodeValue(buf)] = this._decodeValue(buf);
              }

              return obj;

            case T.ARRAY:
              t = buf.readVarint32(); // #items

              var arr = [];

              while (--t >= 0) {
                arr.push(this._decodeValue(buf));
              }

              return arr;

            case T.INTEGER:
              return buf.readVarint32ZigZag();

            case T.LONG:
              // must not crash
              if (Long) return buf.readVarint64ZigZag();
              return buf.readVarint32ZigZag();

            case T.FLOAT:
              return buf.readFloat32();

            case T.DOUBLE:
              return buf.readFloat64();

            case T.STRING:
              return buf.readVString();

            case T.STRING_ADD:
              var str = buf.readVString();
              this.dict.push(str);
              return str;

            case T.STRING_GET:
              return this.dict[buf.readVarint32()];

            case T.BINARY:
              t = buf.readVarint32();
              var ret = buf.slice(buf.offset, buf.offset + t);
              buf.offset += t;
              return ret;

            default:
              throw new Error("Illegal type at " + buf.offset + ": " + t);
          }
        }
      };

      return Decoder;
    }(ByteBuffer, PSON.T);
    /**
     * @alias PSON.Pair
     */


    PSON.Pair = function () {
      /**
       * Constructs a new abstract PSON encoder and decoder pair.
       * @exports PSON.Pair
       * @class An abstract PSON encoder and decoder pair.
       * @constructor
       * @abstract
       */
      var Pair = function () {
        /**
         * Encoder.
         * @type {!PSON.Encoder}
         * @expose
         */
        this.encoder;
        /**
         * Decoder.
         * @type {!PSON.Decoder}
         * @expose
         */

        this.decoder;
      };
      /**
       * Encodes JSON to PSON.
       * @param {*} json JSON
       * @returns {!ByteBuffer} PSON
       * @expose
       */


      Pair.prototype.encode = function (json) {
        return this.encoder.encode(json);
      };
      /**
       * Encodes JSON straight to an ArrayBuffer of PSON.
       * @param {*} json JSON
       * @returns {!ArrayBuffer} PSON as ArrayBuffer
       * @expose
       */


      Pair.prototype.toArrayBuffer = function (json) {
        return this.encoder.encode(json).toArrayBuffer();
      };
      /**
       * Encodes JSON straight to a node Buffer of PSON.
       * @param {*} json JSON
       * @returns {!Buffer} PSON as node Buffer
       * @expose
       */


      Pair.prototype.toBuffer = function (json) {
        return this.encoder.encode(json).toBuffer();
      };
      /**
       * Decodes PSON to JSON.
       * @param {ByteBuffer|ArrayBuffer|Buffer} pson PSON
       * @returns {*} JSON
       * @expose
       */


      Pair.prototype.decode = function (pson) {
        return this.decoder.decode(pson);
      };

      return Pair;
    }();
    /**
     * @alias PSON.StaticPair
     */


    PSON.StaticPair = function (Pair, Encoder, Decoder) {
      /**
       * Constructs a new static PSON encoder and decoder pair.
       * @exports PSON.StaticPair
       * @class A static PSON encoder and decoder pair.
       * @param {Array.<string>=} dict Static dictionary
       * @param {Object.<string,*>=} options Options
       * @constructor
       * @extends PSON.Pair
       */
      var StaticPair = function (dict, options) {
        Pair.call(this);
        this.encoder = new Encoder(dict, false, options);
        this.decoder = new Decoder(dict, false, options);
      }; // Extends PSON.Pair


      StaticPair.prototype = Object.create(Pair.prototype);
      return StaticPair;
    }(PSON.Pair, PSON.Encoder, PSON.Decoder);
    /**
     * @alias PSON.ProgressivePair
     */


    PSON.ProgressivePair = function (Pair, Encoder, Decoder) {
      /**
       * Constructs a new progressive PSON encoder and decoder pair.
       * @exports PSON.ProgressivePair
       * @class A progressive PSON encoder and decoder pair.
       * @param {Array.<string>=} dict Initial dictionary
       * @param {Object.<string,*>=} options Options
       * @constructor
       * @extends PSON.Pair
       */
      var ProgressivePair = function (dict, options) {
        Pair.call(this);
        this.encoder = new Encoder(dict, true, options);
        this.decoder = new Decoder(dict, true, options);
      }; // Extends PSON.Pair


      ProgressivePair.prototype = Object.create(Pair.prototype);
      /**
       * Alias for {@link PSON.exclude}.
       * @param {Object} obj Now excluded object
       */

      ProgressivePair.prototype.exclude = function (obj) {
        PSON.exclude(obj);
      };
      /**
       * Alias for {@link PSON.include}.
       * @param {Object} obj New included object
       */


      ProgressivePair.prototype.include = function (obj) {
        PSON.include(obj);
      };

      return ProgressivePair;
    }(PSON.Pair, PSON.Encoder, PSON.Decoder);
    /**
     * Excluces an object's and its children's keys from being added to a progressive dictionary.
     * @param {Object} obj Now excluded object
     */


    PSON.exclude = function (obj) {
      if (typeof obj === 'object') {
        Object.defineProperty(obj, "_PSON_EXCL_", {
          value: true,
          enumerable: false,
          configurable: true
        });
      }
    };
    /**
     * Undoes exclusion of an object's and its children's keys from being added to a progressive dictionary.
     * @param {Object} obj Now included object
     */


    PSON.include = function (obj) {
      if (typeof obj === 'object') {
        delete obj["_PSON_EXCL_"];
      }
    };

    return PSON;
  } // Enable module loading if available


  if ( true && module["exports"]) {
    // CommonJS
    module["exports"] = loadPSON(__webpack_require__(/*! bytebuffer */ "./node_modules/bytebuffer/dist/ByteBufferAB.js"));
  } else if (true) {
    // AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! ByteBuffer */ "./node_modules/ByteBuffer/dist/ByteBufferAB.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (loadPSON),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(this);

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (module) {
  if (!module.webpackPolyfill) {
    module.deprecate = function () {};

    module.paths = []; // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function () {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function () {
        return module.i;
      }
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ }),

/***/ "./src/physics.js":
/*!************************!*\
  !*** ./src/physics.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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
const MINE_LIFETIME = 120;
const INERTIA_MUL = 1; // (MIN_SHIP_VELOCITY / MAX_SHIP_VELOCITY) ** (1 / (TICKS_PER_SECOND * 90))

const LCG = __webpack_require__(/*! ./utils/lcg */ "./src/utils/lcg.js");

const PLANET_CHUNK_SIZE = VIEW_DISTANCE * 1.6 + 1;
const lcg = new LCG(0);
let PLANET_SEED = 1340985553;

const getAccelMul = accelTimeMs => {
  // time in milliseconds
  return 0.075 + 0.0000375 * accelTimeMs;
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
/*! no static exports found */
/***/ (function(module, exports) {

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

/***/ "./src/utils/psondict.js":
/*!*******************************!*\
  !*** ./src/utils/psondict.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ['cmd', 'token', 'you', 'ships', 'projs', 'count', 'rubber', 'angle', 'accel', 'brake', 'firing', 'board', 'ship', 'proj', 'seed', 'time', 'despawn', 'type', // bullet
'posX', 'posY', 'velX', 'velY', 'dist', 'shooter', 'shooterName', 'isHit', 'canPickUp', 'dead', '_id', // ship
'health', 'name', 'score', 'latched', 'fireWaitTicks', 'firingInterval', 'bulletSpeedMul', 'speedMul', 'healthMul', 'planetDamageMul', 'highAgility', 'absorber', 'healRate', 'rubbership', 'regen', 'overdrive'];

/***/ }),

/***/ "./src/utils/serial.js":
/*!*****************************!*\
  !*** ./src/utils/serial.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const ByteBuffer = __webpack_require__(/*! bytebuffer */ "./node_modules/bytebuffer/dist/ByteBufferAB.js");

module.exports = PSON => {
  const pson = new PSON.StaticPair(__webpack_require__(/*! ./psondict */ "./src/utils/psondict.js"));

  const encode = data => pson.encode(data);

  const decode = data => pson.decode(data);

  const recv = data => ByteBuffer.fromBinary(data);

  const send = (ws, data) => ws.send(data.toBinary());

  const e_token = token => encode({
    cmd: 'token',
    token: token
  });

  const e_data = (ship, nearbyShips, addBullets, playerCount, rubberRadius, planetSeed) => encode({
    cmd: 'data',
    you: ship,
    ships: nearbyShips,
    projs: addBullets,
    count: playerCount,
    rubber: rubberRadius,
    seed: planetSeed
  });

  const e_unauth = () => encode({
    cmd: 'unauth'
  });

  const e_board = b => encode({
    cmd: 'board',
    board: b
  });

  const e_killship = ship => encode({
    cmd: 'killship',
    ship: ship._id
  });

  const e_killproj = proj => encode({
    cmd: 'killproj',
    proj: proj._id
  });

  const e_crashed = name => encode({
    cmd: 'crashed',
    ship: name
  });

  const e_killed = name => encode({
    cmd: 'killed',
    ship: name
  });

  const e_orient = orient => encode({
    cmd: 'orient',
    orient: orient
  });

  const e_hitpl = () => encode({
    cmd: 'hitpl'
  });

  const e_join = (nick, perk) => encode({
    cmd: 'join',
    nick: nick,
    perk: perk
  });

  const e_ping = time => encode({
    cmd: 'ping',
    time: time
  });

  const e_pong = time => encode({
    cmd: 'pong',
    time: time
  });

  const e_quit = token => encode({
    cmd: 'quit',
    token: token
  });

  const e_ctrl = (token, orient, accel, brake, firing) => encode({
    cmd: 'ctrl',
    token: token,
    angle: orient,
    accel: accel,
    brake: brake,
    firing: firing
  });

  const e_addpup = powerup => encode({
    cmd: 'addpup',
    powerup: powerup
  });

  const e_delpup = powerup => encode({
    cmd: 'delpup',
    powerup: powerup
  });

  const e_useitem = token => encode({
    cmd: 'useitem',
    token: token
  });

  const e_minexpl = mine => encode({
    cmd: 'minexpl',
    proj: mine
  });

  const is_ctrl = obj => obj.cmd === 'ctrl';

  const is_join = obj => obj.cmd === 'join';

  const is_ping = obj => obj.cmd === 'ping';

  const is_pong = obj => obj.cmd === 'pong';

  const is_quit = obj => obj.cmd === 'quit';

  const is_token = obj => obj.cmd === 'token';

  const is_data = obj => obj.cmd === 'data';

  const is_board = obj => obj.cmd === 'board';

  const is_killship = obj => obj.cmd === 'killship';

  const is_killproj = obj => obj.cmd === 'killproj';

  const is_crashed = obj => obj.cmd == 'crashed';

  const is_killed = obj => obj.cmd == 'killed';

  const is_hitpl = obj => obj.cmd == 'hitpl';

  const is_orient = obj => obj.cmd == 'orient';

  const is_unauth = obj => obj.cmd == 'unauth';

  const is_addpup = obj => obj.cmd == 'addpup';

  const is_delpup = obj => obj.cmd == 'delpup';

  const is_useitem = obj => obj.cmd == 'useitem';

  const is_minexpl = obj => obj.cmd == 'minexpl';

  return {
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
    is_minexpl
  };
};

/***/ })

/******/ });
//# sourceMappingURL=main.bundle.js.map