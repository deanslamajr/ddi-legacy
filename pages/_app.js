import App, { Container } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

import theme from '../helpers/theme'

class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/apple-touch-icon.png`}/>
          <link rel="icon" type="image/png" sizes="32x32" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon-32x32.png`}/>
          <link rel="icon" type="image/png" sizes="16x16" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon-16x16.png`}/>
          <link rel="manifest" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/site.webmanifest`}/>
          <link rel="mask-icon" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/safari-pinned-tab.svg`} color="#5bbad5"/>
          <link rel="shortcut icon" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon.ico`}/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="msapplication-config" content={`${publicRuntimeConfig.FAVICON_ROOT_URL}/browserconfig.xml`}/>
          <meta name="theme-color" content="#ffffff"/>
        </Head>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Container>
    )
  }
}

export default MyApp