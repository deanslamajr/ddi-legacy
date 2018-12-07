const withCSS = require('@zeit/next-css')

const { clientEnvironment, serverEnvironment } = require('./server/env-config')

// CSS
const cssConfigs = withCSS()

// Environment variables
const envConfigs = {
  // Will only be available on the server side
  serverRuntimeConfig: serverEnvironment,
  // Will be available on both server and client
  publicRuntimeConfig: clientEnvironment
}

module.exports = Object.assign({}, cssConfigs, envConfigs)