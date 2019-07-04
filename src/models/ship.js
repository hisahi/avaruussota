const Datastore = require('nedb-async-await').Datastore
const Counter = require('../utils/counter')
const thenify = require('thenify')
const db = Datastore()
const shipid = new Counter()

const template = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  orient: 0,                  // radians, clockwise from 0 = up

  accel: null,
  brake: null,
  lastFired: 0,
  dead: false
})

const create = async () => {
  const doc = template()
  doc._id = shipid.next()
  return await db.insert(doc)
}

const getOne = async (model) => {
  return await db.findOne(model)
}

const getAll = async (model) => {
  return await db.find(model)
}

const put = async (doc) => {
  return await db.update({ _id: doc._id }, doc)
}

const remove = async (model) => {
  return await db.remove(model)
}

const makePublic = (ship) => {
  const newShip = { ...ship }
  delete newShip.lastFired
  delete newShip.dead
  return newShip
}

module.exports = { create, getOne, getAll, put, remove, makePublic }
