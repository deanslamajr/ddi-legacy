import { Component } from 'react'

import { DDI_APP_PAGES } from '../helpers/urls'
import { Router } from '../routes'

//
// MainMenu
class MainMenu extends Component {
  componentDidMount() {
    Router.pushRoute(DDI_APP_PAGES.getGalleryPageUrl())
  }

  render() {
    return null
  }
}

export default MainMenu
