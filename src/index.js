const { task, of } = require('folktale/concurrency/task')
const R = require('ramda')
const db = require('./getdb')()
const to = require('to2')
const through = require('through2')
const createNotePage = require('./createNotePage')

const siblingNotes = nbookid => of(['aaa1', 'aaa2', 'aaa3'])

const getSiblings = nbookid => {
  let notes = []
  return task(r =>
    db
      .createValueStream({
        valueAsBuffer: false,
        gt: `anotebook:${nbookid}:`,
        lt: `anotebook:${nbookid}:~`,
      })
      .pipe(through((chunk, enc, next) => {
        notes.push(chunk.toString())
        next()
      }, next => {
        r.resolve(notes)
        next()
      }))
  )
}
const getNoteBooks = () => {
  let notebooks = []
  return task(r =>
    db
      .createValueStream({
        valueAsBuffer: false,
        gt: 'notebooks:',
        lt: 'notebooks:~'
      })
      .pipe(through((chunk, enc, next) => {
        notebooks.push(chunk.toString())
        next()
      }, next => {
        r.resolve(notebooks)
        next()
      }))
  )
}
const listNoteBooks = R.memoizeWith(R.identity, getNoteBooks)

// const noteBooks = () => of(['aa', 'ba'])

const collectParents = R.compose(
  e => getSiblings(e).and(getNoteBooks()),
  R.path(['meta', 'notebook'])
)

const processNote = (buf, enc, next) => {
  return R.compose(
    r =>
      r.run().listen({
        onResolved: r => {
          next()
          return createNotePage(r)
        }
      }),
    R.map(R.zipObj(['siblings', 'notebooks', 'notedata'])),
    R.map(R.append(buf)),
    collectParents
  )(buf)
}

const end = r => next => {
  r.resolve('end')
  next()
}

const runme = () =>
  task(r =>
    db
      .createValueStream({
        valueAsBuffer: false,
        gt: 'note:',
        lt: 'note:~'
      })
      .pipe(through.obj({ objectMode: true }, processNote, end(r)))
  )

module.exports = runme
