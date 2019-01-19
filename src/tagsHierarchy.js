const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./getdb')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

const safeGet = r =>
  db()
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)

const getT = fromPromised(safeGet)

const orderTags = R.sortWith([
  R.descend(R.path(['value', 'parentratio'])),
  R.descend(R.path(['value', 'count']))
])

const createSelectors = listname =>
  R.compose(
    R.over(R.lensProp('lt'), R.concat(R.__, '~')),
    R.zipObj(['lt', 'gt']),
    R.map(R.concat(R.__, ':')),
    R.map(R.replace(/^atag:/, listname)),
    R.repeat(R.__, 2)
  )

const getTagInfo = R.compose(
  getT,
  R.concat('atag:'),
  R.last,
  R.split(':'),
  R.prop('key')
)

const importTagInfo = R.converge(
  (tagInfoT, t) => tagInfoT.map(v => R.mergeDeepLeft(t, v)),
  [
    getTagInfo,
    R.identity
  ]
)
const getSiblings = tObj =>
  task(r => {
    let siblingxs = []
    db()
      .createReadStream(createSelectors('atagsibling:')(R.prop('key', tObj)))
      .on('data', t => siblingxs.push(t))
      .on('end', () => r.resolve(siblingxs))
  })
    .map(R.filter(R.path(['value', 'child'])))
    .map(R.sortBy(R.path(['value', 'count'])))
    .map(R.map(importTagInfo))
    .chain(waitAll)

const addSiblings = R.converge(
  (siblingsT, t) => siblingsT.map(v => R.assoc('siblings', v, t)),
  [getSiblings, R.identity]
)

const getNotebooks = limit => tObj =>
  task(r => {
    let notebooks = []
    db()
      .createReadStream(
        R.compose(
          R.over(R.lensProp('lt'), R.replace('~', limit)),
          R.compose(
            createSelectors('atagnotebook:'),
            R.prop('key')
          )
        )(tObj)
      )
      .on('data', t => notebooks.push(t))
      .on('end', () => r.resolve(notebooks))
  }).map(R.sortWith([R.descend(R.path(['value', 'count']))]))
const getSiblingNotes = tObj =>
  task(r => {
    let notes = []
    db()
      .createReadStream(
        R.compose(
            createSelectors('tagsnotes:'),
            R.prop('key')
        )(tObj)
      )
      .on('data', t => notes.push(t))
      .on('end', () => r.resolve(notes))
  }).map(R.sortWith([R.descend(R.path(['value', 'count']))]))

const addNotebooks = limit => R.converge(
  (notebooksT, t) => notebooksT.map(v => R.assoc('notebooks', v, t)),
  [getNotebooks(limit), R.identity]
)
const addSiblingNotes = R.converge(
  (notesT, t) => notesT.map(v => R.assoc('notes', v, t)),
  [getSiblingNotes, R.identity]
)

const inNotebook = (o, t) =>
  R.compose(
    R.any(
      R.compose(
        R.equals(R.path(['value', 'meta', 'nbook', 'uuid'], t)),
        R.path(['value', 'uuid']),
      )
    ),
    R.prop('notebooks')
  )(o)
const inNotebookC = R.curry(inNotebook)
const getNotes = tObj =>
  task(r => {
    let notexs = []
    db()
      .createReadStream(createSelectors('tagsnotes:')(R.prop('key', tObj)))
      .on('data', R.unless(inNotebookC(tObj), t => notexs.push(t)))
      .on('end', () => r.resolve(notexs))
  })

const addNotes = R.converge(
  (notesT, t) => notesT.map(v => R.assoc('notes', v, t)),
  [getNotes, R.identity]
)

const insertSiblingsNotebooksold = s =>
  of(R.assoc('notebooks', [{ key: 'atagnotebook:tag007:48:nbook002' }], s))
const getSiblingNotebooks = sObj =>
  task(r => {
    console.log('sobj %o', sObj)
    console.log('sobj %o', sObj)
    r.resolve([{ key: 'atagnotebook:tag007:48:nbook002' }])
  })

const convertSiblingTagName = R.compose(
  R.concat('atag:'),
  R.nth(2),
  R.split(':')
)
const insertSiblingsNotebooks = limit => R.compose(
  R.map(R.converge(R.set(R.lensProp('key')), [R.prop('_key'), R.identity])),
  addNotebooks(limit),
  R.over(R.lensProp('key'), convertSiblingTagName),
  R.converge(R.assoc('_key'), [R.prop('key'), R.identity])
)
const insertSiblingsNotes = R.compose(
  R.map(R.converge(R.set(R.lensProp('key')), [R.prop('_key'), R.identity])),
  addSiblingNotes,
  R.over(R.lensProp('key'), convertSiblingTagName),
  R.converge(R.assoc('_key'), [R.prop('key'), R.identity])
)

