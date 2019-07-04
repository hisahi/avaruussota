const Datastore = require('nedb-async-await').Datastore
const Counter = require('../utils/counter')
const thenify = require('thenify')
const db = Datastore()
const bulletid = new Counter()

const template = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0,                    // distance taken
  shooter: null,

  dead: false
})

const create = async (ship, data) => {
  let doc = template()
  doc._id = bulletid.next()
  doc.shooter = ship._id
  doc = {...doc, ...data}
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

const makePublic = (bullet) => {
  const newBullet = { ...bullet }
  delete newBullet.dist
  delete newBullet.dead
  return newBullet
}

module.exports = { create, getOne, getAll, put, remove, makePublic }
