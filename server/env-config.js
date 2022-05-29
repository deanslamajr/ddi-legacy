// environment variables
require('dotenv').config()

const clientEnvironment = {
  HOST: fromProcessEnv('HOST'),
  FAVICON_ROOT_URL: fromProcessEnv('FAVICON_ROOT_URL'),
  ASSETS_ROOT_URL: fromProcessEnv('ASSETS_ROOT_URL'),
  GA_ID: fromProcessEnv('GA_ID'),
  CAPTCHA_V3_SITE_KEY: fromProcessEnv('CAPTCHA_V3_SITE_KEY'),
  CAPTCHA_V2_SITE_KEY: fromProcessEnv('CAPTCHA_V2_SITE_KEY'),
  CELL_IMAGES_DOMAIN: fromProcessEnv('CELL_IMAGES_DOMAIN'),
  DDIV2_URL_WITH_PROTOCOL: fromProcessEnv('DDIV2_URL_WITH_PROTOCOL'),
  TWITTER_HANDLE: fromProcessEnv('TWITTER_HANDLE'),
  GOOGLE_SITE_VERIFICATION: fromProcessEnv('GOOGLE_SITE_VERIFICATION'),
  NR_BROWSER_KEY: fromProcessEnv('NR_BROWSER_KEY'),
  NR_APP_ID_LEGACY_DDI_CLIENT: fromProcessEnv('NR_APP_ID_LEGACY_DDI_CLIENT'),
  NR_ACCOUNT_ID: fromProcessEnv('NR_ACCOUNT_ID'),
}

function fromProcessEnv(name) {
  return process.env[name]
}

const serverSecrets = {
  // app
  PORT: fromProcessEnv('PORT'),
  NODE_ENV: fromProcessEnv('NODE_ENV'),
  COOKIE_SECRET: fromProcessEnv('COOKIE_SECRET'),
  CAPTCHA_V3_SECRET: fromProcessEnv('CAPTCHA_V3_SECRET'),
  CAPTCHA_V2_SECRET: fromProcessEnv('CAPTCHA_V2_SECRET'),
  ENV: fromProcessEnv('ENV'),

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
  NR_LICENSE: fromProcessEnv('NR_LICENSE'),
}

const serverEnvironment = Object.assign({}, clientEnvironment, serverSecrets)

module.exports = {
  serverEnvironment,
  serverSecrets,
  clientEnvironment,
}
