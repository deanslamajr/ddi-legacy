import React from 'react'
import styled from 'styled-components'

import { media } from '../helpers/style-utils'

const MAX_WIDTH = 9999;
const MIN_WIDTH = 1;
const MAX_FONT_SIZE = 9999;
const MIN_FONT_SIZE = 1;

const Container = styled.div`
  display: ${props => props.fontSize ? 'inherit' : 'none'};
  font-size: ${props => props.fontSize}px;
  background: ${props => props.theme.colors.white};
  padding: .25vw;
  line-height: 1;
  overflow-wrap: break-word;

  ${media.phoneMax`
    padding: 1vw;
  `}
`

function calculateFontSize(elemWidth, fontRatio) {
  const width = elemWidth > MAX_WIDTH
    ? MAX_WIDTH
    : elemWidth < MIN_WIDTH
      ? MIN_WIDTH
      : elemWidth;
  const fontBase = width / fontRatio;
  const fontSize = fontBase > MAX_FONT_SIZE
    ? MAX_FONT_SIZE
    : fontBase < MIN_FONT_SIZE
      ? MIN_FONT_SIZE : fontBase;
  return Math.round(fontSize)
}

// Adapted from https://github.com/bond-agency/react-flowtype/blob/master/src/index.js
export class DynamicTextContainer extends React.Component {
  state = {
    fontSize: null
  }
  
  componentDidMount () {
    if (this.container) {
      this.setFontSize();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.container && (
        this.container.offsetWidth !== prevState.elemWidth ||
        this.props.fontRatio !== prevProps.fontRatio
      )
    ) {
      this.setFontSize();
    }
  }

  setFontSize = () => {
    const elemWidth = this.container.offsetWidth;
    const fontSize = calculateFontSize(elemWidth, this.props.fontRatio);

    this.setState({
      elemWidth,
      fontSize
    });
  }

  render () {
    return (
      <Container fontSize={this.state.fontSize} ref={container => this.container = container}>
        {this.props.children}
      </Container>
    )
  }
}