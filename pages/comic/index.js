import Head from 'next/head'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { media } from '../../helpers/style-utils'
import sentry from '../../shared/sentry'
import Comic from './Comic'

import {
  NavButton,
  BOTTOM_LEFT,
  BOTTOM_RIGHT
} from '../../components/navigation'
import {CellPreviewMetaTags} from '../../components/CellPreviewMetaTags';

import { Router } from '../../routes'
import { getApi, forwardCookies, redirect } from '../../helpers';

import {APP_TITLE} from '../../config/constants.json';

const {captureException} = sentry();

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;

  ${media.desktopMin`
    margin: 4rem 10rem 5rem;
  `}
  ${media.phoneMax`
    margin: .2rem;
  `}
`

const CreateButton = styled(NavButton)`
  font-size: 2.5rem;
`

class ComicRoute extends Component {
  static async getInitialProps ({ query, req, res }) {
    let data;
    let comicIdIsValid = true;

    try{
      // destructuring syntax - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assignment_without_declaration
      ({ data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req)));
      if (!data.isActive) {
        throw new Error(`Comic with id:${query.comicId} does not exist.`);
      }
    }
    catch(error) {
      captureException(error);
      comicIdIsValid = false;
    }

    if (!comicIdIsValid) {
      redirect('/gallery', res);
      return {};
    }

    const initialCell = data.cells.find(({urlId}) => urlId === data.initialCellUrlId);

    return {
      cells: data.cells,
      comicId: query.comicId,
      initialCell: initialCell,
      title: data.title,
      userCanEdit: data.userCanEdit
    }
  }

  navigateToGallery = () => {
    this.props.showSpinner()
    Router.pushRoute('/gallery')
  }

  navigateToStudio = () => {
    this.props.showSpinner();
    Router.pushRoute(`/s/comic/${this.props.comicId}`);
  }

  componentDidMount () {
    this.props.hideSpinner()
  }

  render () {
    const {
      cells,
      initialCell,
      title,
      userCanEdit
    } = this.props

    return (
      <div>
        <Head>
          <title>{APP_TITLE} - {title ? `${title}` : 'Comic'}</title>
        </Head>
        <CellPreviewMetaTags
          title={title}
          caption={initialCell.caption || ' '}
          imageUrl={initialCell.imageUrl}
          schemaVersion={initialCell.schemaVersion}
        />

        <CenteredContainer>
          <Comic
            cells={cells}
            initialCellUrlId={initialCell.urlId}
            showSpinner={this.props.showSpinner}
            clickable
          />
        </CenteredContainer>

        {userCanEdit && <NavButton
          accented
          value='EDIT'
          cb={this.navigateToStudio}
          position={BOTTOM_RIGHT}
        />}

        <NavButton
          value='GALLERY'
          cb={this.navigateToGallery}
          position={BOTTOM_LEFT}
        />
      </div>
    )
  }
}

export default ComicRoute