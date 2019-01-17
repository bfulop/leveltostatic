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

const createSelectors = listname => R.compose(
    R.over(R.lensProp('lt'), R.concat(R.__, '~')),
    R.zipObj(['lt', 'gt']),
    R.map(R.concat(R.__, ':')),
    R.map(R.replace(/^atag:/, listname)),
    R.repeat(R.__, 2)
)

const getSiblings = tObj => task(r => {
  let siblingxs = []
  db()
  .createReadStream(createSelectors('atagsibling:')(R.prop('key', tObj)))
  .on('data', t => siblingxs.push(t))
  .on('end', () => r.resolve(siblingxs))
})
.map(R.filter(R.path(['value', 'child'])))
.map(R.sortBy(R.path(['value', 'count'])))

const addSiblings = R.converge(
  (siblingsT, t) => siblingsT.map(v => R.assoc('siblings', v, t)),
  [
    getSiblings,
    R.identity
  ]
)

const getNotebooks = tObj => task(r => {
  let notebooks = []
  db()
  .createReadStream(
    R.compose(
      R.over(R.lensProp('lt'), R.replace('~', '50')),
      R.compose(
        createSelectors('atagnotebook:'),
        (R.prop('key')),
      )
    )(tObj)
)
  .on('data', t => notebooks.push(t))
  .on('end', () => r.resolve(notebooks))
})
.map(R.sortWith([
  R.descend(R.path(['value', 'count']))
]))

const addNotebooks = R.converge(
  (notebooksT, t) => notebooksT.map(v => R.assoc('notebooks', v, t)),
  [
    getNotebooks,
    R.identity
  ]
)

const inNotebook = (o, t) => R.compose(
  R.any(R.compose(
    R.test(new RegExp(R.path(['value', 'nbook', 'uuid'], t))),
    R.prop('key'))
  ),
  R.prop('notebooks')
)(o)
const inNotebookC = R.curry(inNotebook)
const getNotes = tObj => task(r => {
  let notexs = []
  db()
  .createReadStream(createSelectors('tagsnotes:')(R.prop('key', tObj)))
  .on('data', R.unless(inNotebookC(tObj), t => notexs.push(t)))
  .on('end', () => r.resolve(notexs))
})

const addNotes = R.converge(
  (notesT, t) => notesT.map(v => R.assoc('notes', v, t)),
  [
    getNotes,
    R.identity
  ]
)

const processtags = () => task(r => {
  let tagxs = []
  db()
  .createReadStream({gt:'atag:', lt:'atag:~'})
  .on('data', t => tagxs.push(t))
  .on('end', () => r.resolve(tagxs))
})
.map(orderTags)
.map(R.map(addSiblings))
.chain(waitAll)
.map(R.map(addNotebooks))
.chain(waitAll)
.map(R.map(addNotes))
.chain(waitAll)

module.exports = { processtags }
