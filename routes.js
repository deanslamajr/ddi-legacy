const routes = require('next-routes')

module.exports = routes()
  .add('cell', '/cell/:cellId', 'cell')
  .add('studio', '/studio/:comicId/:cellId', 'studio')