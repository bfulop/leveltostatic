const R = require('ramda')
const { of } = require('folktale/concurrency/task')

const db = () => 'something'
jest.mock('./getdb')
const getDb = require('./getdb')
getDb.mockReturnValue(db)

describe('simple case, new tag to add', () => {
  const subject = require('./summariseTags').orderTags
  let result
  const tag001 = {
    parentratio: -2,
    size: 30,
    siblings: {
      tag002: {
        child: false
      },
      tag003: {
        child: false
      }
    }
  }
  const tag002 = {
    parentratio: 10,
    size: 20,
    siblings: {
      tag001: {
        child: true
      },
      tag003: {
        child: true
      }
    }
  }
  const tag003 = {
    parentratio: 2,
    size: 21,
    siblings: {
      tag001: {
        child: true
      },
      tag002: {
        child: true
      }
    }
  }
  beforeAll(done => {
    result = subject([tag001,tag002,tag003])
    done()
  })
  test('orders the tags', () => {
    expect(result[0]).toMatchObject({parentratio: 10})
  })
})
