const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')
const { of } = require('folktale/concurrency/task')
const getConfig = require('./readconfig')

function logger(r) {
  console.log('getdb.js:')
  console.log(r)
  return r
}

var db = null
function readDb() {
  if (db) {
    return of(db)
  } else {
    return getConfig('quiverdb').map(function openDB(r) {
      db = levelup(encode(leveldown(r), { valueEncoding: 'json' }))
      return db
    })
  }
}

const getDb = readDb

module.exports = getDb
