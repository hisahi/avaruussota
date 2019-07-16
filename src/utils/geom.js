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

const wrapRadianAngle = (angle) => {
  return (angle + Math.PI) % (2 * Math.PI) - Math.PI
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
    rotatePoint(s, c,  0   , +1   ),
    rotatePoint(s, c, +1   , +1.5 ),
    rotatePoint(s, c,  0   , -1   ),
    rotatePoint(s, c, -1   , +1.5 )
  ]
}

const getRealShipPoints = (ship) => {
  if (!ship) {
    return []
  }

  const points = getShipPoints(ship)
  return [
    [points[0][0] + ship.posX, points[0][1] + ship.posY],
    [points[1][0] + ship.posX, points[1][1] + ship.posY],
    [points[2][0] + ship.posX, points[2][1] + ship.posY],
    [points[3][0] + ship.posX, points[3][1] + ship.posY]
  ]
}

const getCollisionPoints = (ship) => {
  if (!ship) {
    return []
  }

  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)
  
  return [
    rotatePointOffset(s, c,  0   , 0    , ship.posX, ship.posY),
    rotatePointOffset(s, c, +0.5 , +0.75, ship.posX, ship.posY),
    rotatePointOffset(s, c, -0.5 , +0.75, ship.posX, ship.posY)
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
  wrapRadianAngle, 
  getShipPoints, 
  getRealShipPoints, 
  getCollisionPoints,
  getThrusterPoints }
