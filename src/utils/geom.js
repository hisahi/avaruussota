const EPSILON = 1e-10

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

const handleZeroEpsilon = (x) => {
  return Math.abs(x) < EPSILON ? 0 : x
}

const pointOrientation = (p, q, r) => {
  return Math.sign(handleZeroEpsilon(
    (q[1] - p[1]) * (r[0] - q[0])
    - (q[0] - p[0]) * (r[1] - q[1])))
}

const onCollinearSegment = (p, q, r) => {
  return (q[0] <= Math.max(p[0], r[0])) && (q[0] >= Math.min(p[0], r[0]))
    && (q[1] <= Math.max(p[1], r[1])) && (q[1] >= Math.min(p[1], r[1]))
}

const lineIntersectsLine = (a1, a2, b1, b2) => {
  const o1 = pointOrientation(a1, b1, a2)
  const o2 = pointOrientation(a1, b1, b2)
  const o3 = pointOrientation(a2, b2, a1)
  const o4 = pointOrientation(a2, b2, b1)

  if (o1 !== o2 && o3 !== o4) {
    return true
  }

  return (o1 == 0 && onCollinearSegment(a1, a2, b1))
    || (o2 == 0 && onCollinearSegment(a1, b2, b1))
    || (o3 == 0 && onCollinearSegment(a2, a1, b2))
    || (o4 == 0 && onCollinearSegment(a2, b1, b2))
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

const lineIntersectsTriangle = (l1, l2, t1, t2, t3) => {
  return lineIntersectsLine(l1, l2, t1, t2)
    || lineIntersectsLine(l1, l2, t2, t3)
    || lineIntersectsLine(l1, l2, t3, t1)
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
    rotatePoint(s, c,  0   , -1   ),
    rotatePoint(s, c, +1   , +1.5 ),
    rotatePoint(s, c,  0   , +1   ),
    rotatePoint(s, c, -1   , +1.5 )
  ]
}

const getOffsetShipPoints = (ship, x, y) => {
  if (!ship) {
    return []
  }

  const points = getShipPoints(ship)
  return [
    [points[0][0] + x, points[0][1] + y],
    [points[1][0] + x, points[1][1] + y],
    [points[2][0] + x, points[2][1] + y],
    [points[3][0] + x, points[3][1] + y]
  ]
}

const getRealShipPoints = (ship) => {
  return getOffsetShipPoints(ship, ship.posX, ship.posY)
}

const getCollisionPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)
  
  return [
    rotatePointOffset(s, c,  0   , 0    , ship.posX, ship.posY),
    rotatePointOffset(s, c, +0.83, +1.25, ship.posX, ship.posY),
    rotatePointOffset(s, c, -0.83, +1.25, ship.posX, ship.posY)
  ]
}

const getThrusterPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePoint(s, c,  0   , +1   ),
    rotatePoint(s, c, +0.5 , +1.25),
    rotatePoint(s, c,  0   , +2.5 ),
    rotatePoint(s, c, -0.5 , +1.25),
    rotatePoint(s, c,  0   , +1.75),
  ]
}

module.exports = { 
  pointInTriangle,
  lineIntersectsLine,
  closestSynchroDistance,
  lineIntersectsTriangle,
  wrapRadianAngle,
  getPlanetAngleMultiplier,
  getShipPoints,
  getOffsetShipPoints,
  getRealShipPoints,
  getCollisionPoints,
  getThrusterPoints }
