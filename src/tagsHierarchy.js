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

const getSiblings = () => of([{key:'atag:tag003:tag006'}])
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
