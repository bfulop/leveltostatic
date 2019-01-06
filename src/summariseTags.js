const R = require('ramda')
const { task, of } = require('folktale/concurrency/task')
const db = require('./getdb')

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
      .createValueStream({
        gt: 'tags:',
        let: 'tags:~'
      })
      .on('data', appendList)
      .on('end', () => r.resolve(tagxs))
  })

const getOrderedTags = () => getAllTags().map(orderTags)

module.exports = { getOrderedTags, orderTags }
