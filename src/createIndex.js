const R = require('ramda')
const { of, waitAll } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('../../templates/generateIndexHTML')
const { writeFile } = require('./utils/fileUtils')
const { latestNotes } = require('./listNotes')
const { processtags } = require('./tagsHierarchy')

const createIndex = () => R.traverse(of, R.identity, [getNoteBooks(), latestNotes(10), processtags()])
  .map(R.zipObj(['notebooks', 'latestnotes', 'tags' ]))
  .map(r => createHTML(r))
  .map(
    R.compose(
      R.assoc('path', './dist/index.html'),
      R.objOf('html')
    )
  )
  .chain(writeFile)

module.exports = createIndex
