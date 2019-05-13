import R from 'ramda'
import F from 'folktale'
const { of } = F.concurrency
import createHTML from '../../templates/generateAboutHTML.js'
import { writeFile } from './utils/fileUtils.js'

export default function createAbout() {
  return of(R.objOf('html', createHTML()))
    .map(R.assoc('path', './dist/about.html'))
    .chain(writeFile)
}
