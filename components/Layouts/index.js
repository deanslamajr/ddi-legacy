import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

import theme from '../../helpers/theme'

const GrayBackground = createGlobalStyle`
  body {
    background-color: ${theme.colors.gray3};
    margin: 0;
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