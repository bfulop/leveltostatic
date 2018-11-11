const { of } = require('folktale/concurrency/task')

jest.mock('./listNoteBooks')
const { getNoteBooks } = require('./listNoteBooks')
getNoteBooks.mockReturnValue(of(['nbook1', 'nbook2', 'nbook3']))
jest.mock('./listNotes')
const { notebookNotes } = require('./listNotes')
notebookNotes.mockReturnValue(
  of(['nbook1_note1', 'nbook1_note2', 'nbook1_note3'])
)

jest.mock('./generateNotebookIndexHTML')
const createHTML = require('./generateNotebookIndexHTML')
createHTML.mockReturnValue('indexHTML')

jest.mock('./utils/fileUtils').writeFile
const writeFile = require('./utils/fileUtils').writeFile
writeFile.mockReturnValue(of('nbook1_note1 written successfully'))

const subject = require('./createNotebookIndexes')

describe('getting list of notebooks and saving an index file', () => {
  beforeAll(done => {
    subject()
      .run()
      .listen({
        onResolved: t => {
          expect(t).toContain('nbook1_note1 written successfully')
          done()
        }
      })
  })
  test('calls writefile with merged data', () => {
    expect(createHTML.mock.calls[0][0]).toEqual({
      notebook: 'nbook1',
      notes: ['nbook1_note1', 'nbook1_note2', 'nbook1_note3']
    })
  })
})
