const level = require('level')

const db = level('./quiverdb')
const createDB = () => db

module.exports = createDB
