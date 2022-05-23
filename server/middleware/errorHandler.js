const errorHandlerMiddleware = (error, req, res, next) => {
  const canUseHeaders = req.headers && typeof req.headers === 'object'
  const errorContext = {
    error: res.error ? res.error.message : error ? error.message : undefined,
    method: req.method,
    path: req.path,
    query: JSON.stringify(req.query),
    body: req.body,
    host: canUseHeaders ? req.header('host') : undefined,
    referer: canUseHeaders ? req.header('referer') : undefined,
    stack: res.error ? res.error.stack : error ? error.message : undefined,
  }

  const newrelic = require('newrelic')
  newrelic.noticeError(error, errorContext)
  console.error(error)
  res.status(500).send('Sorry, an unexpected error occurred.')
}

module.exports = errorHandlerMiddleware
