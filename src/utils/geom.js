const maths = require('../utils/maths')

const SHIP_SCALE = 1.1

const lerp1D = (a, t, b) => a + t * (b - a)
const unlerp1D = (a, v, b) => (v - a) / (b - a)

const lerp2D = (a, t, b) => {
  return [lerp1D(a[0], t, b[0]), lerp1D(a[1], t, b[1])]
}

const normalize = (x, y, m) => {
  const d = Math.hypot(x, y)
  m = m || 1
  return [m * x / d, m * y / d]
}

const pointInTriangle = (p1, p2, p3, p) => {
  const [x1, y1] = p1
  const [x2, y2] = p2
  const [x3, y3] = p3
  const [xp, yp] = p

  const c1 = ((y2 - y3) * (xp - x3) + (x3 - x2) * (yp - y3)) 
           / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3))
  const c2 = ((y3 - y1) * (xp - x3) + (x1 - x3) * (yp - y3)) 
           / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3))
  const c3 = 1 - c1 - c2
  return c1 > 0 && c2 > 0 && c3 > 0
}

const testTriangleCollisionSub = (a1, a2, a3, b1, b2, b3) => {
  const dax = a1[0] - b3[0], day = a1[1] - b3[1]
  const dbx = a2[0] - b3[0], dby = a2[1] - b3[1]
  const dcx = a3[0] - b3[0], dcy = a3[1] - b3[1]
  const b32x = b3[0] - b2[0]
  const b23y = b2[1] - b3[1]
  const D = b23y * (b1[0] - b3[0]) + b32x * (b1[1] - b3[1])
  const sa = b23y * dax + b32x * day
  const sb = b23y * dbx + b32x * dby
  const sc = b23y * dcx + b32x * dcy
  const ta = (b3[1] - b1[1]) * dax + (b1[0] - b3[0]) * day
  const tb = (b3[1] - b1[1]) * dbx + (b1[0] - b3[0]) * dby
  const tc = (b3[1] - b1[1]) * dcx + (b1[0] - b3[0]) * dcy
  if (D < 0) return ((sa >= 0 && sb >= 0 && sc >= 0) ||
                     (ta >= 0 && tb >= 0 && tc >= 0) ||
                     (sa + ta <= D && sb + tb <= D && sc + tc <= D))
  return ((sa <= 0 && sb <= 0 && sc <= 0) ||
          (ta <= 0 && tb <= 0 && tc <= 0) ||
          (sa + ta >= D && sb + tb >= D && sc + tc >= D))
}

const testTriangleCollision = (a1, a2, a3, b1, b2, b3) => {
  return !(testTriangleCollisionSub(a1, a2, a3, b1, b2, b3)
        || testTriangleCollisionSub(b1, b2, b3, a1, a2, a3))
}

const getDirectionSign = (a, b) => {
  let s = Math.sign(b[0] - a[0])
  if (s == 0) {
    s = Math.sign(b[1] - a[1])
  }
  return s
}

const collinearLinesIntersect = (a1, a2, b1, b2) => {
  let a = 0
  let b = ((a2[0] - a1[0]) * (a2[0] - a1[0]) 
    + (a2[1] - a1[1]) * (a2[1] - a1[1])) * getDirectionSign(a2, a1)
  let c = ((b1[0] - a1[0]) * (b1[0] - a1[0]) 
    + (b1[1] - a1[1]) * (b1[1] - a1[1])) * getDirectionSign(b1, a1)
  let d = ((b2[0] - a1[0]) * (b2[0] - a1[0]) 
    + (b2[1] - a1[1]) * (b2[1] - a1[1])) * getDirectionSign(b2, a1)
  
  if (a >= b) [a, b] = [b, a]
  if (c >= d) [c, d] = [d, c]
  
  return b >= c && d >= a
}

const lineIntersectsLine = (a1, a2, b1, b2) => {
  const d = 1 / 
    (((a2[0] - a1[0]) * (b2[1] - b1[1])) 
    - ((a2[1] - a1[1]) * (b2[0] - b1[0])))
  if (!isFinite(d)) { // collinear
    return collinearLinesIntersect(a1, a2, b1, b2)
  }

  const n = d * 
    (((a1[1] - b1[1]) * (b2[0] - b1[0])) 
    - ((a1[0] - b1[0]) * (b2[1] - b1[1])))
  const m = d * 
    (((a1[1] - b1[1]) * (a2[0] - a1[0])) 
    - ((a1[0] - b1[0]) * (a2[1] - a1[1])))

  return 0 <= n && n <= 1 && 0 <= m && m <= 1
}

