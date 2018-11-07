const fs = require('fs')
const path = require('path')
const { task } = require('folktale/concurrency/task')

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

const mkdir = path => {
  return task(resolver => {
    fs.mkdir(path.replace(/\/\w+\.html$/g, ''), { recursive: true }, err => {
      if (err) {
        resolver.reject('file not saved!')
        return
      }
      resolver.resolve(path)
    })
  })
}

const writeFile = ({ filepath, contents }) =>
  mkdir(filepath).chain(() => writeFileToDisk(filepath, contents))

module.exports = { readFile, readDir, writeFile }
