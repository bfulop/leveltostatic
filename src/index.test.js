const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')

jest.mock('./createNotebookIndexes')
const { createNotebookIndex } = require('./createNotebookIndexes')
createNotebookIndex.mockReturnValue(of('index created'))

jest.mock('./createIndex')
const createIndex = require('./createIndex')
createIndex.mockImplementation(() => of('just done it'))

jest.mock('./createAbout')
const createAbout = require('./createAbout')
createAbout.mockImplementation(() => of('just done it'))

const db = levelup(memdown(), { valueEncoding: 'json' })

jest.mock('./getdb')
const getDB = require('./getdb')
getDB.mockImplementation(() => db)

jest.mock('./createNotePage')
const createNotePage = require('./createNotePage')
createNotePage.mockReturnValue(of('pagecreated'))

jest.mock('./listNoteBooks')
const { getNoteBooks } = require('./listNoteBooks')
getNoteBooks.mockReturnValue(of(['notebook aa', 'notebook ba']))

describe('walking through the db', () => {
  beforeAll(done => {
    const valueLens = R.lensProp('value')
    const jsonify = R.map(r => r)

    const basedata = [
      {
        type: 'put',
        key: 'anote:aaa1',
        value: { nbook: { uuid: 'aa' }, content: 'note_aaa1_data' }
      },
      {
        type: 'put',
        key: 'anote:aaa2',
        value: { nbook: { uuid: 'aa' }, content: 'note_aaa2_data' }
      },
      {
        type: 'put',
        key: 'anote:aaa3',
        value: { nbook: { uuid: 'aa' }, content: 'note_aaa3_data' }
      },
      {
        type: 'put',
        key: 'anote:baa1',
        value: { nbook: { uuid: 'aa' }, content: 'note_baa1_data' }
      },
      {
        type: 'put',
        key: 'anote:baa2',
        value: { nbook: { uuid: 'aa' }, content: 'note_baa2_data' }
      },
      {
        type: 'put',
        key: 'anote:baa3',
        value: { nbook: { uuid: 'aa' }, content: 'note_baa3_data' }
      },
      {
        type: 'put',
        key: 'anotebook:aa:100:aaa1',
        value: { title: 'note aaa1' }
      },
      {
        type: 'put',
        key: 'anotebook:aa:101:aaa2',
        value: { title: 'note aaa2' }
      },
      {
        type: 'put',
        key: 'anotebook:aa:102:aaa3',
        value: { title: 'note aaa3' }
      },
      {
        type: 'put',
        key: 'anotebook:ba:103:baa1',
        value: { title: 'note baa1' }
      },
      {
        type: 'put',
        key: 'anotebook:ba:104:baa2',
        value: { title: 'note baa2' }
      },
      {
        type: 'put',
        key: 'anotebook:ba:105:baa3',
        value: { title: 'note baa3' }
      },
      { type: 'put', key: 'notebooks:100:aa', value: { name: 'notebook aa' } },
      { type: 'put', key: 'notebooks:103:ba', value: { name: 'notebook ba' } }
    ]
    db.batch(jsonify(basedata), done)
  })
  test('running subject', done => {
    const subject = require('./index')
    subject()
      .run()
      .listen({
        onResolved: t => {
          expect(t).toEqual('just done it')
          done()
        }
      })
  })
  test('calls a createNotePage', done => {
    expect(createNotePage.mock.calls[0][0]).toEqual({
      notedata: { nbook: { uuid: 'aa' }, content: 'note_aaa1_data' },
      siblings: [
        { title: 'note aaa1' },
        { title: 'note aaa2' },
        { title: 'note aaa3' }
      ],
      notebooks: ['notebook aa', 'notebook ba']
    })
    done()
  })
})
