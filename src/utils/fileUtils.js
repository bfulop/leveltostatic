const R = require('ramda')
const fs = require('fs-extra')
const path = require('path')
const { task, fromPromised, of } = require('folktale/concurrency/task')

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

const writeFileToDisk = (filepath, contents) => task(r => {
  fs.outputFile(filepath, contents)
  .then(r.resolve)
  .catch(r.reject)
})

const ensureDirT = p => task(r => {
  fs.ensureDir(p)
  .then(r.resolve)
  .catch(r.reject)
})

const writeFile = ({ path, html }) => {
  debugger;
  // return of('done')
  return ensureDirT(R.replace(/(\w|-)+\.html/g, '', path)).chain(() => writeFileToDisk(path, html))
}
module.exports = { readFile, readDir, writeFile }
