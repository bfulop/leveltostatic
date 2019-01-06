const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')

const db = levelup(encode(leveldown('./quiverdb'), { valueEncoding: 'json' }))

const getDb = () => db

module.exports = getDb
