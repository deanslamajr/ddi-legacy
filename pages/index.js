import { Component } from 'react'

import { DDI_APP_PAGES } from '../helpers/urls'
import { Router } from '../routes'

//
// MainMenu
class MainMenu extends Component {
  componentDidMount() {
    window.location.replace(DDI_APP_PAGES.getGalleryPageUrl())
  }

  render() {
    return null
  }
}

export default MainMenu
