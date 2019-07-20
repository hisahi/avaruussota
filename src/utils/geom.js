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

const getPlanetAngleMultiplier = (orient, vel) => {
  let diff = Math.abs((orient - vel + Math.PI) % (2 * Math.PI))
  if (Math.abs(diff) > Math.PI) {
    diff = (2 * Math.PI) - Math.PI
  }
  const sc = diff / Math.PI
  return 1 + sc
}

const withinBoundingSquare = (x, y, center, d) => {
  return Math.min(Math.abs(x - center), Math.abs(y - center)) <= d
}

const rotatePoint = (s, c, x, y) => [x * c - y * s, x * s + y * c]

const rotatePointOffset = (s, c, x, y, xo, yo) => 
  [xo + x * c - y * s, yo + x * s + y * c]

const getShipPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePointOffset(s, c,  0   , +2   , ship.posX, ship.posY),
    rotatePointOffset(s, c, +1.5 , -2   , ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   , -1.25, ship.posX, ship.posY),
    rotatePointOffset(s, c, -1.5 , -2   , ship.posX, ship.posY)
  ]
}

const getCollisionPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)
  
  return [
    rotatePointOffset(s, c,  0   , +2.6, ship.posX, ship.posY),
    rotatePointOffset(s, c, +1.87, -2.6, ship.posX, ship.posY),
    rotatePointOffset(s, c, -1.87, -2.6, ship.posX, ship.posY)
  ]
}

const getThrusterPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePointOffset(s, c,  0   , -1.25, ship.posX, ship.posY),
    rotatePointOffset(s, c, +0.75, -1.75, ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   , -3.75, ship.posX, ship.posY),
    rotatePointOffset(s, c, -0.75, -1.75, ship.posX, ship.posY),
    rotatePointOffset(s, c,  0   , -2.75, ship.posX, ship.posY),
  ]
}

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
  getThrusterPoints }
