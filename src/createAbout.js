import R from 'ramda'
import { writeFile } from './utils/fileUtils.js'
import renderWith from './utils/renderWith.js'
import getConfig from './readconfig.js'

function logger(r){
  console.log('src/createAbout.js:', r)
  return r
}

export default function createAbout() {
  return renderWith('generateAboutHTML.js', null)
    .chain(function addPath(data) {
      return getConfig('dist')
        .map(R.concat(R.__, '/about.html'))
        .map(function assocpath(p){
          return R.assoc('path', p, data)
        })
    })
    .chain(writeFile)
}
