import R from 'ramda'
import Task from 'folktale/concurrency/task/index.js'
const { of } = Task
import { getNoteBooks } from './listNoteBooks.js'
import { writeFile } from './utils/fileUtils.js'
import { latestNotes } from './listNotes.js'
import { processtags } from './tagsHierarchy.js'
import { countnotes } from './countnotes.js'
import renderWith from './utils/renderWith.js'
import getConfig from './readconfig.js'

function logger(r) {
  console.log('src/createIndex.js:')
  console.log(r)
  return r
}

export default function createIndex() {
  return (
    R.traverse(of, R.identity, [countnotes(), getNoteBooks(), latestNotes(10), processtags()])
      .map(R.zipObj(['notescount', 'notebooks', 'latestnotes', 'tags']))
      .chain(renderWith('generateIndexHTML.js'))
      .chain(function addPath(d){
        return getConfig('dist')
        .map(R.concat(R.__, '/index.html'))
        .map(function merge(r) {
          return R.assoc('path', r, d)
        })
      })
      .chain(writeFile)
  )
}
