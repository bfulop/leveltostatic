const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('../../templates/generateIndexHTML')
const { writeFile } = require('./utils/fileUtils')
const { latestNotes } = require('./listNotes')

const createIndex = () => getNoteBooks()
  .and(latestNotes(10))
  .map(R.zipObj(['notebooks', 'latestnotes']))
  .map(r => createHTML(r))
  .map(
    R.compose(
      R.assoc('path', './dist/index.html'),
      R.objOf('html')
    )
  )
  .chain(writeFile)

module.exports = createIndex
