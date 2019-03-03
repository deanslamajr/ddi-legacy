import App, { Container } from 'next/app'
import React from 'react'
import { ThemeProvider } from 'styled-components'

import theme from '../helpers/theme'

class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <Container>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Container>
    )
  }
}

export default MyApp