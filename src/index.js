const { task } = require('folktale/concurrency/task')
const level = require('level')
const to = require('to2')

const write = (buf, enc, next) => {
  console.log('buf', buf)
  next()
}
const end = r => next => {
  console.log('end')
  r.resolve('end')
  next()
}

const runme = () => task(r => level().pipe(to(write, end(r))))

module.exports = runme
