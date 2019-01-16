const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')

const db = levelup(encode(memdown(), { valueEncoding: 'json' }))

// seed some data
const data = [
  { type: 'put', key: 'atag:tag003', value: {count: 10, parentratio: 2} },
  { type: 'put', key: 'atag:tag001', value: {count: 15, parentratio: 1} },
  { type: 'put', key: 'atag:tag002', value: {count: 17, parentratio: 1} },
  { type: 'put', key: 'atag:tag003:tag005', value: {count:7, child:false} },
  { type: 'put', key: 'atag:tag003:tag006', value: {count:9, child:true} },
]
db.batch(data, err => {
  if (err) {
    console.log('ooops!', err)
  } else {
    console.log('data seeded')
  }
})

jest.mock('./getdb')
const getdb = require('./getdb')
getdb.mockReturnValue(db)

const subject = require('./tagsHierarchy')

describe('summarising the tags', () => {
  let result
  beforeAll(done => {
    subject
      .processtags()
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  describe('orders the tags', () => {
    test('first, by parentratio', () => {
      return expect(result[0]).toMatchObject({value:{ parentratio: 2 }})
    })
    test('second, by parentratio', () => {
      return expect(result[1]).toMatchObject({value:{ count: 17 }})
    })
  })
  describe('adds the child/sibling tags', () => {
    test('keep only child:true', () => {
      return expect(result[0].siblings).toContainEqual({key:'atag:tag003:tag006'})
    })
  })
})
