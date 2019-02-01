const express = require('express')
const next = require('next')

const { sign } = require('./controllers/sign')
const { all: getCells, get: getCell } = require('./controllers/cell')

const routes = require('../routes')

const { serverEnvironment } = require('./env-config')

const port = parseInt(serverEnvironment.PORT, 10) || 3000

const dev = serverEnvironment.NODE_ENV !== 'production'
const app = next({ dev })
const handler = routes.getRequestHandler(app)

app.prepare()
  .then(() => {
    const server = express()

    // @todo namespace data endpoints with /api
    server.get('/sign', sign)
    server.get('/cell/:cellId', getCell)
    server.get('/cells', getCells)

    server.use(handler)

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })