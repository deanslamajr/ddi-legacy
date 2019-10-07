import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import propTypes from 'prop-types'
import getConfig from 'next/config'

import ComicActionsModal from './ComicActionsModal'
import CellActionsModal from './CellActionsModal'
import AddCellModal from './AddCellModal'
import PublishPreviewModal from './PublishPreviewModal'

import {createUpdatePayload} from './createUpdatePayload';

import Cell from '../../../components/Cell'
import {
  PinkMenuButton
} from '../../../components/Buttons'
import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT } from '../../../components/navigation'

import { Router } from '../../../routes'

import { forwardCookies, getApi, redirect } from '../../../helpers'
import {sortByOrder, sortCellsV4} from '../../../helpers/sorts'
import theme from '../../../helpers/theme'
import {generateCellImageFromEmojis} from '../../../helpers/generateCellImageFromEmojis'

import {
  CAPTCHA_ACTION_CELL_PUBLISH, DRAFT_SUFFIX, SCHEMA_VERSION
} from '../../../config/constants.json';

const { publicRuntimeConfig } = getConfig();

const SIDE_BUTTONS_SPACER = 0//.4
const cellWidth = `${(1 - SIDE_BUTTONS_SPACER) * theme.layout.width}px`;
const CELL_IMAGE_ID = 'CELL_IMAGE_ID';

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

function hydrateComicFromApi (comicUrlId) {
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

function hydrateComicFromClientCache(comicUrlId) {
  const {
    getCellsByComicUrlId, getComic
  } = require('../../../helpers/clientCache');

  const comic = getComic(comicUrlId);
  const cells = getCellsByComicUrlId(comicUrlId);

  return {
    ...comic,
    cells
  };
}

async function hydrateComic (comicUrlId) {
  // try to fetch from client cache
  const {
    doesComicUrlIdExist
  } = require('../../../helpers/clientCache');

  // if exists in client cache
  if (doesComicUrlIdExist(comicUrlId)) {
    // hydrate the cells and comic from client cache and return formatted data
    return hydrateComicFromClientCache(comicUrlId);
  } else {
    return null;
    // @todo
    // hydrateComicFromApi(comicUrlId);
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
    // if(query.comicUrlId.includes(DRAFT_SUFFIX)) {
    //   return {}
    // }

    // const { data } = await axios.get(getApi(`/api/comic/${query.comicUrlId}`, req), forwardCookies(req))

    // // redirect to new comic if user isn't authorized to edit this comic
    // if (!data.userCanEdit || !data.isActive) {
    //   // @todo log this case
    //   redirect(generateDraftUrl(), res);
    //   return {}
    // }

    return {
      //...data,
      comicUrlId: query.comicUrlId
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
    const hydratedComic = await hydrateComic(this.props.comicUrlId);

    if (!hydratedComic) {
      return this.navigateToNewComic();
    } else {
      // generate images for any unpublished cell
      const cells = Object.values(hydratedComic.cells || {});
      const cellsWithUnpublishedImages = cells.filter(cell => cell.hasNewImage);
      await Promise.all(cellsWithUnpublishedImages.map(generateCellImage));      

      this.setState({comic: hydratedComic}, () => {
        // hide spinner and scroll to bottom of comic
        this.props.hideSpinner(() => window.scrollTo(0, document.body.scrollHeight));
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
    const {comicUrlId} = this.props

    const {createNewCell} = require('../../../helpers/clientCache');
    const cellId = createNewCell(comicUrlId);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellId}`)
  }

  navigateToAddCell = (studioState) => {
    const {comicUrlId} = this.props

    const {createNewCell} = require('../../../helpers/clientCache');

    const cellUrlId = createNewCell(comicUrlId, studioState);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellUrlId}`)
  }

  toggleComicActionsModal = (newValue) => {
    this.setState({ showComicActionsModal: newValue })
  }

  toggleCellActionsModal = (newValue) => {
    this.setState({ showCellActionsModal: newValue })
  }

  navigateBack = () => {
    this.props.showSpinner()
    Router.pushRoute(`/comic/${this.props.comicUrlId}`)
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
      await axios.delete(`/api/comic/${this.props.comicUrlId}`);
      // remove this comic from the gallery cache
      this.props.deleteComicFromCache(this.props.comicUrlId, () => Router.pushRoute('/gallery'));
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

    return comicsCells
      ? sortCellsV4(comic.initialCellUrlId, Object.values(comicsCells))
      : [];
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
    let totalJobsCount = 1;
    let signedCells;
    let newComicUrlId;

    const cellsThatRequireUploads = this.getCellsWithNewImage();

    if (cellsThatRequireUploads.length) {
      // if image uploading is required:
      // 1 + # of cells that require uploads
      totalJobsCount += 1 + cellsThatRequireUploads.length;

      this.props.showSpinner(totalJobsCount);

      const uploadResponse = await this.upload();

      signedCells = uploadResponse.signedCells;
      newComicUrlId = uploadResponse.comicUrlId;
    } else {
      this.props.showSpinner(totalJobsCount);
    }

    await this.publishComicUpdate({signedCells, comicUrlId: newComicUrlId});

    this.props.markJobAsFinished();

    //delete comic from client cache
    const {deleteComic} = require('../../../helpers/clientCache');
    deleteComic(this.props.comicUrlId);

    Router.pushRoute(`/comic/${newComicUrlId}`)
  }

  upload = async (v2CaptchaToken) => {
    let token
    
    try {
      if (!v2CaptchaToken && publicRuntimeConfig.CAPTCHA_V3_SITE_KEY) {
        token = await this.props.recaptcha.execute(CAPTCHA_ACTION_CELL_PUBLISH);
      }
        
      const {
        signedCells, comicUrlId
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

      this.props.markJobAsFinished();

      await Promise.all(signedCells.map(this.uploadImage));

      return {comicUrlId, signedCells};
    }
    catch (e) {
      console.error(e);
      const isCaptchaFail = e && e.response && e.response.status === 400;
      // @todo log this
      //this.togglePublishFailModal(true, isCaptchaFail);
    }
  }

  uploadImage = async ({draftUrlId, filename, signData}) => {
    const cell = this.state.comic.cells[draftUrlId];

    if(!cell) {
      throw new Error(`signed cell ${draftUrlId} not found in state!`)
    }

    const file = await generateCellImage(cell, filename);  

    await uploadImage(file, signData.signedRequest);

    this.props.markJobAsFinished();
  }

  getSignedRequest = async (captchaTokens) => {
    // POST /api/comic/:comicUrlId/sign
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
      .map(({urlId}) => urlId);

    signData.newCells = cellIdsToSign;
  
    const { data } = await axios.post(`/api/comic/${this.props.comicUrlId}/sign`, signData);

    return {
      comicUrlId: data.comicUrlId,
      signedCells: data.cells
    }
  }

  publishComicUpdate = async ({comicUrlId, signedCells}) => {
    // if comicUrlId exists, this is a new cell
    const comicUrlIdToUpdate = comicUrlId || this.props.comicUrlId;

    const updatePayload = createUpdatePayload({
      comic: this.state.comic,
      publishedComic: this.props.publishedComic,
      signedCells
    });
    
    await axios.patch(`/api/comic/${comicUrlIdToUpdate}`, updatePayload);
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
  comicUrlId: propTypes.string,
  isShowingSpinner: propTypes.bool,
  publishedComic: propTypes.object,
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