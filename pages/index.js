import { Component } from 'react'

import { Router } from '../routes'

//
// MainMenu
class MainMenu extends Component {
  componentDidMount () {
    Router.pushRoute('/gallery')
  }

  render () {
    return null
  }
}

export default MainMenu 