const addSiblingsNotebooksOld = R.over(
  R.lensProp('siblings'),
  R.map(insertSiblingsNotebooks)
)

const processSiblingNotebooks = limit => R.compose(
  waitAll,
  R.map(insertSiblingsNotebooks(limit)),
  R.prop('siblings')
)
const processSiblingNotes = R.compose(
  waitAll,
  R.map(insertSiblingsNotes),
  R.prop('siblings')
)

const getNbookfromKey = R.compose(
  R.last,
  R.split(':'),
  R.prop('key')
)

const listChildNotebooks = R.compose(
  R.map(getNbookfromKey),
  R.flatten,
  R.map(R.prop('notebooks')),
  R.prop('siblings')
)
const listChildNotes = R.compose(
  R.map(getNbookfromKey),
  R.flatten,
  R.map(R.prop('notes')),
  R.prop('siblings')
)

const keyMatchesTag = R.curry((sourcexs, tObj) =>
  R.contains(getNbookfromKey(tObj), sourcexs)
)
const filterNbooks = R.curry((sourcexs, targetxs) =>
  R.reject(keyMatchesTag(sourcexs), targetxs)
)

const removeNotebooksFromRoot = R.converge(
  (nbookxs, atag) =>
    R.over(R.lensProp('notebooks'), filterNbooks(nbookxs), atag),
  [listChildNotebooks, R.identity]
)
const removeNotesFromRoot = R.converge(
  (notexs, atag) =>
    R.over(R.lensProp('notes'), filterNbooks(notexs), atag),
  [listChildNotes, R.identity]
)

const listRootNotebooks = R.compose(
  R.map(getNbookfromKey),
  R.prop('notebooks'),
)
const listRootNotes = R.compose(
  R.map(getNbookfromKey),
  R.prop('notes'),
)
const filterSiblingNotebook = R.curry((sourcexs, targetxs) => R.filter(keyMatchesTag(sourcexs), targetxs))
const filterSiblingNbooks = nbookxs => R.map(R.over(R.lensProp('notebooks'), filterSiblingNotebook(nbookxs)))
const filterSiblingNotes = nbookxs => R.map(R.over(R.lensProp('notes'), filterSiblingNotebook(nbookxs)))
const cleanChildNotebooks = R.converge(
  (nbookxs, atag) =>
    R.over(R.lensProp('siblings'), filterSiblingNbooks(nbookxs), atag),
  [
    listRootNotebooks,
    R.identity
  ]
)

const cleanChildNotes = R.converge(
  (notexs, atag) =>
    R.over(R.lensProp('siblings'), filterSiblingNotes(notexs), atag),
  [
    listRootNotes,
    R.identity
  ]
)

const addSiblingsNotebooks = limit => R.converge(
  (processedSiblingNotebooksT, t) =>
    processedSiblingNotebooksT.map(v => R.set(R.lensProp('siblings'), v, t)),
  [processSiblingNotebooks(limit), R.identity]
)

const addSiblingsNote = R.converge(
  (processedSiblingNotesT, t) =>
    processedSiblingNotesT.map(v => R.set(R.lensProp('siblings'), v, t)),
  [processSiblingNotes, R.identity]
)
const filterSiblingsList = R.filter(R.converge(
  R.compose(R.gt(R.__, 0), R.add),
  [
    R.compose(R.length, R.prop('notebooks')),
    R.compose(R.length, R.prop('notes'))
  ]
))
const removeEmptySiblings = R.over(R.lensProp('siblings'), filterSiblingsList)

const orderSiblings = R.over(R.lensProp('siblings'), R.sortWith(R.descend(R.path(['value', 'count']))))

const processtags = () =>
  task(r => {
    let tagxs = []
    db()
      .createReadStream({ gt: 'atag:', lt: 'atag:~' })
      .on('data', t => tagxs.push(t))
      .on('end', () => r.resolve(tagxs))
  })
    .map(orderTags)
    .map(R.take(5))
    .map(R.map(addSiblings))
    .chain(waitAll)
    .map(R.map(addNotebooks(50)))
    .chain(waitAll)
    .map(R.map(addNotes))
    .chain(waitAll)
    .map(R.map(addSiblingsNotebooks(60)))
    .chain(waitAll)
    .map(R.map(cleanChildNotebooks))
    .map(R.map(removeNotebooksFromRoot))
    .map(R.map(addSiblingsNote))
    .chain(waitAll)
    .map(R.map(cleanChildNotes))
    .map(R.map(removeNotesFromRoot))
    .map(R.map(removeEmptySiblings))
    .map(R.map(orderSiblings))

module.exports = { processtags }
