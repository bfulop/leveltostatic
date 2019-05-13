import R from 'ramda'
import F from 'folktale'
const  of  = F.concurrency.task
import { getNoteBooks } from './listNoteBooks.js'
import createHTML from '../../templates/generateIndexHTML.js'
import { writeFile } from './utils/fileUtils.js'
import { latestNotes } from './listNotes.js'
import { processtags } from './tagsHierarchy.js'

export default function createIndex() {
  return R.traverse(of, R.identity, [
    getNoteBooks(),
    latestNotes(10),
    processtags()
  ])
    .map(R.zipObj(['notebooks', 'latestnotes', 'tags']))
    .map(r => createHTML(r))
    .map(
      R.compose(
        R.assoc('path', './dist/index.html'),
        R.objOf('html')
      )
    )
    .chain(writeFile)
}
