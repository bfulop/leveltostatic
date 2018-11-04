const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')

const db = levelup(memdown())

jest.mock('./getdb')
const getDB = require('./getdb')
getDB.mockReturnValue(db)

jest.mock('./createNotePage')
const createNotePage = require('./createNotePage')
createNotePage.mockReturnValue(of('pagecreated'))

const subject = require('./index')

describe('walking through the db', () => {
  beforeAll(done => {
    db.batch()
      .put('note:aaa1', { meta: { notebook: 'aa' }, content: 'note_aaa1_data' })
      .put('note:aaa2', { meta: { notebook: 'aa' }, content: 'note_aaa2_data' })
      .put('note:aaa3', { meta: { notebook: 'aa' }, content: 'note_aaa3_data' })
      .put('note:baa1', { meta: { notebook: 'aa' }, content: 'note_baa1_data' })
      .put('note:baa2', { meta: { notebook: 'aa' }, content: 'note_baa2_data' })
      .put('note:baa3', { meta: { notebook: 'aa' }, content: 'note_baa3_data' })
      .put('anotebook:aa:100:aaa1')
      .put('anotebook:aa:101:aaa2')
      .put('anotebook:aa:102:aaa3')
      .put('anotebook:ba:103:baa1')
      .put('anotebook:ba:104:baa2')
      .put('anotebook:ba:105:baa3')
      .put('notebooks:100:aa', 'notebook aa')
      .put('notebooks:103:ba', 'notebook ba')
      .write(() => {
        done()
      })
  })
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
  test('calls a createNotePage', done => {
    expect(createNotePage.mock.calls[0][0]).toEqual({
      notedata: { meta: { notebook: 'aa' }, content: 'note_aaa1_data' },
      siblings: ['aaa1', 'aaa2', 'aaa3'],
      notebooks: ['notebook aa', 'notebook ba']
    })
    done()
  })
})
