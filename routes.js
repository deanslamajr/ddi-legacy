const routes = require('next-routes')

module.exports = routes()
  .add('main')
  .add('studio', '/studio', 'index')
  .add('cell', '/i/:cellId', 'i') 