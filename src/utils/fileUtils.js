const fs = require('fs-extra')
const path = require('path')
const { task, fromPromised } = require('folktale/concurrency/task')

function readFile(filename) {
  return task(resolver =>
    fs.readFile(
      path.resolve(filename),
      'utf-8',
      (err, contents) =>
        err ? resolver.reject(err) : resolver.resolve(contents)
    )
  )
}

function readDir(dirpath) {
  return task(resolver =>
    fs.readdir(
      path.resolve(dirpath),
      'utf-8',
      (err, contents) =>
        err ? resolver.reject(err) : resolver.resolve(contents)
    )
  )
}

const writeFileToDisk = (filepath, contents) => {
  return task(resolver => {
    fr.writeFile(filepath, contents, 'utf8', err => {
      if (err) {
        resolver.reject('file not saved!')
        return
      }
      resolver.resolve(filepath + ' written')
    })
  })
}

const ensureFileT = fromPromised(fs.ensureFile)

const writeFile = ({ filepath, contents }) =>
  ensureFileT(filepath).chain(() => writeFileToDisk(filepath, contents))

module.exports = { readFile, readDir, writeFile }
