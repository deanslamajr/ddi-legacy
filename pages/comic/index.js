import Head from 'next/head'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { GrayBackground, MobileViewportSettings } from '../../components/Layouts'
import Comic from './Comic'
import {
  NavButton,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
  BLUE,
  GREEN
} from '../../components/navigation'

import { Router } from '../../routes'
import { getApi, forwardCookies } from '../../helpers'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  margin-top: 6rem;
`

class ComicRoute extends Component {
  state = {
  }

  static async getInitialProps ({ query, req }) {
    const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req))

    return {
      cells: data.cells,
      title: data.title,
      userCanEdit: data.userCanEdit
    }
  }

  navigateToGallery = () => {
    Router.push('/gallery')
  }

  navigateToStudio = () => {
    Router.push('/studio/new/new')
  }

  render () {
    const {
      cells,
      title
    } = this.props

    const imageUrl = cells && cells.length
      ? cells[0].imageUrl
      : ''
    
    return (
      <div>
        <MobileViewportSettings />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

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
        <GrayBackground />
        <CenteredContainer>
          <Comic
            cells={cells}
            clickable
          />
        </CenteredContainer>

        <NavButton
          value='GALLERY'
          color={BLUE}
          cb={this.navigateToGallery}
          position={BOTTOM_LEFT}
        />

        <NavButton
          value='CREATE'
          color={GREEN}
          cb={this.navigateToStudio}
          position={BOTTOM_RIGHT}
        />
      </div>
    )
  }
}

export default ComicRoute