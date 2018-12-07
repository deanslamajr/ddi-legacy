// environment variables
require('dotenv').config()

const clientEnvironment = {
  CLIENT1: process.env.CLIENT1
}

const serverSecrets = {
  SERVER1: process.env.SERVER1,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
}

const serverEnvironment = Object.assign({}, clientEnvironment, serverSecrets)

module.exports = {
  serverEnvironment,
  serverSecrets,
  clientEnvironment
}