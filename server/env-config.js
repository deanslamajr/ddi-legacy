// environment variables
require('dotenv').config()

const clientEnvironment = {
  HOST: fromProcessEnv('HOST'),
  FAVICON_ROOT_URL: fromProcessEnv('FAVICON_ROOT_URL'),
}

function fromProcessEnv (name) {
  return process.env[name]
}

const serverSecrets = {
  // app
  PORT: fromProcessEnv('PORT'),
  NODE_ENV: fromProcessEnv('NODE_ENV'),
  COOKIE_SECRET: fromProcessEnv('COOKIE_SECRET'),

  // AWS
  AWS_ACCESS_KEY_ID: fromProcessEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: fromProcessEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_S3_BUCKET_NAME: fromProcessEnv('AWS_S3_BUCKET_NAME'),
  // DB
  PGDB_DBNAME: fromProcessEnv('PGDB_DBNAME'),
  PGDB_USERNAME: fromProcessEnv('PGDB_USERNAME'),
  PGDB_PASSWORD: fromProcessEnv('PGDB_PASSWORD'),
  PGDB_HOST: fromProcessEnv('PGDB_HOST'),
  // NEWRELIC
  NR_APP_NAME: fromProcessEnv('NR_APP_NAME'),
  NR_LICENSE: fromProcessEnv('NR_LICENSE')
}

const serverEnvironment = Object.assign({}, clientEnvironment, serverSecrets)

module.exports = {
  serverEnvironment,
  serverSecrets,
  clientEnvironment
}