const lineIntersectsTriangle = (l1, l2, t1, t2, t3) => {
  return lineIntersectsLine(l1, l2, t1, t2)
    || lineIntersectsLine(l1, l2, t2, t3)
    || lineIntersectsLine(l1, l2, t3, t1)
}

const lineIntersectCircleFirstDepth = (a1, a2, x, y, radius) => {
  for (let i = 0; i <= 8; ++i) {
    const s = i / 8
    if (Math.hypot(a1[0] + s * a2[0] - x, a1[1] + s * a2[1] - y) < radius) {
      return s
    }
  }
  return Number.NaN
}

const lineClosestPointToPoint = (a1, a2, b1, b2, p1, p2) => {
  const v1 = b1 - a1
  const v2 = b2 - a2
  const u1 = a1 - p1
  const u2 = a2 - p2
  const vu = v1 * u1 + v2 * u2
  const vv = v1 * v1 + v2 * v2
  if (vv === 0) return [a1, a2]
  let t = -vu / vv
  if (t < 0) t = 0
  if (t > 1) t = 1
  return lerp2D([a1, a2], t, [b1, b2])
}

const closestSynchroDistance = (a1, a2, b1, b2) => {
  const A = a1[0] - b1[0]
  const B = (a2[0] - a1[0]) - (b2[0] - b1[0])
  const C = a1[1] - b1[1]
  const D = (a2[1] - a1[1]) - (b2[1] - b1[1])
  if (B == 0 && D == 0) {
    return 0
  }
  return -(A * B + C * D) / (B * B + D * D)
}

const wrapRadianAngle = (angle) => {
  return (angle + Math.PI) % (2 * Math.PI) - Math.PI
}

const getPlanetDamageMultiplier = (ox, oy, px, py) => {
  [ox, oy] = normalize(ox, oy);
  [px, py] = normalize(px, py)
  return maths.padFromBelow(0.5, (1 - (ox * px + oy * py)) * 0.5)
}

const getPlanetDamageSpeedMultiplier = (vx, vy, px, py) => {
  if (!(vx || vy)) return 0;
  [vx, vy] = normalize(vx, vy);
  [px, py] = normalize(px, py)
  return maths.padFromBelow(0.5, Math.abs(vx * px + vy * py))
}

const withinBoundingSquare = (x, y, center, d) => {
  return Math.min(Math.abs(x - center), Math.abs(y - center)) <= d
}

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c]

const rotatePointOffset = (s, c, x, y, xo, yo) => 
  [xo + x * c - y * s, yo + x * s + y * c]

const getShipPoints = (ship) => {
  const S = SHIP_SCALE
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePointOffset(s, c,  0   *S, +2   *S, ship.posX, ship.posY),
    rotatePointOffset(s, c, +1.5 *S, -2   *S, ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   *S, -1.25*S, ship.posX, ship.posY),
    rotatePointOffset(s, c, -1.5 *S, -2   *S, ship.posX, ship.posY)
  ]
}

const getCollisionPoints = (ship) => {
  const S = SHIP_SCALE
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)
  
  return [
    rotatePointOffset(s, c,  0   *S, +2.6*S, ship.posX, ship.posY),
    rotatePointOffset(s, c, +1.87*S, -2.6*S, ship.posX, ship.posY),
    rotatePointOffset(s, c, -1.87*S, -2.6*S, ship.posX, ship.posY)
  ]
}

const getThrusterPoints = (ship) => {
  const S = SHIP_SCALE
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePointOffset(s, c,  0   *S, -1.25*S, ship.posX, ship.posY),
    rotatePointOffset(s, c, +0.75*S, -1.75*S, ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   *S, -3.75*S, ship.posX, ship.posY),
    rotatePointOffset(s, c, -0.75*S, -1.75*S, ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   *S, -2.75*S, ship.posX, ship.posY),
  ]
}

module.exports = {
  lerp1D,
  lerp2D,
  unlerp1D,
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
  getThrusterPoints }
