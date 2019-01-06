import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const getApi = (path, prependHost = false) => prependHost
  ? `${publicRuntimeConfig.HOST}${path}`
  : path