const { of } = require('folktale/concurrency/task')

jest.mock('./listNoteBooks')
const { getNoteBooks } = require('./listNoteBooks')
getNoteBooks.mockReturnValue(
  of([{ name: 'nbook1' }, { name: 'nbook2' }, { name: 'nbook3' }])
)

jest.mock('./listNotes')
const { notebookNotes } = require('./listNotes')
notebookNotes.mockReturnValue(
  of(['nbook1_note1', 'nbook1_note2', 'nbook1_note3'])
)

jest.mock('./generateNotebookIndexHTML')
const createHTML = require('./generateNotebookIndexHTML')
createHTML.mockReturnValue('indexHTML')

jest.mock('./utils/fileUtils')
const { writeFile, createCleanPath } = require('./utils/fileUtils')
writeFile.mockReturnValue(of('nbook1_note1 written successfully'))
createCleanPath.mockReturnValue('cleanpath')

const {createNotebookIndex, mergeNotesList} = require('./createNotebookIndexes')

describe('mergeNotesList', () => {
  test('merges the data', done => {
    mergeNotesList({ name: 'nbook1' })
      .run()
      .listen({
        onResolved: t => {
          expect(t).toEqual([{name: 'nbook1'}, 'nbook1_note1', 'nbook1_note2', 'nbook1_note3'])
          done()
        }
      })
  })
})

describe('getting list of notebooks and saving an index file', () => {
  beforeAll(done => {
    createNotebookIndex()
      .run()
      .listen({
        onResolved: t => {
          expect(t).toContain('nbook1_note1 written successfully')
          done()
        }
      })
  })
  test('calls createHTML with merged data', () => {
    expect(createHTML).toBeCalledWith(
      expect.objectContaining({
        notebook: { name: 'nbook1' },
        notes: ['nbook1_note1', 'nbook1_note2', 'nbook1_note3']
      })
    )
  })
  test('calls createCleanPath with notebooks name', () => {
    expect(createCleanPath).toBeCalledWith('nbook1')
  })
  test('calls writefile with merged data', () => {
    expect(writeFile).toBeCalledWith(
      expect.objectContaining({
        path: './dist/cleanpath/index.html',
        html: 'indexHTML'
      })
    )
  })
})
