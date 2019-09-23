import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'
import getConfig from 'next/config'

import ComicActionsModal from './ComicActionsModal'
import CellActionsModal from './CellActionsModal'
import AddCellModal from './AddCellModal'
import PublishPreviewModal from './PublishPreviewModal'

import Cell from '../../../components/Cell'
import {
  PinkMenuButton
} from '../../../components/Buttons'
import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT } from '../../../components/navigation'

import { Router } from '../../../routes'
import { forwardCookies, getApi, redirect, sortByOrder } from '../../../helpers'
import theme from '../../../helpers/theme'
import {generateCellImageFromEmojis} from '../../../helpers/generateCellImageFromEmojis'

import {
  CAPTCHA_ACTION_CELL_PUBLISH, DRAFT_SUFFIX, SCHEMA_VERSION
} from '../../../config/constants.json';

const { publicRuntimeConfig } = getConfig();

const SIDE_BUTTONS_SPACER = 0//.4
const cellWidth = `${(1 - SIDE_BUTTONS_SPACER) * theme.layout.width}px`;
const CELL_IMAGE_ID = 'CELL_IMAGE_ID';

function generateDraftUrl() {
  // @todo verify this id doesn't already exist in localstorage
  return `/s/comic/${shortid.generate()}${DRAFT_SUFFIX}`
}

async function generateCellImage(cell, filename) {
  const cellImageElement = document.createElement('div');
  cellImageElement.hidden = true;
  const cellImageElementId = `${CELL_IMAGE_ID}-${cell.id}`;
  cellImageElement.id = cellImageElementId;
  document.body.appendChild(cellImageElement);
  
  const { file, url } = await generateCellImageFromEmojis({
    emojis: cell.studioState.emojis,
    backgroundColor: cell.studioState.backgroundColor,
    filename,
    htmlElementId: cellImageElementId
  })

  cell.imageUrl = url;

  return file
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
    return hydrateComicFromClientCache(comicId);
  } else {
    return null;
    // @todo
    // hydrateComicFromApi(comicId);
  }
}

function uploadImage(imageFile, signedRequest) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedRequest)
    xhr.onreadystatechange = async () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          resolve();
        }
        else{
          // @todo better UX
          console.error('could not upload file!')
          reject();
        }
      }
    }
    xhr.send(imageFile)
  });
}

