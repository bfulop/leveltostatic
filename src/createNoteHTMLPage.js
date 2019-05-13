import R from 'ramda'
import generateNoteHTML from '../../templates/generateNoteHTML.js'
import { createCleanPath } from './utils/fileUtils.js'

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

const notebooklens = R.lensPath(['notedata', 'note', 'meta', 'title'])
const tiltelens = R.lensPath(['notedata', 'nbook', 'name'])

const createFilePath = R.compose(
  R.objOf('path'),
  R.concat('./dist/'),
  R.concat(R.__, '.html'),
  R.replace(/-$/g, ''),
  R.replace(/-{2,}/g, '-'),
  r => R.concat(R.view(tiltelens, r), R.view(notebooklens, r)),
  R.over(notebooklens, R.concat('/')),
  R.over(notebooklens, createCleanPath),
  R.over(tiltelens, createCleanPath)
)
const createPath = R.ap(R.mergeDeepLeft, createFilePath)

export default R.compose(
  createNoteHTML,
  createPath
)

