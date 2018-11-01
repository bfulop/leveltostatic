const toReadableStream = require('to-readable-stream')

jest.mock('level')
const level = require('level')
level.mockReturnValue(toReadableStream('blah'))

const subject = require('./index')

test('running subject', done => {
  subject()
  .run()
  .listen({
    onResolved: t => {
      expect(t).toEqual('end')
      done()
    }
  })
})
