const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const createHTML = require('../../templates/generateAboutHTML')
const { writeFile } = require('./utils/fileUtils')

const createAbout = () =>
  of(R.objOf('html', createHTML()))
    .map(R.assoc('paht', '../dist/about.html'))
    .chain(writeFile)

module.exports = createAbout
