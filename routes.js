const routes = require('next-routes')

module.exports = routes()
  .add('cell', '/i/:cellId', 'i')
  .add('studio', '/studio/:cellId', 'studio')