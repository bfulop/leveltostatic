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
  // testing siblings
  { type: 'put', key: 'atagsibling:tag003:tag005', value: {count:7, child:false} },
  { type: 'put', key: 'atagsibling:tag003:tag006', value: {count:9, child:true} },
  { type: 'put', key: 'atagsibling:tag003:tag007', value: {count:10, child:true} },
  // testing related notebooks
  { type: 'put', key: 'atagnotebook:tag003:55:nbook001', value: {count:1, size:28} },
  { type: 'put', key: 'atagnotebook:tag003:48:nbook002', value: {count:25, size:28} },
  // testing adding notes
  // the first will not be listed, it's already in nbook002
  { type: 'put', key: 'tagsnotes:tag003:notes:123:note001', value: {nbook:{uuid:'nbook002'}} },
  // this will be listed, the containing notebook is not listed above
  { type: 'put', key: 'tagsnotes:tag003:notes:124:note002', value: {nbook:{uuid:'nbook001'}} },
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
    test('keep only child:true and ordered by count', () => {
      return expect(result[0].siblings).toContainEqual(
        expect.objectContaining({key:'atagsibling:tag003:tag007'})
      )
    })
    test('filtered not childrend', () => {
      return expect(result[0].siblings).not.toContainEqual(
        expect.objectContaining({key:'atagsibling:tag003:tag005'})
      )
    })
  })
  describe('adds related notebooks', () => {
    test('inserts the notebooks list', () => {
      return expect(result[0].notebooks).toContainEqual(
        expect.objectContaining({key:'atagnotebook:tag003:48:nbook002'})
      )
    })
    test('only strongly related notebooks (index below 50)', () => {
      return expect(result[0].notebooks).not.toContainEqual(
        expect.objectContaining({key:'atagnotebook:tag003:55:nbook001'})
      )
    })
  })
  describe('Adding notes', () => {
    test('adds notes', () => {
      return expect(result[0].notes).toContainEqual(
        expect.objectContaining({key:'tagsnotes:tag003:notes:124:note002'})
      )
    })
    test('but doesnt add notes that are part of listed notebooks', () => {
      return expect(result[0].notes).not.toContainEqual(
        expect.objectContaining({key:'tagsnotes:tag003:notes:123:note001'})
      )
    })
  })
})
