const createHMTL = ({ siblings, notebooks, notedata }) => `<html>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${notedata.note.meta.title}</title>
  </head>
    <h1>${notedata.note.meta.title}</h1>
    ${siblings.map(n => n.title)}
    <br>
    ${notebooks.map(n => n.name)}
  </body>
</html>`

module.exports = createHMTL
