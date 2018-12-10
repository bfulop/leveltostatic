const R = require('ramda')
const { task, waitAll } = require('folktale/concurrency/task')
const db = require('./getdb')()

const getNote = id => task(r => db.get(R.concat('anote:')(id)).then(r.resolve))

const getNoteId = R.compose(R.last, R.split(':'))

const latestNotes = limit => {
  let notes = []
  return task(r =>
    db
      .createKeyStream({
        gt: 'notes:',
        let: 'notes:~',
        limit: limit,
        reverse: true
      })
      .on('data', d => notes.push(getNoteId(d)))
      .on('end', () => r.resolve(notes))
  )
    .map(R.map(getNote))
    .chain(waitAll)
}
const notebookNotes = nbookid => {
  let notes = []
  return task(r =>
    db
      .createValueStream({
        gt: 'anotebook:' + nbookid,
        lt: 'anotebook:' + nbookid + ':~'
      })
      .on('data', d => notes.push(JSON.parse(d)))
      .on('end', () => r.resolve(notes))
  )
}

module.exports = { latestNotes, notebookNotes }
