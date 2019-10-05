const routes = require('next-routes')

// @see https://github.com/fridays/next-routes
// add(name, pattern, pageSubdirectory)
module.exports = routes()
  .add('cell', '/cell/:cellId', 'cell')
  .add('comic', '/comic/:comicId', 'comic')
  .add('studio', '/studio/:comicId/:cellId', 'studio')
  .add('comicStudio', '/s/comic/:comicUrlId', 's/comic')
  .add('cellStudio', '/s/cell/:cellUrlId', 's/cell')