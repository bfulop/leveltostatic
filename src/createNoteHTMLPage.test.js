const { of } = require('folktale/concurrency/task')

const notedata = {
  notedata: {
    nbook: {
      name: 'a long & name éü ? #'
    },
    note: {
      meta: {
        title: 'Exercise: Adding Webpack'
      },
      content: 'the content'
    }
  },
  sibling: ['s1', 's2'],
  notebooks: ['nb1', 'nb2']
}

jest.mock('./generateNoteHTML')
const generateNoteHTML = require('./generateNoteHTML')
generateNoteHTML.mockReturnValue('html content')

jest.mock('./utils/fileUtils')
const { writeFile } = require('./utils/fileUtils')
writeFile.mockReturnValue('file written')

const subject = require('./createNoteHTMLPage')
describe('creates path and content for writeFile', () => {
  beforeAll(done => {
    subject(notedata)
    done()
  })
  test('creates the correct path', () => {
    expect(writeFile.mock.calls[0][0]).toMatchObject({ path: './dist/exercise-adding-webpack/a-long-and-name-eu.html' })
  })
  test('adds the HTML', () => {
    expect(writeFile.mock.calls[0][0]).toMatchObject({ html: 'html content' })
  })
})
