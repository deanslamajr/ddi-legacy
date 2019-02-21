import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import { NavButton, BOTTOM_RIGHT, GREEN, } from '../components/navigation'
import { MenuButton } from '../components/Buttons'

import Comic from './comic/Comic'

import { Link, Router } from '../routes'
import { getApi } from '../helpers'

const ComicsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6rem;
`

const UnstyledLink = styled.a`
  text-decoration: none;
  color: black;
  cursor: pointer;
  overflow-x: auto;
`

const ShowMoreButton = styled(MenuButton)`
  width: 270px;
`

class GalleryRoute extends Component {
  state = {
    comics: this.props.comics,
    hasMore: this.props.hasMore
  }

  static async getInitialProps ({ req }) {
    const { data } = await axios.get(getApi('/api/comics', req))

    return {
      comics: data.comics,
      hasMore: data.hasMore
    }
  }

  navigateToStudio = () => {
    Router.push('/studio/new/new')
  }

  showMoreComics = async () => {
    const paginationData = {
      offset: this.state.comics.length
    }

    const qs = queryString.stringify(paginationData)

    const { data } = await axios.get(`/api/comics?${qs}`)

    const clonedComics = Array.from(this.state.comics)
    const newComics = clonedComics.concat(data.comics)

    this.setState({
      comics: newComics,
      hasMore: data.hasMore
    })
  }

  render () {
    const { comics = [], hasMore } = this.state
    
    return (
      <div>
        <MobileViewportSettings />
        <GrayBackground />
        <ComicsContainer>
          {comics.map(({ id, cells, url_id }) => (
            <Link key={id} route={`/comic/${url_id}`}>
              <UnstyledLink>
                <Comic cells={cells} />
              </UnstyledLink>
            </Link>)
          )}
        </ComicsContainer>
        <CenteredContainer>
          {hasMore && <ShowMoreButton onClick={this.showMoreComics}>
            SHOW MORE
          </ShowMoreButton>}
        </CenteredContainer>
        
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

export default GalleryRoute 