const R = require('ramda')
const { List } = require('immutable-ext')
const { of, waitAll } = require('folktale/concurrency/task')
const { getNoteBooks } = require('./listNoteBooks')
const createHTML = require('../../templates/generateNotebookIndexHTML')
const { writeFile, createCleanPath } = require('./utils/fileUtils')
const { notebookNotes } = require('./listNotes')

const logger = r => {
  console.log('____')
  console.log(r)
  return r
}

const mergeNotesList = nbook =>
  R.compose(
    R.map(R.prepend(nbook)),
    R.compose(
      notebookNotes,
      R.prop('uuid')
    )
  )(nbook)
const notebookLens = R.lensProp('notebook')
const unwrapNotebook = r =>
  R.set(
    notebookLens,
    R.compose(
      R.head,
      R.view(notebookLens)
    )(r)
  )(r)
const splitToObj = R.compose(
  unwrapNotebook,
  R.zipObj(['notebook', 'notes']),
  R.splitAt(1)
)

const createhtmlprop = r => R.assoc('html', R.__, r)
const createpathprop = r => R.assoc('path', R.__, r)

const addHTML = R.ap(createhtmlprop, createHTML)
const addPath = R.ap(
  createpathprop,
  R.compose(
    R.concat(R.__, '/index.html'),
    R.concat('../dist/'),
    createCleanPath,
    R.view(R.lensPath(['notebook', 'name']))
  )
)

const createHTMLandPath = R.compose(
  addHTML,
  addPath
)

const createNotebookIndex = () =>
  getNoteBooks()
    .map(xs => R.map(R.assoc('notebooks', xs), xs))
    .map(R.map(mergeNotesList))
    .chain(waitAll)
    .map(R.map(splitToObj))
    .map(
      R.map(
        R.ap(
          R.compose(
            R.assoc('notebooks'),
            R.path(['notebook', 'notebooks'])
          ),
          R.identity
        )
      )
    )
    .map(R.map(R.dissocPath(['notebook', 'notebooks'])))
    .map(R.map(createHTMLandPath))
    .map(R.map(writeFile))
    .chain(waitAll)

module.exports = { createNotebookIndex, mergeNotesList }
