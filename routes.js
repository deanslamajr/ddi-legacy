const routes = require('next-routes')

module.exports = routes()
  .add('cell', '/cell/:cellId', 'cell')
  .add('comic', '/comic/:comicId', 'comic')
  .add('studio', '/studio/:comicId/:cellId', 'studio')