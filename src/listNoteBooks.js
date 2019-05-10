const { task } = require('folktale/concurrency/task')
const db = require('./getdb')

const logger = r => {
  console.log('listNoteBooks.js:')
  console.log(r)
  return r
}

function getNoteBooks() {
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

module.exports = { getNoteBooks }
