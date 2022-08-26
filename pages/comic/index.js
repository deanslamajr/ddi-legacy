import Head from 'next/head'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { sortByOrder } from '../../helpers/sorts'
import { media } from '../../helpers/style-utils'
import { getApi, forwardCookies, redirect } from '../../helpers'
import { DDI_APP_PAGES } from '../../helpers/urls'

import Comic from './Comic'

import {
  NavButton,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
} from '../../components/navigation'
import { CellPreviewMetaTags } from '../../components/CellPreviewMetaTags'

import { Router } from '../../routes'

import { APP_TITLE } from '../../config/constants.json'

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
  static async getInitialProps({ query, req, res }) {
    let data
    let comicIdIsValid = true

    try {
      // destructuring syntax - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assignment_without_declaration
      ;({ data } = await axios.get(
        getApi(`/api/comic/${query.comicId}`, req),
        forwardCookies(req)
      ))
    } catch (error) {
      // @todo log error
      comicIdIsValid = false
    }

    if (!comicIdIsValid || !data.isActive) {
      // @todo log this case
      return redirect(
        DDI_APP_PAGES.getGalleryPageUrl(
          data && data.comicUpdatedAt
            ? {
                comicUpdatedAt: data.comicUpdatedAt,
              }
            : undefined
        ),
        res
      )
    }

    const initialCell = data.cells.find(
      ({ urlId }) => urlId === data.initialCellUrlId
    )

    return {
      cells: data.cells,
      comicUpdatedAt: data.comicUpdatedAt,
      comicId: query.comicId,
      initialCell: initialCell,
      title: data.title,
      userCanEdit: data.userCanEdit,
    }
  }

  navigateToGallery = () => {
    const { comicUpdatedAt, showSpinner } = this.props

    showSpinner()

    window.location = DDI_APP_PAGES.getGalleryPageUrl({
      comicUpdatedAt: comicUpdatedAt,
    })
  }

  navigateToStudio = () => {
    const { comicId, showSpinner } = this.props

    showSpinner()
    // Router.pushRoute(`/s/comic/${this.props.comicId}`)
    window.location = DDI_APP_PAGES.getComicStudioPageUrl(comicId)
  }

  /**
   * not in use bc it doesn't seem to work on iOS safari
   */
  downloadCells = (e) => {
    const { cells, comicId } = this.props

    e.preventDefault()

    cells.sort(sortByOrder).forEach(({ imageUrl }, currentIndex) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', imageUrl, true)
      xhr.responseType = 'blob'
      xhr.onload = () => {
        const urlCreator = window.URL || window.webkitURL
        const href = urlCreator.createObjectURL(xhr.response)
        const tag = document.createElement('a')
        tag.href = href
        tag.download = `${comicId}_${currentIndex + 1}of${cells.length}.png`
        document.body.appendChild(tag)
        tag.click()
        document.body.removeChild(tag)
      }
      xhr.send()
    })
  }

  componentDidMount() {
    this.props.hideSpinner()
  }

  render() {
    const { cells, initialCell, title, userCanEdit } = this.props

    return (
      <div>
        <Head>
          <title>
            {APP_TITLE} - {title ? `${title}` : 'Comic'}
          </title>
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

        {userCanEdit && (
          <NavButton
            accented
            value="EDIT"
            cb={this.navigateToStudio}
            position={BOTTOM_RIGHT}
          />
        )}

        <NavButton
          value="GALLERY"
          cb={this.navigateToGallery}
          position={BOTTOM_LEFT}
        />
      </div>
    )
  }
}

export default ComicRoute
