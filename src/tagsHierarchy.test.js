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
  { type: 'put', key: 'atag:tag006', value: {count: 17, parentratio: -1} },
  { type: 'put', key: 'atag:tag007', value: {count: 17, parentratio: -1, pants: 'shoes'} },
  // testing siblings
  { type: 'put', key: 'atagsibling:tag003:tag005', value: {count:7, child:false} },
  { type: 'put', key: 'atagsibling:tag003:tag006', value: {count:9, child:true} },
  { type: 'put', key: 'atagsibling:tag003:tag007', value: {count:10, child:true} },
  // testing related notebooks
  { type: 'put', key: 'atagnotebook:tag003:55:nbook001', value: {count:1, size:28} },
  { type: 'put', key: 'atagnotebook:tag003:48:nbook002', value: {count:25, size:28} },
  // nbook003 should be listed with the sibling tag tag007
  { type: 'put', key: 'atagnotebook:tag003:48:nbook003', value: {count:24, size:28} },
  // nbook004 should NOT be in child list either
  { type: 'put', key: 'atagnotebook:tag003:79:nbook004', value: {count:12, size:28} },
  // testing adding notes
  // the first will not be listed, it's already in nbook002
  { type: 'put', key: 'tagsnotes:tag003:notes:123:note001', value: {nbook:{uuid:'nbook002'}} },
  // this will be listed, the containing notebook is not listed above
  { type: 'put', key: 'tagsnotes:tag003:notes:124:note002', value: {nbook:{uuid:'nbook001'}} },
  // this should be listed under tag007 child tag
  { type: 'put', key: 'tagsnotes:tag003:notes:124:note012', value: {nbook:{uuid:'nbook001'}} },
  { type: 'put', key: 'tagsnotes:tag007:notes:125:note012', value: {nbook:{uuid:'nbook001'}} },
  // note013 should NOT be listed as child (not part of parent)
  { type: 'put', key: 'tagsnotes:tag007:notes:126:note013', value: {nbook:{uuid:'nbook001'}} },
  // grandchildren listing
  // notebooks from children tags
  { type: 'put', key: 'atagnotebook:tag007:48:nbook003', value: {count:25, size:28} },
  { type: 'put', key: 'atagnotebook:tag005:53:nbook002', value: {count:25, size:28} },
  { type: 'put', key: 'atagnotebook:tag007:23:nbook004', value: {count:12, size:28} },
]
db.batch(data, err => {
  if (err) {
    console.log('ooops!', err)
  } else {
    // console.log('data seeded')
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
        console.log('+++++++++++++++  RESULT  +++++++++++++++')
        console.log(r)
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
    test('filtered not children', () => {
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
  describe('listing child tags notebooks', () => {
    test('sibling notebook added', () => {
      return expect(result[0].siblings[1].notebooks).toContainEqual(
        expect.objectContaining({key:'atagnotebook:tag007:48:nbook003'})
      )
    })
    test('"moves" from the parent notebooks list', () => {
      return expect(result[0].notebooks).not.toContainEqual(
        expect.objectContaining({key:'atagnotebook:tag003:48:nbook003'})
      )
    })
    test('not related (to parent) notebook removed', () => {
      return expect(result[0].siblings[1].notebooks).not.toContainEqual(
        expect.objectContaining({key:'atagnotebook:tag007:23:nbook004'})
      )
    })
  })
  describe('listing sibling notes', () => {
    test('siblings note added', () => {
      return expect(result[0].siblings[1].notes).toContainEqual(
        expect.objectContaining({key:'tagsnotes:tag007:notes:125:note012'})
      )
    })
    test('"moves" from the parent notes list', () => {
      return expect(result[0].notes).not.toContainEqual(
        expect.objectContaining({key:'tagsnotes:tag003:notes:124:note012'})
      )
    })
    test('not related (to parent) notes removed', () => {
      return expect(result[0].siblings[1].notes).not.toContainEqual(
        expect.objectContaining({key:'tagsnotes:tag007:notes:126:note013'})
      )
    })
  })
  describe('merges in sibling notes data', () => {
    test('adds info from atag:tag007', () => {
      return expect(result[0].siblings[1]).toMatchObject( {value:{pants: 'shoes'}})
    })
  })
})
