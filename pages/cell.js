import Head from 'next/head'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Cell from '../components/Cell'
import {
  NavButton,
  BOTTOM_LEFT,
  BOTTOM_RIGHT
} from '../components/navigation'
import {CellPreviewMetaTags} from '../components/CellPreviewMetaTags'

import { Router } from '../routes'
import { getApi } from '../helpers'

import {APP_TITLE} from '../config/constants.json';

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  margin-top: 6rem;
`

class CellRoute extends Component {
  state = {
  }

  static async getInitialProps ({ query, req }) {
    const { data } = await axios.get(getApi(`/api/cell/${query.cellId}`, req))

    return {
      canDuplicate: data.studioState ? true : false,
      imageUrl: data.image_url,
      cellUrlId: query.cellId,
      schemaVersion: data.schemaVersion,
      caption: data.caption,
      comicUrlId: data.comicUrlId
    }
  }

  navigateToComic = () => {
    this.props.showSpinner()
    Router.pushRoute(`/comic/${this.props.comicUrlId}`)
  }

  navigateToDuplicate = () => {
    this.props.showSpinner()
    Router.pushRoute(`/s/cell/${this.props.cellUrlId}/duplicate`)
  }

  componentDidMount () {
    this.props.hideSpinner()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.isShowingSpinner) {
      this.props.hideSpinner()
    }
  }

  render () {
    const {
      canDuplicate,
      imageUrl,
      schemaVersion,
      caption
    } = this.props
    
    return (
      <div>
        <Head>
          <title>{APP_TITLE} - {caption ? `${caption}` : 'Cell'}</title>
        </Head>
        <CellPreviewMetaTags
          caption={caption || ' '}
          imageUrl={imageUrl}
          schemaVersion={schemaVersion}
        />

        <CenteredContainer>
          <Cell imageUrl={imageUrl} caption={caption} schemaVersion={schemaVersion}/>
        </CenteredContainer>

        <NavButton
          value='COMIC'
          cb={this.navigateToComic}
          position={BOTTOM_LEFT}
        />

        {canDuplicate && <NavButton
          value='COPY'
          accented
          cb={this.navigateToDuplicate}
          position={BOTTOM_RIGHT}
        />}
      </div>
    )
  }
}

export default CellRoute 