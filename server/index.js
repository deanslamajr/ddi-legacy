const express = require('express')
const next = require('next')

const { sign } = require('./controllers/sign')

const { serverEnvironment } = require('./env-config')

const port = parseInt(serverEnvironment.PORT, 10) || 3000

const dev = serverEnvironment.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.get('/sign', sign)

    /**
     * TESTING ONLY
     * please remove
     */
    server.get('/taco', (req, res) => {
      res.write(JSON.stringify({ taco: __filename }))
      res.end()
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })