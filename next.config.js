const withCSS = require('@zeit/next-css')

// CSS
const cssConfigs = withCSS()

// environment variables
require('dotenv').config()
const envConfigs = {
  serverRuntimeConfig: { // Will only be available on the server side
    mySecret: process.env.SECRET
  },
  publicRuntimeConfig: { // Will be available on both server and client
    staticFolder: process.env.STATIC
  }
}

module.exports = Object.assign({}, cssConfigs, envConfigs)