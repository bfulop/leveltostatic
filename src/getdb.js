const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')
const { readFile } = require('./utils/fileUtils')
const { task, of } = require('folktale/concurrency/task')

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
    return readFile('./config.json')
      .map(JSON.parse)
      .map(function openDB(r) {
        db = levelup(encode(leveldown(r.quiverdb), { valueEncoding: 'json' }))
        return db
      })
  }
}

const getDb = readDb

module.exports = getDb
