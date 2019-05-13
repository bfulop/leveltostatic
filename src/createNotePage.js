import Task from 'folktale/concurrency/task/index.js'
const of = Task.of
import createHTML from './createNoteHTMLPage.js'
import { writeFile } from './utils/fileUtils.js'

export default function createPage(noteObj) {
  return of(createHTML(noteObj)).chain(writeFile)
}
