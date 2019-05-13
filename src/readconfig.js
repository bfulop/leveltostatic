import R from 'ramda'
import { readFile } from './utils/fileUtils.js'
import F from 'folktale'
const {
  concurrency: { of }
} = F

var config = null

export default function getConfig(prop) {
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

