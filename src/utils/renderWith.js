import R from 'ramda'
import Task from 'folktale/concurrency/task/index.js'
const { task, of } = Task
import getConfig from '../readconfig.js'

function logger(r) {
  console.log('src/utils/renderWith.js:')
  console.log(r)
  return r
}

function renderWith(data, renderer) {
  return (
    getConfig('templates')
      .map(R.concat(R.__, '/'))
      .map(R.concat(R.__, renderer))
      .chain(function _importrender(r) {
        return task(function _runtask(resolver) {
          import(r)
            .then(function _gotRenderer(renderer) {
              resolver.resolve(renderer.default)
            })
            .catch(function _error(e) {
              resolver.reject(e)
            })
        })
      })
      .map(function dorender(renderer) {
        return renderer(data)
      })
      .map(function addtodata(r) {
        return R.assoc('html', r, data)
      })
  )
}

export default R.curryN(2, renderWith)
