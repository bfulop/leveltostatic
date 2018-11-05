const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const createHTML = require('./createNoteHTMLPage')
const writeFile = require('./utils/fileUtils').writeFile

const createPage = noteObj => of(createHTML(noteObj))
.chain(writeFile)

module.exports = createPage
