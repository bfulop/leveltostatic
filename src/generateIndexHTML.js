const createHTML = ({ notebooks, latestnotes }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
 index 
 ${notebooks.map(n => n.name)}
 ${latestnotes.map(n => n.title)}
</body>
</html>`

module.exports = createHTML
