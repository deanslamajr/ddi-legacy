import { Component, Fragment } from 'react'

import LoadSpinner from '../components/LoadSpinner'
import { MobileViewportSettings } from '../components/Layouts'

import { Router } from '../routes'

//
// MainMenu
class MainMenu extends Component {
  componentDidMount () {
    Router.pushRoute('/gallery')
  }

  render () {
    return (
      <Fragment>
        <MobileViewportSettings />
        <LoadSpinner/>
      </Fragment>
    )
  }
}

export default MainMenu 