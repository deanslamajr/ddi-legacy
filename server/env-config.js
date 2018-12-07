// environment variables
require('dotenv').config()

const clientEnvironment = {
}

const serverSecrets = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
}

const serverEnvironment = Object.assign({}, clientEnvironment, serverSecrets)

module.exports = {
  serverEnvironment,
  serverSecrets,
  clientEnvironment
}