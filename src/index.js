import task from 'folktale/concurrency/task/task.js'
import R from 'ramda'
import db from './getdb.js'
import { getNoteBooks } from './listNoteBooks.js'
import createNotePage from './createNotePage.js'
import createIndex from './createIndex.js'
import createAbout from './createAbout.js'
import { createNotebookIndex } from './createNotebookIndexes.js'

const logger = r => {
  console.log('src/index.js')
  console.log(r)
  return r
}

const getSiblings = nbookid => {
  let notes = []
  return task(r => {
    return db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.createValueStream({
            gt: `anotebook:${nbookid}:`,
            lt: `anotebook:${nbookid}:~`
          })
            .on('data', d => notes.push(d))
            .on('end', () => r.resolve(notes))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  })
}

const collectParents = R.compose(
  e => getSiblings(e).and(getNoteBooks()),
  R.path(['nbook', 'uuid'])
)

const processNote = (buf, enc, next) =>
  R.compose(
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

const end = r => next => {
  r.resolve('end')
  next()
}

function runme() {
  return task(function _readDB(r) {
    return db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          v.createValueStream({
            keyAsBuffer: false,
            valueAsBuffer: false,
            gt: 'anote:',
            lt: 'anote:~'
          })
            .on('data', processNote)
            .on('end', () => r.resolve('no more notes'))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  })
    .chain(createNotebookIndex)
    .chain(createIndex)
    // .chain(createAbout)
}

export default runme
