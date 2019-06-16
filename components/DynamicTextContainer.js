import React from 'react'
import styled from 'styled-components'

import { media } from '../helpers/style-utils'

const Container = styled.div`
  font-size: ${props => props.fontSize}px;
  background: ${props => props.theme.colors.white};
  margin-top: -4px;

  line-height: 1;

  padding: 0 .3rem .062rem .3rem;
  overflow-wrap: break-word;

  ${media.phoneMax`
    margin-top: -5px;
    /* padding: .1rem .35rem; */
    /* padding: .15rem .3rem; */
    padding: 1% 2%;
  `}
`

export class DynamicTextContainer extends React.Component {
  componentDidMount () {
    this.updateSettings()
    this.updateWidthFont()
    window.addEventListener('resize', this.updateWidthFont)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWidthFont)
  }

  // componentWillReceiveProps () {
  //   this.updateSettings()
  //   this.updateFontSize()
  // }

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

    //let divStyle = (fontSize) ? {'fontSize': fontSize + 'px'} : {}

    return (
      <Container fontSize={fontSize} ref={container => this.container = container}>
        {this.props.children}
      </Container>
    )
  }
}


// DynamicTextContainer.propTypes = {
//   default: PropTypes.number,
//   fontRatio: PropTypes.number.isRequired,
//   maximum: PropTypes.number,
//   minimum: PropTypes.number,
//   minFont: PropTypes.number,
//   maxFont: PropTypes.number
// }