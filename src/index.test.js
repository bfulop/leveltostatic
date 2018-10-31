// const { of } = require('folktale/concurrency/task')
// const { List } = require('immutable-ext')
jest.mock('level')
const level = require('level')
level.mockReturnValue('blah')

const subject = require('./index')

test('running subject', done => {
  expect(subject()).toEqual('blah')
})
