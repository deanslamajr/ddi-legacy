// environment variables
require('dotenv').config()

const clientEnvironment = {
  HOST: fromProcessEnv('HOST')
}

function fromProcessEnv (name) {
  return process.env[name]
}

const serverSecrets = {
  PORT: fromProcessEnv('PORT'),
  NODE_ENV: fromProcessEnv('NODE_ENV'),
  AWS_ACCESS_KEY_ID: fromProcessEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: fromProcessEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_S3_BUCKET_NAME: fromProcessEnv('AWS_S3_BUCKET_NAME')
}

const serverEnvironment = Object.assign({}, clientEnvironment, serverSecrets)

module.exports = {
  serverEnvironment,
  serverSecrets,
  clientEnvironment
}