const { task, of } = require('folktale/concurrency/task')
const R = require('ramda')
const db = require('./getdb')()
const to = require('to2')
const createNotePage = require('./createNotePage')

const siblingNotes = () => of(['aaa1', 'aaa2', 'aaa3'])
const noteBooks = () => of(['aa', 'ba'])
const noteData = () => of('note_aaa1_data')

const collectParents = r => siblingNotes(r).and(noteBooks())

const processNote = (buf, enc, next) => {
  noteData(buf.toString)
    .chain(r =>
      R.compose(
        R.map(R.zipObj(['siblings', 'notebooks', 'notedata'])),
        R.map(R.append(r)),
        collectParents
      )(r)
    )
    .run()
    .listen({
      onResolved: r => {
        next()
        return createNotePage(r)
      }
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
        lt: 'note:~'
      })
      .pipe(to(processNote, end(r)))
  )

module.exports = runme
