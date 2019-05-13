import task from 'folktale/concurrency/task/task.js'
import db from './getdb.js'

const logger = r => {
  console.log('listNoteBooks.js:')
  console.log(r)
  return r
}

export default function getNoteBooks() {
  let notebooks = []
  return task(function _readDB(r) {
    return db()
      .run()
      .listen({
        onResolved: function dbResolved(v) {
          return v
            .createValueStream({
              gt: 'notebooks:',
              lt: 'notebooks:~'
            })
            .on('data', d => notebooks.push(d))
            .on('end', () => r.resolve(notebooks))
        },
        onRejected: function dbError(e) {
          r.reject(e)
        }
      })
  })
}

export { getNoteBooks }

