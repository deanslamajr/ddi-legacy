import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import propTypes from 'prop-types'
import getConfig from 'next/config'

import ComicActionsModal from './ComicActionsModal'
import CellActionsModal from './CellActionsModal'
import AddCellModal from './AddCellModal'
import PublishFailModal from './PublishFailModal'
import PublishPreviewModal from './PublishPreviewModal'
import ReachedDirtyCellLimitModal from './ReachedDirtyCellLimitModal'

import { createUpdatePayload } from './createUpdatePayload';

import Cell from '../../../components/Cell'
import {PinkMenuButton} from '../../../components/Buttons'
import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT } from '../../../components/navigation'

import { Router } from '../../../routes'

import { sortCellsV4 } from '../../../helpers/sorts'
import theme from '../../../helpers/theme'
import { generateCellImage } from '../../../helpers/generateCellImageFromEmojis'
import { isDraftId } from '../../../shared/isDraftId';

import {
  CAPTCHA_ACTION_CELL_PUBLISH,
  MAX_DIRTY_CELLS,
  SCHEMA_VERSION
} from '../../../config/constants.json';

const { publicRuntimeConfig } = getConfig();

const SIDE_BUTTONS_SPACER = 0//.4
const cellWidth = `${(1 - SIDE_BUTTONS_SPACER) * theme.layout.width}px`;

async function hydrateComicFromApi(comicUrlId) {
  let comicFromApi;

  // try to fetch from api
  try {
    const response = await axios.get(`/api/comic/${comicUrlId}`);

    comicFromApi = response.data;

    if (!comicFromApi.userCanEdit) {
      //@TODO copy comic workflow
      throw new Error(`User is not authorized to edit comic with urlId:${comicUrlId}.`);
    } else if (!comicFromApi.isActive) {
      throw new Error(`Comic with urlId:${comicUrlId} cannot be edited as it is not active.`);
    }
  }
  catch (e) {
    //@TODO log
    console.error(e);
    return null
  }

  const { createComicFromPublishedComic } = require('../../../helpers/clientCache');

  return createComicFromPublishedComic(comicFromApi);
}

async function hydrateComic(comicUrlId) {
  // try to fetch from client cache
  const {
    doesComicUrlIdExist, hydrateComicFromClientCache
  } = require('../../../helpers/clientCache');

  // if exists in client cache
  if (doesComicUrlIdExist(comicUrlId)) {
    // hydrate the cells and comic from client cache and return formatted data
    return hydrateComicFromClientCache(comicUrlId);
  } else {
    return hydrateComicFromApi(comicUrlId);
  }
}

