const express = require('express')
const next = require('next')

const getConfig = require('next/config')

const {serverRuntimeConfig, publicRuntimeConfig} = getConfig()

console.log() // Will only be available on the server side
console.log(publicRuntimeConfig.staticFolder)

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    // create a new cell - save image to s3 and save metadata to redis?
    server.post('/cell', (req, res) => {
      return res.status(200).json({ data: {
        secret: serverRuntimeConfig.mySecret,
        static: publicRuntimeConfig.staticFolder
      } })
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })