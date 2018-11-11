const level = require('level')

const createDB = () => {
  console.log('**************')
  console.log('requesting db')
  return level('./testdb')
}
module.exports = createDB
