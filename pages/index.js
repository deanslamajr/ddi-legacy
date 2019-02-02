import { Component } from 'react'
import styled from 'styled-components'

import { Router } from '../routes'

//
// Styled Components
//
const LoadSpinner = styled.div`
  z-index: 999999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.5);
`

//
// MainMenu
class MainMenu extends Component {
  componentDidMount () {
    Router.pushRoute('/gallery')
  }

  render () {
    return (
      <div>
        <LoadSpinner>TACO</LoadSpinner>
      </div>
    )
  }
}

export default MainMenu 