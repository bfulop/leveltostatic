const R = require('ramda')
const { task, waitAll } = require('folktale/concurrency/task')
const db = require('./getdb')

const getNote = id =>
  task(r =>
    db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.get(R.concat('anote:')(id)).then(r.resolve)
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  )

const getNoteId = R.compose(
  R.last,
  R.split(':')
)

function latestNotes(limit) {
  let notes = []
  return task(function _runtask(r) {
    return db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.createKeyStream({
            gt: 'notes:',
            lte: 'notes:~',
            limit: limit,
            reverse: true
          })
            .on('data', d => notes.push(getNoteId(d)))
            .on('end', () => r.resolve(notes))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  })
    .map(R.map(getNote))
    .chain(waitAll)
}

const notebookNotes = nbookid => {
  let notes = []
  return task(r =>
    db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.createValueStream({
            gt: 'anotebook:' + nbookid,
            lt: 'anotebook:' + nbookid + ':~'
          })
            .on('data', d => notes.push(d))
            .on('end', () => r.resolve(notes))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  )
}

const getFirstNote = nbookid => {
  let notes = []
  return task(r =>
    db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.createKeyStream({
            gt: 'anotebook:' + nbookid,
            lt: 'anotebook:' + nbookid + ':~',
            limit: 1
          })
            .on('data', d => notes.push(d))
            .on('end', () => r.resolve(notes))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  )
}

module.exports = { latestNotes, notebookNotes, getFirstNote, getNote }
