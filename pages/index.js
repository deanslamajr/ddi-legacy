import { Component } from 'react'

import LoadSpinner from '../components/LoadSpinner'

import { Router } from '../routes'

//
// MainMenu
class MainMenu extends Component {
  componentDidMount () {
    Router.pushRoute('/gallery')
  }

  render () {
    return <LoadSpinner/>
  }
}

export default MainMenu 