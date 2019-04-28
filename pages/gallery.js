import { Component } from 'react'
import styled from 'styled-components'

import { NavButton, BOTTOM_RIGHT } from '../components/navigation'
import { MenuButton } from '../components/Buttons'

import Comic from './comic/Comic'

import { Link, Router } from '../routes'

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
  color: ${props => props.theme.colors.black};
  overflow-x: auto;
  margin: .5rem 0;

  &:first-of-type {
    margin-top: 1rem;
  }
`

const ShowMoreButton = styled(MenuButton)`
  width: 270px;
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

  componentDidMount () {
    this.props.fetchComics(this.props.hideSpinner)
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
              <UnstyledLink onClick={this.props.showSpinner}>
                <Comic cells={cells} />
              </UnstyledLink>
            </Link>)
          )}
        </ComicsContainer>
        <CenteredContainer>
          {this.props.hasMoreComics && <ShowMoreButton onClick={this.showMoreComics}>
            SHOW MORE
          </ShowMoreButton>}
        </CenteredContainer>
        
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