import { createGlobalStyle } from 'styled-components'
import Head from 'next/head'

import theme from '../../helpers/theme'
import {media} from '../../helpers/style-utils'

const GrayBackground = createGlobalStyle`
  body {
    background-color: ${theme.colors.lightGray};
    margin: 0;
    color: ${theme.colors.black};

    ${media.phoneMax`
      overflow-x: hidden;
    `}
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