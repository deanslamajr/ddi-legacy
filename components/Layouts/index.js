import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

const GrayBackground = createGlobalStyle`
  body {
    background-color: #C5D6D8
  }
`

function MobileViewportSettings () {
  return (<Head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </Head>)
}

export {
  GrayBackground,
  MobileViewportSettings
}