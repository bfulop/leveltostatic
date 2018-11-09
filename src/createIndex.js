const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('./generateIndexHTML')
const { writeFile } = require('./utils/fileUtils')


const createIndex = getNoteBooks()
.map(r => createHTML(r))
.map(R.compose(R.assoc('path', './dist/index.html'), R.objOf('html')))
.chain(writeFile)

// const createIndex = of('done')


module.exports = createIndex
