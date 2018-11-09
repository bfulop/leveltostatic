const { task } = require('folktale/concurrency/task')
const db = require('./getdb')

const getNoteBooks = () => {
  let notebooks = []
  return task(r =>
    db
      .createValueStream({
        gt: 'notebooks:',
        lt: 'notebooks:~'
      })
      .on('data', d => notebooks.push(JSON.parse(d)))
      .on('end', () => r.resolve(notebooks))
  )
}

module.exports = { getNoteBooks }
