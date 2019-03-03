import App, { Container } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import getConfig from 'next/config'

import theme from '../helpers/theme'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import LoadSpinner from '../components/LoadSpinner'

const { publicRuntimeConfig } = getConfig()

class MyApp extends App {
  state = {
    showSpinner: true
  }

  hideSpinner = () => {
    this.setState({ showSpinner: false })
  }

  showSpinner = () => {
    this.setState({ showSpinner: true })
  }

  render () {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <Head>
          <title>DrawDrawInk</title>
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

        <MobileViewportSettings />
        <GrayBackground />

        {this.state.showSpinner && <LoadSpinner/>}

        <ThemeProvider theme={theme}>
          <Component
            hideSpinner={this.hideSpinner}
            showSpinner={this.showSpinner}
            {...pageProps}
          />
        </ThemeProvider>
      </Container>
    )
  }
}

export default MyApp