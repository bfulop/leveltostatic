const { task } = require('folktale/concurrency/task')
const db = require('./getdb')()
const to = require('to2')
const createNotePage = require('./createNotePage')

const write = (buf, enc, next) => {
  console.log(buf.toString())
  db.get(buf.toString(), (e, v) => {
    createNotePage({
      notedata: v.toString(),
    })
    next()
  })
}
const end = r => next => {
  r.resolve('end')
  next()
}

const runme = () =>
  task(r =>
    db
      .createKeyStream({
        gt: 'note:',
        lt: 'note:~',
      })
      .pipe(to(write, end(r))),
  )

module.exports = runme
