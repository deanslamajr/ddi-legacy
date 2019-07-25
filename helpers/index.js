import getConfig from 'next/config'
import { Router } from '../routes'

const { publicRuntimeConfig } = getConfig()

export const getApi = (path, prependHost = false) => prependHost
  ? `${publicRuntimeConfig.HOST}${path}`
  : path

// assumes upstream middleware parses cookies onto req e.g. cookie-parser
export const forwardCookies = (req) => {
  let options = {}

  if (req && req.cookies) {
    const cookieString = Object.keys(req.cookies).reduce((headerString, key) => {
      return `${headerString}${key}=${req.cookies[key]};`
    }, '')

    options = {
      headers: {
          Cookie: cookieString
      }
    }
  }

  return options
}

export function redirect(url, res) {
  if (res) {
    res.writeHead(302, {
      Location: url
    })
    res.end()
  } else {
    Router.pushRoute(url);
  }
}

export function sortByOrder ({ order: orderA }, { order: orderB }) {
  if (orderA === null && orderB === null) {
    return -1
  }
  else if (orderA === null) {
    return -1
  }
  else if (orderB === null) {
    return 1
  }
  return orderA - orderB;
}

export function getCellUrl(imageUrl, schemaVersion) {
  return schemaVersion >= 3
    ? `https://${publicRuntimeConfig.CELL_IMAGES_DOMAIN}/${imageUrl}`
    : imageUrl;
}