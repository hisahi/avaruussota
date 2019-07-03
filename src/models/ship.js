const Datastore = require('nedb')
const Counter = require('../utils/counter')
const thenify = require('thenify')
const db = new Datastore()
const shipid = new Counter()

const template = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  orient: 0,                  // radians, clockwise from 0 = up

  lastFired: 0
})

const asyncFind = thenify(db.find)
const asyncFindOne = thenify(db.findOne)
const asyncInsert = thenify(db.insert)
const asyncUpdate = thenify(db.update)
const asyncRemove = thenify(db.remove)

const create = async () => {
  const doc = template()
  doc._id = shipid.next()
  return await asyncInsert(doc)
}

const getOne = async (model) => {
  return await asyncFindOne(model)
}

const getAll = async (model) => {
  return await asyncFind(model)
}

const put = async (doc) => {
  return await asyncUpdate({ _id: doc._id }, doc)
}

const remove = async (model) => {
  return await asyncRemove(model)
}

const makePublic = async (ship) => {
  const newShip = { ...ship }
  delete newShip.lastFired
  return newShip
}

const points = async (ship) => {
  const s = Math.sin(ship.orient)
  const c = Math.cos(ship.orient)
  
  return [
    [      s,           c    ], // (0, 1)
    [1.5 * s + c, 1.5 * c - s], // (1, -1.5)
    [     -s,          -c    ], // (0, -1)
    [1.5 * s - c, 1.5 * c + s]] // (-1, 1.5)
}

module.exports = { create, getOne, getAll, put, remove, makePublic, points }
