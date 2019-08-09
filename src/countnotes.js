import R from 'ramda'
import Task from 'folktale/concurrency/task/index.js'
const { task } = Task
import db from './getdb.js'

function countnotes() {
  return task(function _runcount(r) {
    let count = 0
    return db()
      .run()
      .listen({
        onResolved: function getfromdb(v) {
          v.createReadStream({ gt: 'notes:', lt: 'notes:~' })
            .on('data', function incrementCount(){
              count = R.inc(count)
              return true
            })
            .on('end', () => r.resolve(count))
        },
        onRejected: function dbError(e) {
          console.error('got error')
          r.reject(e)
        }
      })
    })
  }

export { countnotes }
