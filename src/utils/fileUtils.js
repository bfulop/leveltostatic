import R from 'ramda'
import task from 'folktale/concurrency/task/task.js'
import fs from 'fs-extra'
import path from 'path'
import cleanSpecialChars from 'clean-special-chars'

function readFile(filename) {
  return task(function readtask(resolver) {
    return fs.readFile(path.resolve(filename), 'utf-8', function _readfile(
      err,
      contents
    ) {
      err ? resolver.reject(err) : resolver.resolve(contents)
    })
  })
}

function readDir(dirpath) {
  return task(resolver =>
    fs.readdir(path.resolve(dirpath), 'utf-8', (err, contents) =>
      err ? resolver.reject(err) : resolver.resolve(contents)
    )
  )
}

const writeFileToDisk = (filepath, contents) =>
  task(r => {
    fs.outputFile(filepath, contents)
      .then(r.resolve)
      .catch(r.reject)
  })

const ensureDirT = p =>
  task(r => {
    fs.ensureDir(p)
      .then(r.resolve)
      .catch(r.reject)
  })

const writeFile = ({ path, html }) =>
  ensureDirT(R.replace(/(\w|-)+\.html/g, '', path)).chain(() =>
    writeFileToDisk(path, html)
  )

const createCleanPath = R.compose(
  R.replace(/-{2,}/g, '-'),
  R.replace(/\W/g, '-'),
  r => cleanSpecialChars(r, { '&': 'and' })
)

export { readFile, readDir, writeFile, createCleanPath }
