const R = require('ramda')
const { readFile } = require('./utils/fileUtils')
const { task, of } = require('folktale/concurrency/task')

var config = null

function getConfig(prop) {
  if (config) {
    return of(R.prop(prop, config))
  } else {
    return readFile('./config.json')
      .map(JSON.parse)
      .map(function _saveConfig(r) {
        config = r
        return r
      })
      .map(function returnProp(r) {
        return R.prop(prop, r)
      })
  }
}

module.exports = getConfig
