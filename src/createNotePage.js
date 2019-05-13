import Task from 'folktale/concurrency/task/index.js'
const { of } = Task
import createHTML from './createNoteHTMLPage.js'
import { writeFile } from './utils/fileUtils.js'

export default function createPage(noteObj) {
  return createHTML(noteObj).chain(writeFile)
}
