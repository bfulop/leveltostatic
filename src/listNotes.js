const R = require('ramda')
const { task, waitAll } = require('folktale/concurrency/task')
const db = require('./getdb')

const getNote = id => task(r => db().get(R.concat('anote:')(id)).then(r.resolve))

const getNoteId = R.compose(R.last, R.split(':'))

const latestNotes = limit => {
  let notes = []
  return task(r =>
    db()
      .createKeyStream({
        gt: 'notes:',
        lte: 'notes:~',
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
    db()
      .createValueStream({
        gt: 'anotebook:' + nbookid,
        lt: 'anotebook:' + nbookid + ':~'
      })
      .on('data', d => notes.push(d))
      .on('end', () => r.resolve(notes))
  )
}
const getFirstNote = nbookid => {
  let notes = []
  return task(r =>
    db()
      .createKeyStream({
        gt: 'anotebook:' + nbookid,
        lt: 'anotebook:' + nbookid + ':~',
        limit: 1
      })
      .on('data', d => notes.push(d))
      .on('end', () => r.resolve(notes))
  )
}

module.exports = { latestNotes, notebookNotes, getFirstNote, getNote }
