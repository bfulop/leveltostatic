const { task } = require('folktale/concurrency/task')
const db = require('./getdb')
const to = require('to2')

const write = (buf, enc, next) => {
  console.log('buf', buf.toString())
  console.log('%%%%%%%%%%%%%%%%%%%%%')
  next()
}
const end = r => next => {
  console.log('end')
  r.resolve('end')
  next()
}

const runme = () => task(r => db().createKeyStream().pipe(to(write, end(r))))

module.exports = runme
