import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import ComicActionsModal from './ComicActionsModal'
import CellActionsModal from './CellActionsModal'
import AddCellModal from './AddCellModal'

import Cell from '../../../components/Cell'
import {
  PinkMenuButton
} from '../../../components/Buttons'
import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT } from '../../../components/navigation'

import { Router } from '../../../routes'
import { forwardCookies, getApi, redirect, sortByOrder } from '../../../helpers'
import theme from '../../../helpers/theme'
import {generateCellImageFromEmojis} from '../../../helpers/generateCellImageFromEmojis'

import {DRAFT_SUFFIX, SCHEMA_VERSION} from '../../../config/constants.json'

const SIDE_BUTTONS_SPACER = 0//.4
const cellWidth = `${(1 - SIDE_BUTTONS_SPACER) * theme.layout.width}px`;
const CELL_IMAGE_ID = 'CELL_IMAGE_ID';

function generateDraftUrl() {
  // @todo verify this id doesn't already exist in localstorage
  return `/s/comic/${shortid.generate()}${DRAFT_SUFFIX}`
}

async function generateCellImage(cell) {
  const cellImageElement = document.createElement('div');
  cellImageElement.hidden = true;
  const cellImageElementId = `${CELL_IMAGE_ID}-${cell.id}`;
  cellImageElement.id = cellImageElementId;
  document.body.appendChild(cellImageElement);
  
  const { url } = await generateCellImageFromEmojis({
    emojis: cell.studioState.emojis,
    backgroundColor: cell.studioState.backgroundColor,
    htmlElementId: cellImageElementId
  })

  cell.imageUrl = url;
}

function hydrateComicFromApi (comicId) {
  // try to fetch from api
  // if doesn't exist in api
    // return null (this will have the effect of redirecting to /s/cell/new)
  // if does exist in api
    // check if user has ability to edit comic
    // if not
      // duplicate comic workflow
    // if so
      // hydrate client cache from api response
      // return formatted data
}

function hydrateComicFromClientCache(comicId) {
  const {
    getCellsByComicId, getComic
  } = require('../../../helpers/clientCache');

  const comic = getComic(comicId);
  const cells = getCellsByComicId(comicId);

  return {
    ...comic,
    cells
  };
}

async function hydrateComic (comicId) {
  // try to fetch from client cache
  const {
    doesComicIdExist
  } = require('../../../helpers/clientCache');

  // if exists in client cache
  if (doesComicIdExist(comicId)) {
    // hydrate the cells and comic from client cache and return formatted data
    console.log('comic exists in client cache');
    return hydrateComicFromClientCache(comicId);
  } else {
    console.log('comic DOES NOT exist in client cache');
    return null;
    // @todo
    // hydrateComicFromApi(comicId);
  }
}

const getCellsByComicId = (comicId, cells) => {
  const comicsCells = cells.filter(cell => cell.comicId === comicId);
  return comicsCells.reduce((acc, cell) => {
    acc[cell.id] = cell;
    return acc;
  }, {});
}

// STYLED COMPONENTS

const AddCellButton = styled(PinkMenuButton)`
  font-size: 2.5rem;
  width: ${props => props.theme.layout.width}px;
`

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  margin: 1rem auto ${props => props.theme.layout.bottomPadding}px;
`

const StudioCell = styled(Cell)`
  margin: 0 auto;
  width: ${cellWidth};
