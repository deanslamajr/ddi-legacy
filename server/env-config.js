// environment variables
require('dotenv').config()

const clientEnvironment = {
  HOST: fromProcessEnv('HOST'),
  FAVICON_ROOT_URL: fromProcessEnv('FAVICON_ROOT_URL'),
  APP_URL_DOMAIN: fromProcessEnv('APP_URL_DOMAIN'),
  GA_ID: fromProcessEnv('GA_ID'),
  CAPTCHA_V3_SITE_KEY: fromProcessEnv('CAPTCHA_V3_SITE_KEY'),
  CAPTCHA_V2_SITE_KEY: fromProcessEnv('CAPTCHA_V2_SITE_KEY')
}

function fromProcessEnv (name) {
  return process.env[name]
}

const serverSecrets = {
  // app
  PORT: fromProcessEnv('PORT'),
  NODE_ENV: fromProcessEnv('NODE_ENV'),
  COOKIE_SECRET: fromProcessEnv('COOKIE_SECRET'),
  ASSETS_DOMAIN: fromProcessEnv('ASSETS_DOMAIN'),
  CAPTCHA_V3_SECRET: fromProcessEnv('CAPTCHA_V3_SECRET'),
  CAPTCHA_V2_SECRET: fromProcessEnv('CAPTCHA_V2_SECRET'),

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