const R = require('ramda')
const generateNoteHTML = require('./generateNoteHTML')
const { writeFile } = require('./utils/fileUtils')
const cleanSpecialChars = require('clean-special-chars')

const logger = r => {
  console.log('r', r)
  return r
}
const createNoteHTML = R.ap(
  R.mergeDeepLeft,
  R.compose(
    R.objOf('html'),
    generateNoteHTML
  )
)

const urlify = R.compose(R.replace(/\W/g, '-'), r => cleanSpecialChars(r, {'&': 'and'}))

const tiltelens = R.lensPath(['notedata', 'note', 'meta', 'title'])
const notebooklens = R.lensPath(['notedata', 'nbook', 'name'])

const createFilePath = R.compose(
  R.objOf('path'),
  R.concat(R.__, '.html'),
  R.replace(/-$/g, ''),
  R.replace(/-{2,}/g, '-'),
  r => R.concat(R.view(tiltelens, r), R.view(notebooklens, r)),
  R.over(notebooklens, R.concat('/')),
  R.over(notebooklens, urlify),
  R.over(tiltelens, urlify)
)

const createPage = R.compose(
  writeFile,
  createNoteHTML,
  createFilePath
)

module.exports = createPage
