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
    expect(subject(notedata)).toMatchObject({
      path: './dist/a-long-and-name-eu/exercise-adding-webpack.html',
      html: 'html content'
    })
  })
})
