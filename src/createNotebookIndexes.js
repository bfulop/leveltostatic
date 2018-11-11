const R = require('ramda')
const { List } = require('immutable-ext')
const { of, waitAll } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('./generateNotebookIndexHTML')
const { writeFile } = require('./utils/fileUtils')
const { notebookNotes } = require('./listNotes')

const mergeNotesList = nbook => R.compose(R.map(R.prepend(nbook)), notebookNotes)(nbook)
const notebookLens = R.lensProp('notebook')
const unwrapNotebook = r => R.set(notebookLens, R.compose(R.head, R.view(notebookLens))(r))(r)
const splitToObj = R.compose(unwrapNotebook, R.zipObj(['notebook', 'notes']), R.splitAt(1))

const createIndex = () =>
  getNoteBooks()
    .map(R.map(mergeNotesList))
    .chain(waitAll)
    .map(R.map(splitToObj))
    .map(R.map(createHTML))
    .map(R.map(writeFile))
    .chain(waitAll)

module.exports = createIndex
