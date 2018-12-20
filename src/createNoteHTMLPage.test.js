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

jest.mock('../../templates/generateNoteHTML')
const generateNoteHTML = require('../../templates/generateNoteHTML')
generateNoteHTML.mockReturnValue('html content')

const subject = require('./createNoteHTMLPage')
describe('creates path and content', () => {
  beforeAll(done => {
    subject(notedata)
    done()
  })
  test('creates the correct path', () => {
    expect(subject(notedata)).toMatchObject({
      path: '../dist/a-long-and-name-eu/exercise-adding-webpack.html',
      html: 'html content'
    })
  })
})
