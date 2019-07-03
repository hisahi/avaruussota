const Datastore = require('nedb')
const Counter = require('../utils/counter')
const thenify = require('thenify')
const db = new Datastore()
const bulletid = new Counter()

const template = () => ({
  posX: 0, posY: 0,           // position X, Y
  velX: 0, velY: 0,           // velocity X, Y
  dist: 0                     // distance taken
})

const asyncFind = thenify(db.find)
const asyncFindOne = thenify(db.findOne)
const asyncInsert = thenify(db.insert)
const asyncUpdate = thenify(db.update)
const asyncRemove = thenify(db.remove)

const create = async () => {
  const doc = template()
  doc['_id'] = bulletid.next()
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

const makePublic = async (bullet) => {
  const newBullet = { ...bullet }
  delete newBullet.dist
  return newBullet
}

module.exports = { create, getOne, getAll, put, remove, makePublic }
