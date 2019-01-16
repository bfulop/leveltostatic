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

const createSiblingSelectors = R.compose(
    R.over(R.lensProp('lt'), R.concat(R.__, '~')),
    R.zipObj(['lt', 'gt']),
    R.map(R.concat(R.__, ':')),
    R.map(R.replace(/^atag:/, 'atagsibling:')),
    R.repeat(R.__, 2)
)

const getSiblings = tObj => task(r => {
  let siblingxs = []
  db()
  .createReadStream(createSiblingSelectors(R.prop('key', tObj)))
  .on('data', t => siblingxs.push(t))
  .on('end', () => r.resolve(siblingxs))
})
.map(R.filter(R.path(['value', 'child'])))

const addSiblings = R.converge(
  (siblingsT, t) => siblingsT.map(siblings => R.assoc('siblings', siblings, t)),
  [
    getSiblings,
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

module.exports = { processtags }
