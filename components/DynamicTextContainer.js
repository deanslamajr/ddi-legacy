import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'

import { media } from '../helpers/style-utils'

const Container = styled.div`
  font-size: ${props => props.fontSize}px;
  font-family: 'Open Sans', sans-serif;
  background: ${props => props.theme.colors.white};
  padding: .25vw;
  line-height: 1;
  overflow-wrap: break-word;

  ${media.phoneMax`
    padding: 1vw;
  `}
`

// Adapted from https://github.com/bond-agency/react-flowtype/blob/master/src/index.js
export class DynamicTextContainer extends React.Component {
  componentDidMount () {
    this.updateSettings()
    this.updateWidthFont()
    window.addEventListener('resize', this.updateWidthFont)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWidthFont)
  }

  updateSettings = () => {
    this.settings = {
      maximum: this.props.maximum || 9999,
      minimum: this.props.minimum || 1,
      maxFont: this.props.maxFont || 9999,
      minFont: this.props.minFont || 1,
      fontRatio: this.props.fontRatio
    }
  }

  updateWidthFont = () => {
    this.elemWidth = this.container.offsetWidth
    this.updateFontSize()
  }

  updateFontSize = () => {
    let settings = this.settings
    let elw = this.elemWidth
    let width = elw > settings.maximum ? settings.maximum : elw < settings.minimum ? settings.minimum : elw
    let fontBase = width / settings.fontRatio
    let fontSize = fontBase > settings.maxFont ? settings.maxFont : fontBase < settings.minFont ? settings.minFont : fontBase
    fontSize = Math.round(fontSize)
    this.setState({fontSize: fontSize})
  }

  render () {
    let fontSize = this.state && this.state.fontSize

    if (isNaN(fontSize)) {
      fontSize = this.props.default || null
    }

    return (
      <Container fontSize={fontSize} ref={container => this.container = container}>
        <Head>
          <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet"></link>
        </Head>
        {this.props.children}
      </Container>
    )
  }
}