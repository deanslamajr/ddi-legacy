import getConfig from 'next/config'
import { Router } from '../routes'

const { publicRuntimeConfig } = getConfig()

export const getApi = (path, prependHost = false) =>
  prependHost ? `${publicRuntimeConfig.HOST}${path}` : path

// assumes upstream middleware parses cookies onto req e.g. cookie-parser
export const forwardCookies = (req) => {
  let options = {}

  if (req && req.cookies) {
    const cookieString = Object.keys(req.cookies).reduce(
      (headerString, key) => {
        return `${headerString}${key}=${req.cookies[key]};`
      },
      ''
    )

    options = {
      headers: {
        Cookie: cookieString,
      },
    }
  }

  return options
}

export function redirect(url, res) {
  if (res) {
    res.writeHead(302, {
      Location: url,
    })
    res.end()
  } else {
    Router.pushRoute(url)
  }
}
