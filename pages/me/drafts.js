import {Component} from 'react';
import styled from 'styled-components'

import { Router } from '../../routes'
import {
  NavButton, BOTTOM_LEFT, BOTTOM_RIGHT
} from '../../components/navigation'
import Cell from '../../components/Cell'

import { generateCellImage } from '../../helpers/generateCellImageFromEmojis'

import {SCHEMA_VERSION} from '../../config/constants.json';

const CenteredCell = styled.div`
  display: flex;
  justify-content: center;
  margin: 1.5rem;
`;

class DraftsRoute extends Component {
  state = {
    draftComics: []
  }

  static async getInitialProps ({ query, req, res }) {
    // const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req));
    return {}
  }

  async componentDidMount () {
    //@TODO fetch comics from client cache and add to state
    const {getComics, getStudioState} = require('../../helpers/clientCache');
    const comics = getComics();

    if (comics && Object.keys(comics).length) {
      // drafts = [{
        // urlId: '',
        // initialCell: {
        //   urlId: '',
        //   studioState: {}
        // }
      // }]
      const draftComics = Object.values(comics).map(comic => {
        const studioState = getStudioState(comic.initialCellUrlId);

        return {
          urlId: comic.urlId,
          initialCell: {
            urlId: comic.initialCellUrlId,
            studioState
          }
        }
      })

      await Promise.all(
        draftComics.map(({initialCell}) => generateCellImage(initialCell))
      );

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
        <CenteredCell>DRAFTS</CenteredCell>

        {this.state.draftComics.map(({urlId: comicUrlId, initialCell: {imageUrl, studioState}}) => (
          <CenteredCell
            key={comicUrlId}
            onClick={() => this.navigateToDraft(comicUrlId)}
          >
            <Cell
              caption={studioState.caption}
              clickable
              imageUrl={imageUrl}
              isImageUrlAbsolute
              removeBorders
              schemaVersion={SCHEMA_VERSION}
              width="250px"
            />
          </CenteredCell>)
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