`

//
// Comic Studio
class StudioV2 extends Component {
  static async getInitialProps ({ query, req, res }) {
    // if on an unpublished comic, don't fetch comic data
    // if(query.comicId.includes(DRAFT_SUFFIX)) {
    //   return {}
    // }

    // const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req))

    // // redirect to new comic if user isn't authorized to edit this comic
    // if (!data.userCanEdit || !data.isActive) {
    //   // @todo log this case
    //   redirect(generateDraftUrl(), res);
    //   return {}
    // }

    return {
      //...data,
      comicId: query.comicId
    }
  }

  state = {
    activeCell: null,
    comic: {},
    showComicActionsModal: false,
    showCellActionsModal: false,
    showAddCellModal: false
  }

  async componentDidMount() {
    const hydratedComic = await hydrateComic(this.props.comicId);

    if (!hydratedComic) {
      return this.navigateToNewComic();
    } else {
      // generate images for any unpublished cell
      const cells = Object.values(hydratedComic.cells || {});
      const cellsWithUnpublishedImages = cells.filter(cell => cell.hasNewImage);
      await Promise.all(cellsWithUnpublishedImages.map(generateCellImage));      

      this.setState({comic: hydratedComic}, () => {
        // hide spinner and scroll to bottom of comic
        this.props.hideSpinner(() => window.scrollTo(0,document.body.scrollHeight));
      });
    }
  }

  hideAddCellModal = () => {
    this.setState({ showAddCellModal: false })
  }

  showAddCellModal = () => {
    this.setState({ showAddCellModal: true })
  }

  navigateToNewComic = () => {
    this.props.showSpinner();
    Router.pushRoute('/s/cell/new');
  }

  navigateToAddCellFromNew = () => {
    const { comicId } = this.props

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/studio/${comicId}/new`)
  }

  navigateToAddCell = (cellUrlId) => {
    const { comicId } = this.props

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/studio/${comicId}/${cellUrlId}`)
  }

  toggleComicActionsModal = (newValue) => {
    this.setState({ showComicActionsModal: newValue })
  }

  toggleCellActionsModal = (newValue) => {
    this.setState({ showCellActionsModal: newValue })
  }

  navigateBack = () => {
    this.props.showSpinner()
    Router.pushRoute(`/comic/${this.props.comicId}`)
  }

  renderAddCellButton = () => {
    return (<AddCellButton onClick={() => this.showAddCellModal()}>
      +
    </AddCellButton>)
  }

  handleDeleteComicClick = async () => {
    this.props.showSpinner();
    this.toggleComicActionsModal(false);
    try {
      await axios.delete(`/api/comic/${this.props.comicId}`);
      // remove this comic from the gallery cache
      this.props.deleteComicFromCache(this.props.comicId, () => Router.pushRoute('/gallery'));
    }
    catch(error) {
      this.props.hideSpinner();
      // @todo log error
      console.error(error);
      return;
    }
  }

  getCellsFromState = () => {
    const comic = this.state.comic;

    const sortedCells = [];
  
    if (!comic.initialCellId) {
      return sortedCells;
    }
  
    const comicsCells = getCellsByComicId(this.props.comicId, Object.values(comic.cells));
  
    let nextCellId = comic.initialCellId;
  
    while(comicsCells[nextCellId]) {
      sortedCells.push(comicsCells[nextCellId]);
      const nextCell = Object.values(comicsCells).find(cell => cell.previousCellId === nextCellId);
      nextCellId = nextCell && nextCell.id
    }
  
    return sortedCells;
  }

  render () {
    return !this.props.isShowingSpinner && <React.Fragment>
      <OuterContainer>
        {/* CELLS */}
        {this.getCellsFromState().map((cell) => (
          <div key={cell.imageUrl}>
            <StudioCell
              imageUrl={cell.imageUrl}
              isImageUrlAbsolute={cell.hasNewImage}
              onClick={() => this.setState({activeCell: cell})}
              schemaVersion={cell.schemaVersion || SCHEMA_VERSION}
              title={cell.title}
              width={cellWidth}
            />
          </div>
        ))}
        {this.renderAddCellButton()}
      </OuterContainer>

      {this.state.showAddCellModal && <AddCellModal
        onCancelClick={this.hideAddCellModal}
        onAddCellFromNewClick={this.navigateToAddCellFromNew}
        onAddCellFromDuplicate={this.navigateToAddCell}
        cells={this.props.cells}
      />}

      {this.state.showComicActionsModal && <ComicActionsModal
        onCancelClick={() => this.toggleComicActionsModal(false)}
        onDeleteClick={() => this.handleDeleteComicClick()}
      />}

      {this.state.activeCell && <CellActionsModal
        cell={this.state.activeCell}
        onCancelClick={() => this.setState({activeCell: null})}
      />}

      <NavButton
        value='EXIT'
        cb={() => this.navigateBack()}
        position={BOTTOM_LEFT}
      />
      <NavButton
        value='ACTIONS'
        cb={() => this.toggleComicActionsModal(true)}
        position={BOTTOM_RIGHT}
        accented
      />
    </React.Fragment>
  }
}

StudioV2.propTypes = {
  comicId: propTypes.string,
  isShowingSpinner: propTypes.bool


  // cells: propTypes.arrayOf(propTypes.shape({
  //   urlId: propTypes.string,
  //   imageUrl: propTypes.string,
  //   order: propTypes.number,
  //   schemaVersion: propTypes.number,
  //   studioState: propTypes.object,
  //   title: propTypes.string
  // })),
  // urlId: propTypes.string,
  // title: propTypes.string,
  // userCanEdit: propTypes.bool
};

export default StudioV2 