import { Component } from 'react'
import styled from 'styled-components'

import {
  NavButton,
  BOTTOM_RIGHT,
  BOTTOM_CENTER,
  TOP_RIGHT
} from '../components/navigation'

import Cell from '../components/Cell'

import { sortByOrder } from '../helpers'
import { media, shadow } from '../helpers/style-utils'

import { Link, Router } from '../routes'

const Thumbnail = styled.img`
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

const OldCellImage = styled.img`
  width: 100%;
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
    <Thumbnail src={imageUrl}>
    </Thumbnail>
  </>)
}

const Caption = styled.div`
  ${media.phoneMax`
    font-size: .7rem;
  `}

  padding: .25rem;
  padding-top: .15rem;
`

const OldThumb = ({caption, cellsCount, imageUrl}) => {
  return (<OldThumbNail as='div'>
    {cellsCount > 1 && <CellsCount>{cellsCount}</CellsCount>}
    <Cell clickable removeBorders imageUrl={imageUrl} title={caption} />
  </OldThumbNail>);
}

const CellsThumb = ({cells = []}) => {
  if (!Array.isArray(cells)) {
    return null
  }

  const sortedCells = cells.sort(sortByOrder);

  if (sortedCells.length) {
    const cell = sortedCells[0];
    return cell.schema_version === 1
      ? (<Thumb
        cellsCount={sortedCells.length}
        imageUrl={cell.image_url}
      />)
      : (<OldThumb
        cellsCount={sortedCells.length}
        imageUrl={cell.image_url}
        caption={cell.title}
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
                <CellsThumb cells={cells} />
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