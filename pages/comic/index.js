import Head from 'next/head'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { sortByOrder } from '../../helpers'
import { media } from '../../helpers/style-utils'
import Comic from './Comic'

import {
  NavButton,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT
} from '../../components/navigation'

import { Router } from '../../routes'
import { getApi, forwardCookies } from '../../helpers'

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
  static async getInitialProps ({ query, req }) {
    const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req))

    return {
      cells: data.cells,
      comicId: query.comicId,
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

  /**
   * not in use bc it doesn't seem to work on iOS safari
   */
  downloadCells = (e) => {
    const {cells, comicId} = this.props;

    e.preventDefault();

    cells.sort(sortByOrder).forEach(({imageUrl}, currentIndex) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', imageUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
          const urlCreator = window.URL || window.webkitURL;
          const href = urlCreator.createObjectURL(xhr.response);
          const tag = document.createElement('a');
          tag.href = href;
          tag.download = `${comicId}_${currentIndex + 1}of${cells.length}.png`;
          document.body.appendChild(tag);
          tag.click();
          document.body.removeChild(tag);
      }
      xhr.send();
    })
  }

  componentDidMount () {
    this.props.hideSpinner()
  }

  render () {
    const {
      cells,
      title,
      userCanEdit
    } = this.props

    const imageUrl = cells && cells.length
      ? cells[0].imageUrl
      : ''
    
    return (
      <div>
        <Head>
          <title>DrawDrawInk - {title ? `${title}` : 'Comic'}</title>
          {/* - iMessage/Messages https://developer.apple.com/library/archive/technotes/tn2444/_index.html
                * Images should be at least 900px in width
              - android app Messages
                * rectangular preview image. 900*350 seems to work here
                * 23 characters max for caption  */}
          <meta property="og:site_name" content="drawdrawink" />
          <meta property="og:title" content={title} />
          <meta property="og:image" content={imageUrl} />
          {/* The link preview generation will look for an apple-touch-icon, favicon, or one specified by <link rel="...">. 
              Icons should be square, and at least 108px per side. */}
          {/* <link rel="apple-touch-icon" href="https://www.link.to/icon/appIcon.png"> */}

          {/* - platforms: Twitter https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary.html */}
          <meta name="twitter:card" content={title} />
          {/* <meta name="twitter:site" content="@flickr" /> */}
          <meta name="twitter:title" content={title} />
          {/* <meta name="twitter:description" content="1 View the album on Flickr. 2 View the album on Flickr. 3 View the album on Flickr. 4 View the album on Flickr. 5 View the album on Flickr. 6 View the album on Flickr. 7 View the album on Flickr. 8 View the album on Flickr. 9 View the album on Flickr. 0 View the album on Flickr." /> */}
          {/* Images for this Card support an aspect ratio of 1:1 with minimum dimensions of 144x144 or maximum of 4096x4096 pixels. Images must be less than 5MB in size. The image will be cropped to a square on all platforms. JPG, PNG, WEBP and GIF formats are supported. Only the first frame of an animated GIF will be used. SVG is not supported  */}
          <meta name="twitter:image" content={imageUrl} />
        </Head>

        <CenteredContainer>
          <Comic
            cells={cells}
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