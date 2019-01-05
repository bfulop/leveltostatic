const R = require('ramda')
const { task, of } = require('folktale/concurrency/task')
const db = require('./getdb')()

const orderTags = R.sortWith([
  R.descend(R.prop('parentratio')),
  R.descend(R.prop('size'))
])

const getAllTags = () =>
  task(r => {
    let tagxs = []
    const append = R.invoker(1, 'push')
    const appendList = append(R.__, tagxs)
    db()
      .createKeyStream({ gt: 'tags:' })
      .on('data', appendList)
      .on('end', t => r.resolve(tagxs))
  })

const getOrderedTags = () => getAllTags().chain(orderTags)

module.exports = { getOrderedTags, orderTags }
