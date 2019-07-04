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

const getShipPoints = (ship) => {
  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePoint(s, c,  0   , +1   ),
    rotatePoint(s, c, +1   , +1.5 ),
    rotatePoint(s, c,  0   , -1   ),
    rotatePoint(s, c, -1   , +1.5 )
  ]
  /*
  return [
    [      s,           c    ], // (0, 1)
    [1.5 * s + c, 1.5 * c - s], // (1, -1.5)
    [     -s,          -c    ], // (0, -1)
    [1.5 * s - c, 1.5 * c + s]] // (-1, 1.5)
    */
}

const getThrusterPoints = (ship) => {
  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)

  return [
    rotatePoint(s, c,  0   , +1   ),
    rotatePoint(s, c, +0.5 , +1.25),
    rotatePoint(s, c,  0   , +2.5 ),
    rotatePoint(s, c, -0.5 , +1.25),
    rotatePoint(s, c,  0   , +1.75),
  ]
  /*
  return [
    [       -s          ,        -c          ], // (0, -1)
    [-1.25 * s + 0.5 * c, -1.25 * c - 0.5 * s], // (0.5, -1.25)
    [   -2 * s          ,    -2 * c          ], // (0, -2)
    [-1.25 * s - 0.5 * c, -1.25 * c + 0.5 * s], // (0.5, -1.25)
    [-1.75 * s          , -1.75 * c          ]] // (0, -1.75)
    */
}

module.exports = { 
  pointInTriangle, 
  wrapRadianAngle, 
  getShipPoints, 
  getThrusterPoints }
