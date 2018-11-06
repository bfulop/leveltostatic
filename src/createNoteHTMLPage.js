const R = require('ramda')
const generateNoteHTML = require('./generateNoteHTML')
const { writeFile } = require('./utils/fileUtils')

const logger = r => {
  console.log('r', r)
  return r
}
// const createNoteHTML = notedata => 'htmlcontent'
const generateHMTL = R.path(['notedata', 'content'])
const createNoteHTML = R.ap(R.mergeDeepLeft, R.compose(R.objOf('html'), generateNoteHTML))

const getPath = R.compose(R.objOf('path'), R.path(['notedata', 'meta', 'title']))
const createPath = R.ap(R.mergeDeepLeft, getPath)


const createPage = R.compose(
  writeFile,
  r => [R.prop('path', r), R.prop('html', r)],
  logger,
  createNoteHTML,
  createPath
)

module.exports = createPage
