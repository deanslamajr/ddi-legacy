import {Component} from 'react';

import { Router } from '../../routes'
import {
  NavButton, BOTTOM_LEFT, BOTTOM_RIGHT
} from '../../components/navigation'

class DraftsRoute extends Component {
  state = {
    draftComics: []
  }

  static async getInitialProps ({ query, req, res }) {
    // const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req));
    return {}
  }

  componentDidMount () {
    //@TODO fetch comics from client cache and add to state
    const {getComics} = require('../../helpers/clientCache');
    const comics = getComics();

    if (comics && Object.keys(comics).length) {
      const draftComics = Object.values(comics);
      this.setState({draftComics}, () => this.props.hideSpinner())
    } else {
      Router.pushRoute('/s/cell/new');
    }
  }

  navigateToGallery = () => {
    this.props.showSpinner();
    Router.pushRoute('/gallery');
  }

  navigateToNewComic = () => {
    this.props.showSpinner();
    Router.pushRoute('/s/cell/new');
  }

  navigateToDraft = (comicUrlId) => {
    this.props.showSpinner();
    Router.pushRoute(`/s/comic/${comicUrlId}`);
  }

  render () {   
    return (
      <div>
        DRAFTS
        <br/>
        {this.state.draftComics.map(comic => (
          <div
            key={comic.urlId}
            onClick={() => this.navigateToDraft(comic.urlId)}
          >{JSON.stringify(comic)}</div>)
        )}
        <NavButton
          value='GALLERY'
          cb={this.navigateToGallery}
          position={BOTTOM_LEFT}
        />
        <NavButton
          accented
          value='NEW COMIC'
          cb={this.navigateToNewComic}
          position={BOTTOM_RIGHT}
        />
      </div>
    )
  }
}

export default DraftsRoute