const { task } = require('folktale/concurrency/task')
const db = require('./getdb')

const logger = r => {
  console.log('r')
  console.log(r)
  return r
}

const getNoteBooks = () => {
  let notebooks = []
  return task(r =>
    db()
      .createValueStream({
        gt: 'notebooks:',
        lt: 'notebooks:~'
      })
      .on('data', d => notebooks.push(d))
      .on('end', () => r.resolve(notebooks))
  )
}

module.exports = { getNoteBooks }
