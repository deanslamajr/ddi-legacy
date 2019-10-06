import { Component } from 'react'
import styled from 'styled-components'
import Img from 'react-image';

import {
  NavButton,
  BOTTOM_RIGHT,
  BOTTOM_CENTER,
  TOP_RIGHT
} from '../components/navigation'
import Cell from '../components/Cell'
import {ErrorCell, LoadingCell} from '../components/Loading'

import { getCellUrl } from '../helpers'
import { media, shadow } from '../helpers/style-utils'

import { Link, Router } from '../routes'

const Thumbnail = styled(Img)`
  ${shadow()}

  ${media.desktopMin`
    width: 260px;
    cursor: pointer;

    &:hover {
      opacity: .8;
    }
  `}

  ${media.phoneMax`
    width: 48vw;
    min-width: 130px;
  `}
`;

const OldThumbNail = styled(Thumbnail)`
  background-color: ${props => props.theme.colors.white};
`

const CellsCount = styled.div`
  z-index: 999;
  position: absolute;
  top: .1rem;
  left: .1rem;
  width: 25px;
  height: 25px;
  opacity: .75;
  background-color: ${props => props.theme.colors.pink};
  color: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
`

const Thumb = ({cellsCount, imageUrl}) => {
  return (<>
    {cellsCount > 1 && <CellsCount>{cellsCount}</CellsCount>}
    <Thumbnail
      src={imageUrl}
      loader={<LoadingCell removeborders/>}
      unloader={<ErrorCell removeborders/>}
    />
  </>)
}

const OldThumb = ({caption, cellsCount, schemaVersion, imageUrl}) => {
  return (<OldThumbNail as='div'>
    {cellsCount > 1 && <CellsCount>{cellsCount}</CellsCount>}
    <Cell
      clickable
      removeborders
      imageUrl={imageUrl}
      isImageUrlAbsolute={schemaVersion>1}
      schemaVersion={schemaVersion}
      title={caption} />
  </OldThumbNail>);
}

const CellsThumb = ({cell, cellsCount}) => {
  if (cell) {
    return cell.schemaVersion === 1
      ? (<Thumb
        cellsCount={cellsCount}
        imageUrl={cell.imageUrl}
      />)
      : (<OldThumb
        cellsCount={cellsCount}
        imageUrl={getCellUrl(cell.imageUrl, cell.schemaVersion)}
        schemaVersion={cell.schemaVersion}
        caption={cell.caption}
      />)
  }

  return null
}

const ComicsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  justify-content: space-evenly;
`

const ShowMoreButton = styled(NavButton)`
  position: inherit;
`

const UnstyledLink = styled.a`
  text-decoration: none;
  color: ${props => props.theme.colors.black};
  position: relative;
  
  ${media.desktopMin`
    margin: 1rem;
  `}
  ${media.phoneMax`
    margin: .2rem;
  `}
`

const CreateButton = styled(NavButton)`
  font-size: 2.5rem;
`

class GalleryRoute extends Component {
  navigateToStudio = () => {
    this.props.showSpinner()
    Router.pushRoute('/s/cell/new')
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
      if (activeComic) {
        activeComic.scrollIntoView()
        this.props.setActiveComicId(null)
      }
    }
  }

  render () {
    return (
      <div>
        <ComicsContainer>
          {this.props.comics.map(({cellsCount, initialCell, urlId}) => (
            <Link
              key={urlId}
              route={`/comic/${urlId}`}
            >
              <UnstyledLink
                id={urlId}
                onClick={() => this.handleComicClick(urlId)}
              >
                <CellsThumb cell={initialCell} cellsCount={cellsCount} />
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