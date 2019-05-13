import R from 'ramda'
import { createCleanPath } from './utils/fileUtils.js'
import renderWith from './utils/renderWith.js'
import getConfig from './readconfig.js'

function logger(r) {
  console.log('src/createNoteHTMLPage.js:', r)
  return r
}

const notebooklens = R.lensPath(['notedata', 'note', 'meta', 'title'])
const tiltelens = R.lensPath(['notedata', 'nbook', 'name'])

function createFilePath(data, distpath) {
  return R.compose(
    R.objOf('path'),
    R.concat(distpath),
    R.concat('/'),
    R.concat(R.__, '.html'),
    R.replace(/-$/g, ''),
    R.replace(/-{2,}/g, '-'),
    r => R.concat(R.view(tiltelens, r), R.view(notebooklens, r)),
    R.over(notebooklens, R.concat('/')),
    R.over(notebooklens, createCleanPath),
    R.over(tiltelens, createCleanPath)
  )(data)
}

function createPath(data) {
  return getConfig('dist')
    .map(R.curryN(2, createFilePath)(data))
    .map(R.mergeDeepLeft(data))
}

export default function prepareFile(data) {
  return createPath(data)
    .chain(renderWith('generateNoteHTML.js'))
}
