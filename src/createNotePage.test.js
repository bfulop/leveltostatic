const { of } = require('folktale/concurrency/task')

jest.mock('./utils/fileUtils').writeFile
const writeFile = require('./utils/fileUtils').writeFile
writeFile.mockImplementation(n => {
  if (n === 'pants-HTML') {
    return of('pants-success')
  }
})

jest.mock('./createNoteHTMLPage')
const createHTML = require('./createNoteHTMLPage')
createHTML.mockImplementation(n => `${n}-HTML`)

const subject = require('./createNotePage')
describe('generating the HTML and saving it', () => {
  test('running subject', done => {
    subject('pants')
      .run()
      .listen({
        onResolved: t => {
          expect(t).toEqual('pants-success')
          done()
        }
      })
  })

})
