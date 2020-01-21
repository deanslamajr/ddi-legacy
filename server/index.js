require('newrelic') // must be first line of app
const express = require('express')
const next = require('next')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cluster = require('cluster')

const handleUserSession = require('./middleware/userSession')
const api = require('./controllers')
const routes = require('../routes')
const { serverEnvironment } = require('./env-config')

const port = parseInt(serverEnvironment.PORT, 10) || 3000

const dev = serverEnvironment.NODE_ENV !== 'production'
const app = next({ dev })
const handler = routes.getRequestHandler(app)

const server = express()

const setUpApp = () => {
  // if in production envs
  // only allow https connections
  // http://blog.lookfar.com/blog/2017/07/19/how-to-https-all-the-things-in-node/
  if (process.env.NODE_ENV === 'production') {
    server.enable('trust proxy');

    server.use(function(req, res, next){
      // load balancer will add this header to normal requests
      // health check requests won't have this header
      // consequently, we allow requests that don't have the header
      // so that health check passes
      if (req.header('x-forwarded-proto') === 'http') {
        res.redirect('https://' + req.header('host') + req.url);
      } else{
        next();
      }
    })
  }

  server.use(bodyParser.json())
  server.use(cookieParser())

  // setup session cookie
  server.use(cookieSession({
    secret: serverEnvironment.COOKIE_SECRET,
    expires: new Date(253402300000000)  // Approximately Friday, 31 Dec 9999 23:59:59 GMT
  }))

  server.use(handleUserSession)

  server.use('/api', api)

  // In production we only want to serve source maps to Sentry.io requests
  server.get(/\.map/, (req, res, next) => {
    const token = serverEnvironment.SENTRY_SOURCEMAPS_TOKEN;
    if (!dev && !!token && req.headers['x-sentry-token'] !== token) {
      return res.status(401)
        .send('Authentication access token is required to access the source map.');
    }

    next();
  })

  server.use('/', express.static(__dirname + '/../static'));

  server.use(handler)

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
}

/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
const setupWorkerProcesses = () => {
  // to read number of cores on system
  let numCores = require('os').cpus().length
  console.log('Master cluster setting up ' + numCores + ' workers')

  // iterate on number of cores need to be utilized by an application
  // current example will utilize all of them
  for(let i = 0; i < numCores; i++) {
    // creating workers and pushing reference in an array
    // these references can be used to receive messages from workers
    const worker = cluster.fork()

    // to receive messages from worker process
    worker.on('message', message => {
      console.log(message)
    })
  }

  // process is clustered on a core and process id is assigned
  cluster.on('online', worker => {
    console.log('Worker ' + worker.process.pid + ' is listening')
  })

  // if any of the worker process dies then start a new one by simply forking another one
  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
    console.log('Starting a new worker')
    
    const newWorker = cluster.fork()

    // to receive messages from worker process
    newWorker.on('message', message => {
      console.log(message)
    })
  })
}

/**
 * Setup server either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */
const setupServer = (isClusterRequired) => {
  // if it is a master process then call setting up worker process
  if (isClusterRequired && cluster.isMaster) {
    setupWorkerProcesses()
  } else {
    // to setup server configurations and share port address for incoming requests
    setUpApp()
  }
}

app.prepare()
  .then(() => {
    setupServer(!dev)
  })