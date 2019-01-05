const express = require('express')
const next = require('next')
//const multer = require('multer')
//const upload = multer()//{ dest: 'uploads/' })

const { save: saveCell } = require('./controllers/cell')
const { sign } = require('./controllers/sign')

const { serverEnvironment } = require('./env-config')

const port = parseInt(serverEnvironment.PORT, 10) || 3000

const dev = serverEnvironment.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    // create a new cell - save image to s3 and save metadata to redis?
    //server.post('/cell', upload.single('file'), saveCell)

    server.get('/sign', sign)

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })