const R = require('ramda')
const { task } = require('folktale/concurrency/task')
const db = require('./getdb')

const latestNotes = limit => {
  let notes = []
  return task(r => 
    db.createValueStream({
      gt: 'notes:',
      let: 'notes:~',
      limit: limit
    })
    .on('data', d => notes.push(JSON.parse(d)))
    .on('end', () => r.resolve(notes))
  )
}

module.exports = { latestNotes }
