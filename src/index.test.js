const levelup = require('levelup')
const memdown = require('memdown')

const db = levelup(memdown())
db.put('hey', 'you')

jest.mock('./getdb')
const getDB = require('./getdb')
getDB.mockReturnValue(db)

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
