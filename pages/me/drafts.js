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

const DraftsContainer = styled.div` 
  margin: 1rem auto 5rem;
`

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
    const {getDirtyComics, getStudioState} = require('../../helpers/clientCache');
    const dirtyComics = getDirtyComics();

    if (dirtyComics && dirtyComics.length) {
      dirtyComics.sort((comicA, comicB) => {
        // Handle cases where lastModified doesn't exist on a cached comic
        if (!comicA.lastModified && !comicB.lastModified) {
          return 0;
        } else if (!comicA.lastModified) {
          return -1;
        } else if (!comicB.lastModified) {
          return 1;
        }

        return comicB.lastModified - comicA.lastModified;
      });

      const draftComics = dirtyComics.map(dirtyComic => {
        const studioState = getStudioState(dirtyComic.initialCellUrlId);

        return {
          urlId: dirtyComic.urlId,
          initialCell: {
            urlId: dirtyComic.initialCellUrlId,
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

        <DraftsContainer>
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
        </DraftsContainer>
        
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