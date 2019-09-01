import { Component } from 'react'
import PropTypes from 'prop-types';
import Head from 'next/head'
import styled from 'styled-components'
import cloneDeep from 'lodash/cloneDeep';

import EmojiCanvas from './EmojiCanvas';

import { Router } from '../../../routes'
import theme from '../../../helpers/theme'

import {APP_TITLE} from '../../../config/constants.json';

const CELL_IMAGE_ID = 'cell-image';

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6rem;
  /* Hack to fix slider in fully right position making mobile view scroll :( */
  overflow-x: hidden;
`

//
// Cell Studio
class CellStudio extends Component {
  constructor () {
    super();
    this.emojiRefs = [];

    // this.initialStudioState = {
    //   backgroundColor: theme.colors.white,
    //   caption: '',
    //   currentEmojiId: 1,
    //   emojis: {}
    // }

    this.initialStudioState = {
      backgroundColor: theme.colors.white,
      caption: '',
      currentEmojiId: 2,
      emojis: {"1": {
        "emoji": "👨‍🔬",
        "id": 1,
        "order": 1,
        "x": 100,
        "y": 100,
        "scaleX": 1,
        "scaleY": 1,
        "rotation": 0,
        "size": 100,
        "alpha": 0.5,
        "red": 125,
        "green": 0,
        "blue": 0,
        "opacity": 1
      }}
    }

    // this.initialState = {
    //   activeEmojiId: null,
    //   onEmojiSelect: this.createNewEmoji,
    //   showEmojiPicker: true,
    //   showCaptionModal: false,
    //   showActionsModal: false,
    //   showResetWarningModal: false,
    //   showPublishPreviewModal: false,
    //   studioState: this.initialStudioState
    // };

    this.initialState = {
      activeEmojiId: 1,
      onEmojiSelect: this.createNewEmoji,
      showEmojiPicker: true,
      showCaptionModal: false,
      showActionsModal: false,
      showResetWarningModal: false,
      showPublishPreviewModal: false,
      studioState: this.initialStudioState
    };

    this.state = this.initialState
  }

  static async getInitialProps ({ query, req, res }) {
    return {
      cellId: query.cellId
    };
  }

  componentDidMount() {
    const {getStudioState} = require('../../../helpers/clientCache');
    const cachedStudioState = getStudioState(this.props.cellId);

    if (cachedStudioState) {
      this.setState({studioState: cachedStudioState});
    }
    else {
      this.createNewComicAndCell();
    }

    this.props.hideSpinner();
  }

  createNewComicAndCell = (initialStudioState) => {
    // create new cell in cache
    const {createNewCell} = require('../../../helpers/clientCache');
    const cellId = createNewCell(undefined, initialStudioState);

    Router.pushRoute(`/s/cell/${cellId}`);
  }

  saveStudioStateToCache = () => {
    const {
      doesCellIdExist,
      setCellStudioState
    } = require('../../../helpers/clientCache');

    if (!doesCellIdExist(this.props.cellId)) {
      this.createNewComicAndCell(this.state.studioState);
    }
    else {
      setCellStudioState(this.props.cellId, this.state.studioState);
    }
  }

  handleDragEnd = ({xDiff, yDiff}) => {
    this.setState(({ studioState, activeEmojiId }) => {
      const clonedStudioState = cloneDeep(studioState)
      const clonedEmojis = clonedStudioState.emojis;
      const activeEmoji = clonedEmojis[activeEmojiId];
      
      clonedEmojis[activeEmojiId].x = activeEmoji.x + xDiff;
      clonedEmojis[activeEmojiId].y = activeEmoji.y + yDiff;
      
      return { studioState: clonedStudioState }
    }, this.saveStudioStateToCache);
  }

  render () {
    const {
      showActionsModal,
      showResetWarningModal
    } = this.state

    const activeEmoji = this.state.studioState.emojis[this.state.activeEmojiId];

    return (
      <div>
        <Head>
          <title>{APP_TITLE} - cell studio</title>
        </Head>

        <div style={{display: 'none'}} id={CELL_IMAGE_ID} />

        <CenteredContainer>
          <EmojiCanvas
            activeEmojiId={this.state.activeEmojiId}
            backgroundColor={this.state.studioState.backgroundColor}
            emojis={this.state.studioState.emojis}
            emojiRefs={this.emojiRefs}
            handleDragEnd={this.handleDragEnd}
          />
          {/* {this.state.showSaveButton && (
            <EverythingElseContainer>
              <BuilderMenu
                activeEmoji={activeEmoji}
                changeActiveEmoji={this.changeActiveEmoji}
                backgroundColor={this.state.backgroundColor}
                decreaseStackOrder={this.decreaseStackOrder}
                emojis={this.state.emojis}
                increaseStackOrder={this.increaseStackOrder}
                incrementField={this.incrementField}
                onChangeClick={this.openEmojiPickerToChangeEmoji}
                onColorChange={this.onColorChange}
                onDeleteClick={this.deleteActiveEmoji}
                onDuplicateClick={this.duplicateActiveEmoji}
                openEmojiPicker={this.openEmojiPicker}
                scaleField={this.scaleField}
                setField={this.setField}
                setFilterColor={this.setFilterColor}
                hideActionsMenu={() => this.toggleActionsModal(false)}
                isActionsModalVisible={showActionsModal}
                toggleFilter={this.toggleFilter}
                renderActionsMenu={({showCanvaColorMenu}) => (
                  <ActionsModal
                    onCancelClick={() => this.toggleActionsModal(false)}
                    onCanvasColorSelect={() => showCanvaColorMenu()}
                    onResetClick={() => this.onResetClick()}
                    onPublishClick={() => this.handlePublishClick()}
                    toggleCaptionModal={this.showCaptionModalFromActionsModal}
                  />
                )}
              />

              {this.state.showEmojiPicker && <EmojiPicker
                onSelect={this.state.onEmojiSelect}
                onCancel={this.onPickerCancel}
                backButtonLabel={this.state.activeEmojiId ? 'BACK' : 'EXIT'}
              />}
            </EverythingElseContainer>
          )} */}
        </CenteredContainer>

        {/* <NavButton
          value='EXIT'
          cb={() => this.navigateBack()}
          position={BOTTOM_LEFT}
        />

        {!this.state.showEmojiPicker && <React.Fragment>
          <NavButton
            value='ACTIONS'
            cb={() => this.toggleActionsModal(true)}
            position={BOTTOM_RIGHT}
            accented
          />
        </React.Fragment>}

        {this.state.showPublishFailModal && <PublishFailModal
          hasFailedCaptcha={this.state.hasFailedCaptcha}
          onRetryClick={token => this.retryPublish(token)}
          onCancelClick={() => this.cancelPublishAttemp()}
        />}

        {this.state.showPublishPreviewModal && <PreviewModal
          cellImageUrl={this.state.cellImageUrl}
          onCancelClick={() => this.togglePublishPreviewModal(false)}
          onEditCaptionClick={() => this.toggleCaptionModal(true)}
          onOkClick={() => this.handleSaveCellConfirm()}
          title={this.state.title || ''}
        />}

        {this.state.showCaptionModal && <CaptionModal
          onCancelClick={() => this.toggleCaptionModal(false)}
          onUpdateClick={this.onCaptionModalSave}
          title={this.state.title || ''}
        />}

        {showResetWarningModal && <WarningModal
          message='Reset the Canvas?'
          okButtonLabel='RESET'
          onCancelClick={() => this.toggleResetWarningModal(false)}
          onOkClick={() => this.resetStudioSession()}
        />} */}
      </div>)
  }
}

CellStudio.propTypes = {
  shouldCreateNewComic: PropTypes.bool
};

export default CellStudio 