// @todo do we need this anymore?
// const getCellsByComicId = (comicId, cells) => {
//   const comicsCells = cells.filter(cell => cell.comicId === comicId);
//   return comicsCells.reduce((acc, cell) => {
//     acc[cell.id] = cell;
//     return acc;
//   }, {});
// }

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
    showAddCellModal: false,
    showComicActionsModal: false,
    showCellActionsModal: false,
    showPreviewModal: false
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

    const {createNewCell} = require('../../../helpers/clientCache');
    const cellId = createNewCell(comicId);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellId}`)
  }

  navigateToAddCell = (studioState) => {
    const { comicId } = this.props

    const {createNewCell} = require('../../../helpers/clientCache');

    const cellId = createNewCell(comicId, studioState);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellId}`)
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
    const comicsCells = comic.cells;

    const sortedCells = [];
  
    if (!comic.initialCellId) {
      return sortedCells;
    }
  
    let nextCellId = comic.initialCellId;
  
    while(comicsCells[nextCellId]) {
      sortedCells.push(comicsCells[nextCellId]);
      const nextCell = Object.values(comicsCells).find(cell => cell.previousCellId === nextCellId);
      nextCellId = nextCell && nextCell.id
    }
  
    return sortedCells;
  }

  handlePublishPreviewClick = () => {
    this.togglePreviewModal(true);
    this.toggleComicActionsModal(false);
  }

  togglePreviewModal = (shouldShow) => {
    this.setState({showPreviewModal: shouldShow});
  }

  getCellsWithNewImage = () => {
    const cells = Object.values(this.state.comic.cells);
    return cells.filter(({hasNewImage}) => hasNewImage);
  }

  publish = async () => {
    // minimum number of "jobs" required to finish a publish
    // i.e. all jobs excluding uploads
    // @todo update this with the amount of jobs involved for `finishPublish`
    let totalJobsCount = 0;

    const cellsThatRequireUploads = this.getCellsWithNewImage();

    if (cellsThatRequireUploads.length) {
      // if uploading required:
      // 1 + # of cells that require uploads
      totalJobsCount += 1 + cellsThatRequireUploads.length;

      this.props.showSpinner(totalJobsCount);

      const signedCells = await this.upload();
      console.log('signedCells', signedCells)
    } else {
      this.props.showSpinner(totalJobsCount);
    }

    await this.finishPublish();
  }

  upload = async (v2CaptchaToken) => {
    let token
    
    try {
      if (!v2CaptchaToken && publicRuntimeConfig.CAPTCHA_V3_SITE_KEY) {
        token = await this.props.recaptcha.execute(CAPTCHA_ACTION_CELL_PUBLISH);
      }
        
      const {
        cells: signedCells, comicId
      } = await this.getSignedRequest({
        v2: v2CaptchaToken,
        v3: token
      });
      // cells: {
      //   draftId: "sIYUqmZHlN---draft"
      //   filename: "DW8LWLzuDn.png"
      //   id: "83OCqNixmT"
      //   signData: {}
      // }

      // this.props.markJobFinished();

      await Promise.all(signedCells.map(this.uploadImage));

      return signedCells;
    }
    catch (e) {
      console.error(e);
      const isCaptchaFail = e && e.response && e.response.status === 400;
      // @todo log this
      //this.togglePublishFailModal(true, isCaptchaFail);
    }
  }

  uploadImage = async ({draftId, filename, signData}) => {
    const cell = this.state.comic.cells[draftId];

    if(!cell) {
      throw new Error(`signed cell ${draftId} not found in state!`)
    }

    const file = await generateCellImage(cell, filename);  

    await uploadImage(file, signData.signedRequest);

    // this.props.markJobFinished();
  }

  getSignedRequest = async (captchaTokens) => {
    // POST /api/comic/:comicId/sign
    // {
    //   "newCells": [
    //     "draft--someId",
    //     "draft--anotherId"
    //   ],
    //   "v2Token": "someString" || undefined,
    //   "v3Token": "someOtherString" || undefined
    // }
  
    const signData = {};
  
    if (captchaTokens.v2) {
      signData.v2Token = captchaTokens.v2;
    }
    else if (captchaTokens.v3) {
      signData.v3Token = captchaTokens.v3;
    }
  
    const cellIdsToSign = this.getCellsWithNewImage()
        .map(({id}) => id);

    signData.newCells = cellIdsToSign;
  
    const { data } = await axios.post(`/api/comic/${this.props.comicId}/sign`, signData);
    return data
  }

  finishPublish = async () => {
    console.log('finishing publish...')
  }

  render () {
    const sortedCells = this.getCellsFromState();

    return !this.props.isShowingSpinner && <React.Fragment>
      <OuterContainer>
        {/* CELLS */}
        {sortedCells.map((cell) => (
          <div key={cell.imageUrl}>
            <StudioCell
              imageUrl={cell.imageUrl}
              isImageUrlAbsolute={cell.hasNewImage}
              onClick={() => this.setState({activeCell: cell})}
              schemaVersion={cell.schemaVersion || SCHEMA_VERSION}
              title={cell.studioState.caption}
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
        cells={sortedCells}
      />}

      {this.state.showComicActionsModal && <ComicActionsModal
        onCancelClick={() => this.toggleComicActionsModal(false)}
        onDeleteClick={() => this.handleDeleteComicClick()}
        onPublishClick={() => this.handlePublishPreviewClick()}
      />}

      {this.state.activeCell && <CellActionsModal
        cell={this.state.activeCell}
        onCancelClick={() => this.setState({activeCell: null})}
      />}

      {this.state.showPreviewModal && <PublishPreviewModal
        onCancelClick={() => this.togglePreviewModal(false)}
        onPublishClick={() => this.publish()}
        cells={sortedCells}
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
  isShowingSpinner: propTypes.bool,
  recaptcha: propTypes.object

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