function uploadImage(imageFile, signedRequest) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedRequest)
    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve();
        }
        else {
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
`;

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

const PinkLabel = styled.div`
  z-index: 999;
  position: absolute;
  font-size: .9rem;
  opacity: .35;
  padding: .1rem .2rem;
  background-color: ${props => props.theme.colors.pink};
  color: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
`

const UnpublishedChangesLabel = () => (
  <PinkLabel>Unpublished Changes</PinkLabel>
);

//
// Comic Studio
class StudioV2 extends Component {
  static async getInitialProps({ query, req, res }) {
    const comicUrlId = query.comicUrlId;

    return {
      comicUrlId
    }
  }

  state = {
    activeCell: null,
    comic: {},
    hasFailedCaptcha: false,
    showAddCellModal: false,
    showPublishFailModal: false,
    showCellActionsModal: false,
    showComicActionsModal: false,
    showPreviewModal: false,
    showReachedDirtyCellLimitModal: false
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

      this.setState({ comic: hydratedComic }, () => {
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

  hideReachedDirtyCellLimitModal = () => {
    this.setState({ showReachedDirtyCellLimitModal: false })
  }

  showReachedDirtyCellLimitModal = (cb = () => {}) => {
    this.setState({ showReachedDirtyCellLimitModal: true }, cb)
  }

  navigateToNewComic = () => {
    this.props.showSpinner();
    Router.replaceRoute('/s/cell/new');
  }

  navigateToAddCellFromNew = () => {
    const { comicUrlId } = this.props

    const { createNewCell } = require('../../../helpers/clientCache');
    const cellId = createNewCell(comicUrlId);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellId}`)
  }

  navigateToAddCell = (studioState) => {
    const { comicUrlId } = this.props

    const { createNewCell } = require('../../../helpers/clientCache');

    const cellUrlId = createNewCell(comicUrlId, studioState);

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/s/cell/${cellUrlId}`)
  }

  navigateBack = () => {
    this.props.showSpinner();
    if(isDraftId(this.props.comicUrlId)) {
      Router.pushRoute('/gallery');
    } else {
      Router.pushRoute(`/comic/${this.props.comicUrlId}`);
    }
  }

  renderAddCellButton = () => {
    const handleClick = this.canDirtyMoreCells()
      ? this.showAddCellModal
      : this.showReachedDirtyCellLimitModal;

    return (<AddCellButton onClick={() => handleClick()}>
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
    catch (error) {
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

  handlePublishPreviewClick = (cb) => {
    this.togglePreviewModal(true);
    cb();
  }

  retryPublish = (token) => {
    this.togglePublishFailModal(false);
    
    this.publish(token);
  }

  cancelPublishAttemp = () => {
    this.togglePublishFailModal(false)
  }

  toggleComicActionsModal = (newValue) => {
    this.setState({ showComicActionsModal: newValue })
  }

  toggleCellActionsModal = (newValue) => {
    this.setState({ showCellActionsModal: newValue })
  }

  togglePreviewModal = (shouldShow) => {
    this.setState({ showPreviewModal: shouldShow });
  }

  togglePublishFailModal = (newValue, hasFailedCaptcha) => {
    this.setState({
      hasFailedCaptcha,
      showPublishFailModal: newValue
    })
  }

  getCellsWithNewImage = () => {
    const cells = Object.values(this.state.comic.cells);
    return cells.filter(({ hasNewImage }) => hasNewImage);
  }

  publish = async (v2CaptchaToken) => {
    let signedCells;
    let comicUrlId;
    // minimum number of "jobs" required to finish a publish
    // i.e. all jobs excluding uploads
    let totalJobsCount = 1;

    const cellsThatRequireUploads = this.getCellsWithNewImage();

    try {
      if (cellsThatRequireUploads.length) {
        // if image uploading is required:
        // 1 + # of cells that require uploads
        totalJobsCount += 1 + cellsThatRequireUploads.length;
  
        this.props.showSpinner(totalJobsCount);
  
        const uploadResponse = await this.upload(v2CaptchaToken);
  
        // fail case, do not continue
        if (!uploadResponse) {
          return;
        }
  
        signedCells = uploadResponse.signedCells;
        comicUrlId = uploadResponse.comicUrlId;
      } else {
        this.props.showSpinner(totalJobsCount);
        comicUrlId = this.props.comicUrlId;
      }
  
      await this.publishComicUpdate({
        comicUrlIdToUpdate: comicUrlId,
        signedCells
      });
  
      this.props.markJobAsFinished();
  
      //delete comic from client cache
      const {deleteComic} = require('../../../helpers/clientCache');
      deleteComic(this.props.comicUrlId);
  
      Router.pushRoute(`/comic/${comicUrlId}`)
    } catch (e) {
      console.error(e);
      // @todo log this

      this.props.hideSpinner();
      this.togglePreviewModal(false);
      this.togglePublishFailModal(true);
    }
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

      this.props.markJobAsFinished();

      await Promise.all(signedCells.map(this.uploadImage));

      return { comicUrlId, signedCells };
    }
    catch (e) {
      console.error(e);
      const isCaptchaFail = e && e.response && e.response.status === 400;
      // @todo log this

      this.props.hideSpinner();
      this.togglePreviewModal(false);
      this.togglePublishFailModal(true, isCaptchaFail);
    }
  }

  uploadImage = async ({ draftUrlId, filename, signData }) => {
    const cell = this.state.comic.cells[draftUrlId];

    if (!cell) {
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
      .map(({ urlId }) => urlId);

    signData.newCells = cellIdsToSign;

    const { data } = await axios.post(`/api/comic/${this.props.comicUrlId}/sign`, signData);

    return {
      comicUrlId: data.comicUrlId,
      signedCells: data.cells
    }
  }

  publishComicUpdate = async ({
    comicUrlIdToUpdate, signedCells
  }) => {
    const updatePayload = await createUpdatePayload({
      comic: this.state.comic,
      comicUrlIdToUpdate,
      isPublishedComic: !isDraftId(this.props.comicUrlId),
      signedCells
    });

    await axios.patch(`/api/comic/${comicUrlIdToUpdate}`, updatePayload);
  }

  // Only allow up to 10 cells to be dirty at any given time
  canDirtyMoreCells = () => {
    const sortedCells = this.getCellsFromState();
    const dirtyCells = sortedCells.filter(({isDirty}) => isDirty);
    return dirtyCells.length < MAX_DIRTY_CELLS;
  }

  isComicDirty = () => {
    const sortedCells = this.getCellsFromState();
    const dirtyCells = sortedCells.filter(({isDirty}) => isDirty);
    return dirtyCells.length > 0;
  }

  handleCellClick = (activeCell) => {
    // if this cell is pristine but we've reached the limit of dirty cells
    // don't allow edits to this cell
    if (!activeCell.isDirty && !this.canDirtyMoreCells()) {
      this.showReachedDirtyCellLimitModal();
    } else {
      this.setState({activeCell});
    }
  }

  render() {
    const sortedCells = this.getCellsFromState();

    return !this.props.isShowingSpinner && <React.Fragment>
      <OuterContainer>
        {/* CELLS */}
        {sortedCells.map((cell) => (
          <div key={cell.imageUrl} onClick={() => this.handleCellClick(cell)}>
            {cell.isDirty && <UnpublishedChangesLabel />}
            <StudioCell
              clickable
              imageUrl={cell.imageUrl}
              isImageUrlAbsolute={cell.hasNewImage}
              schemaVersion={cell.schemaVersion || SCHEMA_VERSION}
              caption={cell.studioState.caption}
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
        isComicDirty={this.isComicDirty()}
        onCancelClick={() => this.toggleComicActionsModal(false)}
        onDeleteClick={() => this.handleDeleteComicClick()}
        onPublishClick={() => this.handlePublishPreviewClick(() => this.toggleComicActionsModal(false))}
      />}

      {this.state.activeCell && <CellActionsModal
        cell={this.state.activeCell}
        onCancelClick={() => this.setState({ activeCell: null })}
      />}

      {this.state.showPreviewModal && <PublishPreviewModal
        onCancelClick={() => this.togglePreviewModal(false)}
        onPublishClick={() => this.publish()}
        cells={sortedCells}
      />}

      {this.state.showReachedDirtyCellLimitModal && <ReachedDirtyCellLimitModal
        onCancelClick={() => this.hideReachedDirtyCellLimitModal()}
        onPublishClick={() => this.handlePublishPreviewClick(() => this.hideReachedDirtyCellLimitModal())}
      />}

      {this.state.showPublishFailModal && <PublishFailModal
        hasFailedCaptcha={this.state.hasFailedCaptcha}
        onRetryClick={token => this.retryPublish(token)}
        onCancelClick={() => this.cancelPublishAttemp()}
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
};

export default StudioV2 