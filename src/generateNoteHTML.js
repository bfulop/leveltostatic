const createHMTL = pageObj => `<html>
  <body>
    <h1>${pageObj.note.meta.title}</h1>
  </body>
</html>`

module.exports = createHMTL
