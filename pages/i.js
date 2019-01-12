import Head from 'next/head'
import { withRouter } from 'next/router'
import { Component } from 'react'
import styled from 'styled-components'
import getConfig from 'next/config'
import axios from 'axios'

import { GrayBackground } from '../components/Layouts'
import { getApi } from '../helpers'

// Environment variables
// @see {@link https://nextjs.org/docs/#exposing-configuration-to-the-server--client-side}
const { publicRuntimeConfig } = getConfig()

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

class ImageRoute extends Component {
  state = {
  }

  static async getInitialProps ({ query, req }) {
    const { data } = await axios.get(getApi(`/cell/${query.cellId}`, req))
    return { imageUrl: data.image_url }
  }

  render () {
    const { 
      imageUrl,
      router } = this.props
    const v = router.query.v || '0'
    
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          {/* - iMessage/Messages https://developer.apple.com/library/archive/technotes/tn2444/_index.html
                * Images should be at least 900px in width
              - android app Messages
                * rectangular preview image. 900*350 seems to work here
                * 23 characters max for caption  */}
          <meta property="og:site_name" content="drawdrawink" />
          <meta property="og:title" content="A0 12 34 56 78 9B 01 23 45 67 89 C0 12 34 56 78 9D 01 23 45 67 89 E0 12 34 56 78 9F 01 23 45 67 89 G0 12 34 56 78 9H 01 23 45 67 89 I0 12 34 56 78 9J 01 23 45 67 89 K0 12 34 56 78 9" />
          <meta property="og:image" content={imageUrl} />
          {/* The link preview generation will look for an apple-touch-icon, favicon, or one specified by <link rel="...">. 
              Icons should be square, and at least 108px per side. */}
          {/* <link rel="apple-touch-icon" href="https://www.link.to/icon/appIcon.png"> */}

          {/* - platforms: Twitter https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary.html */}
          <meta name="twitter:card" content="summary" />
          {/* <meta name="twitter:site" content="@flickr" /> */}
          <meta name="twitter:title" content="A0 12 34 56 78 9B 01 23 45 67 89 C0 12 34 56 78 9D 01 23 45 67 89 E0 12 34 56 78 9F 01 23 45 67 89 G0 12 34 56 78 9H 01 23 45 67 89 I0 12 34 56 78 9J 01 23 45 67 89 K0 12 34 56 78 9" />
          {/* <meta name="twitter:description" content="1 View the album on Flickr. 2 View the album on Flickr. 3 View the album on Flickr. 4 View the album on Flickr. 5 View the album on Flickr. 6 View the album on Flickr. 7 View the album on Flickr. 8 View the album on Flickr. 9 View the album on Flickr. 0 View the album on Flickr." /> */}
          {/* Images for this Card support an aspect ratio of 1:1 with minimum dimensions of 144x144 or maximum of 4096x4096 pixels. Images must be less than 5MB in size. The image will be cropped to a square on all platforms. JPG, PNG, WEBP and GIF formats are supported. Only the first frame of an animated GIF will be used. SVG is not supported  */}
          <meta name="twitter:image" content={imageUrl} />
        </Head>
        <GrayBackground />
        <CenteredContainer>
          <img src={imageUrl} />
        </CenteredContainer>
      </div>
    )
  }
}

export default withRouter(ImageRoute) 