import { Component } from 'react'
import styled from 'styled-components'

import {
  NavButton,
  BOTTOM_RIGHT,
  BOTTOM_CENTER,
  TOP_RIGHT
} from '../components/navigation'

import Comic from './comic/Comic'

import { Link, Router } from '../routes'

const ComicsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const ShowMoreButton = styled(NavButton)`
  position: inherit;
`

const UnstyledLink = styled.a`
  text-decoration: none;
  color: ${props => props.theme.colors.black};
  overflow-x: auto;
  margin: .5rem 0;

  &:first-of-type {
    margin-top: 1rem;
  }
`

const CreateButton = styled(NavButton)`
  font-size: 2.5rem;
`

class GalleryRoute extends Component {
  navigateToStudio = () => {
    this.props.showSpinner()
    Router.pushRoute('/studio/new/new')
  }

  showMoreComics = async () => {
    this.props.showSpinner()
    this.props.fetchMoreComics(this.props.hideSpinner)
  }

  handleComicClick = (urlId) => {
    this.props.showSpinner()
    this.props.setActiveComicId(urlId)
  }

  handleRefreshClick = () => {
    const finishRefresh = () => {
      window.scrollTo(0, 0)
      this.props.hideSpinner()
    }
    this.props.showSpinner()
    this.props.appendLatestComics(finishRefresh)
  }

  componentDidMount () {
    this.props.fetchComics(this.props.hideSpinner)
    if (this.props.activeComicId) {
      const activeComic = document.getElementById(this.props.activeComicId);
      activeComic.scrollIntoView()
      this.props.setActiveComicId(null)
    }
  }

  render () {
    return (
      <div>
        <ComicsContainer>
          {this.props.comics.map(({ id, cells, url_id }) => (
            <Link
              key={id}
              route={`/comic/${url_id}`}
            >
              <UnstyledLink
                id={url_id}
                onClick={() => this.handleComicClick(url_id)}
              >
                <Comic cells={cells} />
              </UnstyledLink>
            </Link>)
          )}
        </ComicsContainer>

        {this.props.newerComicsExist && <NavButton
          value='SHOW NEWER'
          cb={this.handleRefreshClick}
          position={TOP_RIGHT}
        />}

        {this.props.hasMoreComics && <ShowMoreButton
          value='SHOW MORE'
          cb={this.showMoreComics}
          position={BOTTOM_CENTER}
        />}
        
        <CreateButton
          value='+'
          accented
          cb={this.navigateToStudio}
          position={BOTTOM_RIGHT}
        />
      </div>
    )
  }
}

export default GalleryRoute 