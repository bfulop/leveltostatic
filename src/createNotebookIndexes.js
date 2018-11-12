const R = require('ramda')
const { List } = require('immutable-ext')
const { of, waitAll } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('./generateNotebookIndexHTML')
const { writeFile, createCleanPath } = require('./utils/fileUtils')
const { notebookNotes } = require('./listNotes')

const mergeNotesList = nbook => R.compose(R.map(R.prepend(nbook)), notebookNotes)(nbook)
const notebookLens = R.lensProp('notebook')
const unwrapNotebook = r => R.set(notebookLens, R.compose(R.head, R.view(notebookLens))(r))(r)
const splitToObj = R.compose(unwrapNotebook, R.zipObj(['notebook', 'notes']), R.splitAt(1))

const createhtmlprop = r => R.assoc('html', R.__, r)
const createpathprop = r => R.assoc('path', R.__, r)

const addHTML = R.ap(createhtmlprop, createHTML)
const addPath = R.ap(createpathprop, R.compose(createCleanPath, R.view(R.lensPath(['notebook', 'name']))))

const addFileProps = R.compose(addHTML, addPath)

const createIndex = () =>
  getNoteBooks()
    .map(R.map(mergeNotesList))
    .chain(waitAll)
    .map(R.map(splitToObj))
    .map(R.map(addFileProps))
    .map(R.map(writeFile))
    .chain(waitAll)

module.exports = createIndex
