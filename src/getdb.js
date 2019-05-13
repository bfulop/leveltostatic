import Task from 'folktale/concurrency/task/index.js'
const { of }= Task
import levelup from 'levelup'
import encode from 'encoding-down'
import leveldown from 'leveldown'
import getConfig from './readconfig.js'

function logger(r) {
  console.log('getdb.js:')
  console.log(r)
  return r
}

var db = null
export default function readDb() {
  if (db) {
    return of(db)
  } else {
    return getConfig('quiverdb').map(function openDB(r) {
      db = levelup(encode(leveldown(r), { valueEncoding: 'json' }))
      return db
    })
  }
}
