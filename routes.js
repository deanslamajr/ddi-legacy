const routes = require('next-routes')

module.exports = routes()
  .add('main')
  .add('cell', '/i/:cellId', 'i') 