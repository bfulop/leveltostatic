const db = require('./getdb')
let counta = 0
db.createReadStream({gt:'notebooks:', lt:'notebooks:~'})
.on('data', d => {
  counta++
  console.log(d)
})
.on('end', () => {console.log('stream ended', counta)})
