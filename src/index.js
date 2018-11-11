const { task, of } = require('folktale/concurrency/task')
const R = require('ramda')
const db = require('./getdb')()
const to = require('to2')
const through = require('through2')
const { getNoteBooks } = require('./listNoteBooks')
const createNotePage = require('./createNotePage')
const createIndex = require('./createIndex')

const logger = r => {
  console.log('r')
  console.log(r)
  return r
}

const siblingNotes = nbookid => of(['aaa1', 'aaa2', 'aaa3'])

const getSiblings = nbookid => {
  let notes = []
  return task(r => {
    return db
      .createValueStream({
        gt: `anotebook:${nbookid}:`,
        lt: `anotebook:${nbookid}:~`
      })
      .on('data', d => notes.push(JSON.parse(d)))
      .on('end', () => r.resolve(notes))
  })
}

const collectParents = R.compose(
  e => getSiblings(e).and(getNoteBooks()),
  R.path(['nbook', 'uuid'])
)

const processNote = (buf, enc, next) => {
  return R.compose(
    r =>
      r.run().listen({
        onResolved: r => {
          // next()
          return createNotePage(r).run()
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

const runme = () => {
  return task(r =>
    db
      .createValueStream({
        keyAsBuffer: false,
        valueAsBuffer: false,
        gt: 'anote:',
        lt: 'anote:~'
      })
      .on('data', d => processNote(JSON.parse(d)))
      .on('end', () => r.resolve('no more notes'))
  )
  .chain(() => createIndex())
}

module.exports = runme
