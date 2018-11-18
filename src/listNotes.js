const R = require('ramda')
const { task } = require('folktale/concurrency/task')
const db = require('./getdb')()

const latestNotes = limit => {
  let notes = []
  return task(r =>
    db
      .createValueStream({
        gt: 'notes:',
        let: 'notes:~',
        limit: limit
      })
      .on('data', d => notes.push(JSON.parse(d)))
      .on('end', () => r.resolve(notes))
  )
}
const notebookNotes = nbookid => {
  let notes = []
  console.log('annotebooks-------')
  return task(r =>
    db
      .createValueStream({
        gt: 'anotebook:' + nbookid,
        lt: 'anotebook:' + nbookid + ':~'
      })
      .on('data', d => notes.push(JSON.parse(d)))
      .on('end', () => {
        console.log('--------------------------------', nbookid)
        console.log(notes)
        return r.resolve(notes)})
  )
}

module.exports = { latestNotes, notebookNotes }
