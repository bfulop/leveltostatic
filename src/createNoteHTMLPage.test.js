const { of } = require('folktale/concurrency/task')

jest.mock('./utils/fileUtils')
const { writeFile } = require('./utils/fileUtils')
writeFile.mockReturnValue('file written')

const subject = require('./createNoteHTMLPage')
describe('creates path and content for writeFile', () => {
  beforeAll(done => {
    subject({
      notedata: {
        meta: {
          title: 'thepath'
        },
        content: 'the content'
      },
      sibling: ['s1', 's2'],
      notebooks: ['nb1', 'nb2']
    })
    done()
  })
  test('creates the correct path', () => {
    expect(writeFile.mock.calls[0][0]).toMatchObject({path: 'thepath'})
  })
  test('adds the HTML', () => {
    expect(writeFile.mock.calls[0][0]).toMatchObject({html: 'the content'})
  })
})
