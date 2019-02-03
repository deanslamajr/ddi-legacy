const express = require('express')
const next = require('next')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')

const handleUserSession = require('./middleware/userSession')

const { sign } = require('./controllers/sign')
const {
  all: getCells,
  get: getCell,
  getParent,
  update: updateCell
} = require('./controllers/cell')

const routes = require('../routes')

const { serverEnvironment } = require('./env-config')

const port = parseInt(serverEnvironment.PORT, 10) || 3000

const dev = serverEnvironment.NODE_ENV !== 'production'
const app = next({ dev })
const handler = routes.getRequestHandler(app)

app.prepare()
  .then(() => {
    const server = express()

    server.use(bodyParser.json())

    // setup session cookie
    server.use(cookieSession({
      secret: serverEnvironment.COOKIE_SECRET,
      expires: new Date(253402300000000)  // Approximately Friday, 31 Dec 9999 23:59:59 GMT
    }))

    server.use(handleUserSession)

    // @todo namespace data endpoints with /api
    server.get('/sign', sign)
    server.get('/cell/:cellId/parent', getParent)
    server.get('/cell/:cellId', getCell)
    server.put('/cell/:cellId', updateCell)
    server.get('/cells', getCells)

    server.use(handler)

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })