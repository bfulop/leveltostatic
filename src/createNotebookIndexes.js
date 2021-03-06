import R from 'ramda'
import Task from 'folktale/concurrency/task/index.js'
const { waitAll } = Task
import { getNoteBooks } from './listNoteBooks.js'
import { writeFile, createCleanPath } from './utils/fileUtils.js'
import { notebookNotes, getFirstNote, getNote } from './listNotes.js'
import renderWith from './utils/renderWith.js'
import getConfig from './readconfig.js'

const logger = r => {
  console.log('src/createNotebookIndexes.js')
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

function addPathProp(data, distpath) {
  return R.ap(
    createpathprop,
    R.compose(
      R.concat(R.__, '/index.html'),
      R.concat(distpath),
      R.concat('/'),
      createCleanPath,
      R.view(R.lensPath(['notebook', 'name']))
    )
  )(data)
}

function addPath(data) {
  return getConfig('dist')
    .map(R.curryN(2, addPathProp)(data))
}

function createHTMLandPath(d) {
  return renderWith('generateNotebookIndexHTML.js', d).chain(addPath)
}

const addFirstNoteId = R.converge(
  (noteT, nb) => noteT.map(t => R.assoc('note', t, nb)),
  [
    R.compose(
      getFirstNote,
      R.path(['notebook', 'uuid'])
    ),
    R.identity
  ]
)

const getFirstNoteContents = R.converge(
  (noteT, nb) => noteT.map(t => R.set(R.lensProp('note'), t, nb)),
  [
    R.compose(
      getNote,
      R.last,
      R.split(':'),
      R.head,
      R.prop('note')
    ),
    R.identity
  ]
)

function createNotebookIndex() {
  return getNoteBooks()
    .map(xs => R.map(R.assoc('notebooks', xs), xs))
    .map(R.map(mergeNotesList))
    .chain(waitAll)
    .map(R.map(splitToObj))
    .map(R.map(addFirstNoteId))
    .chain(waitAll)
    .map(R.map(getFirstNoteContents))
    .chain(waitAll)
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
    .chain(waitAll)
    .map(R.map(writeFile))
    .chain(waitAll)
}

export { createNotebookIndex, mergeNotesList }
