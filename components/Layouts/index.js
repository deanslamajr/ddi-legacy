import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

const GrayBackground = createGlobalStyle`
  body {
    background-color: #e5e6ec
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