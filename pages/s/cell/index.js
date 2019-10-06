import { Component } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import styled from 'styled-components';
import cloneDeep from 'lodash/cloneDeep';

import ActionsModal from './ActionsModal';
import BuilderMenu from './BuilderMenu';
import CaptionModal from './CaptionModal';
import EmojiCanvas from './EmojiCanvas';
import EmojiPicker from './EmojiPicker';
import PreviewModal from './PreviewModal';
import WarningModal from './WarningModal';

import {NavButton, BOTTOM_LEFT, BOTTOM_RIGHT} from '../../../components/navigation'

import { Router } from '../../../routes';

import {generateCellImageFromEmojis} from '../../../helpers/generateCellImageFromEmojis'
import {sortByOrder} from '../../../helpers/sorts'
import theme from '../../../helpers/theme';
import {
  createNewEmojiComponentState,
  konvaCacheConfig,
  EMOJI_MASK_REF_ID,
  EMOJI_MASK_OUTLINE_REF_ID,
  RGBA
} from '../../../helpers/konvaDrawingUtils';

import {APP_TITLE} from '../../../config/constants.json';

const CELL_IMAGE_ID = 'cell-image';

//
// Styled Components
//
const EverythingElseContainer = styled.div`
  margin-top: ${props => props.theme.canvas.width + 5}px;
  width: ${props => props.theme.canvas.width}px;
`

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

    this.initialStudioState = {
      activeEmojiId: null,
      backgroundColor: theme.colors.white,
      caption: '',
      currentEmojiId: 1,
      emojis: {}
    }

    this.state = {
      onEmojiSelect: this.createNewEmoji,
      cellImageUrl: '',
      showEmojiPicker: false,
      showCaptionModal: false,
      showActionsModal: false,
      showResetWarningModal: false,
      showPreviewModal: false,
      studioState: cloneDeep(this.initialStudioState)
    };
  }

  static async getInitialProps ({ query, req, res }) {
    return {
      cellUrlId: query.cellUrlId
    };
  }

  componentDidMount() {
    const {getStudioState} = require('../../../helpers/clientCache');
    const cachedStudioState = getStudioState(this.props.cellUrlId);

    if (cachedStudioState) {
      const showEmojiPicker = Object.keys(cachedStudioState.emojis).length === 0;
      this.setState({
        showEmojiPicker,
        studioState: cachedStudioState
      }, () => {
        this.updateKonvaCache();
        this.updateMaskKonvaCache();
      });
    }
    else {
      this.createNewComicAndCell();
      this.setState({showEmojiPicker: true})
    }

    this.props.hideSpinner();
  }

  /*******
   * Client Cache i.e. localstorage
   ***** 
   **** 
   **/
  clearCache = () => {
    const {clearStudioState} = require('../../../helpers/clientCache');
    // @todo if this cell is a duplicate, pass the duplicated cell's studio state as 2nd argument
    clearStudioState(this.props.cellUrlId);
  }

  createNewComicAndCell = (initialStudioState) => {
    // create new cell in cache
    const {createNewCell} = require('../../../helpers/clientCache');
    const cellUrlId = createNewCell(undefined, initialStudioState);

    Router.pushRoute(`/s/cell/${cellUrlId}`);
  }

  // formerly: updateCache
  saveStudioStateToCache = () => {
    const {
      doesCellUrlIdExist,
      setCellStudioState
    } = require('../../../helpers/clientCache');

    if (!doesCellUrlIdExist(this.props.cellUrlId)) {
      this.createNewComicAndCell(this.state.studioState);
    }
    else {
      setCellStudioState(this.props.cellUrlId, this.state.studioState);
    }
  }

  /*******
   * Konva Cache (some konva changes require a konva object's state to be "cached")
   ***** 
   **** 
   **/
  // formerly: updateEmojiAndSessionCache
  updateAllKonvaCachesAndForceComponentUpdate = () => {
    this.updateAllKonvaCaches();
    this.forceUpdate();
  }

  // formerly: updateAllEmojisCache
  updateAllKonvaCaches = () => {
    // emojis canvas cache updates
    Object.keys(this.state.studioState.emojis).forEach(emoji => this.updateKonvaCache(emoji));
    // mask canvas cache update
    this.updateMaskKonvaCache();
  }

  // formerly: updateEmojiCache
  updateKonvaCache = (emojiId = this.state.studioState.activeEmojiId, useOutline) => {
    const emojiRefToUpdate = this.emojiRefs[emojiId]

    if (emojiRefToUpdate) {
      const cacheConfig = useOutline
        ? Object.assign({}, konvaCacheConfig, { drawBorder: true })
        : konvaCacheConfig

      emojiRefToUpdate.cache(cacheConfig)
    }
  }

  // formerly: updateMaskCache
  updateMaskKonvaCache = () => {
    this.updateKonvaCache(EMOJI_MASK_REF_ID);
    this.updateKonvaCache(EMOJI_MASK_OUTLINE_REF_ID, true);
  }

  /*******
   * Canvas manipulation handlers
   ***** 
   **** 
   **/
  handleDragEnd = ({xDiff, yDiff}) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;
      const activeEmoji = clonedEmojis[activeEmojiId];
      
      clonedEmojis[activeEmojiId].x = activeEmoji.x + xDiff;
      clonedEmojis[activeEmojiId].y = activeEmoji.y + yDiff;
      
      return { studioState: clonedStudioState };
    }, this.saveStudioStateToCache);
  }

  changeActiveEmoji = (id) => {
    this.setState(({studioState}) => {
      const clonedStudioState = cloneDeep(studioState);
      clonedStudioState.activeEmojiId = id;
      return {studioState: clonedStudioState};
    }, () => {
      this.updateAllKonvaCachesAndForceComponentUpdate();
      this.saveStudioStateToCache();
    })
  }

  decreaseStackOrder = (id) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      // get index of activeEmoji
      const activeEmoji = clonedEmojis[id || activeEmojiId]
      const activeEmojiOrder = activeEmoji.order

      if (activeEmojiOrder > 1) {
        const clonedEmojisValues = Object.values(clonedEmojis)

        let emojiToDecrease
        let emojiToDecreaseOrder = activeEmojiOrder
        do {
          emojiToDecreaseOrder -= 1
          emojiToDecrease = clonedEmojisValues.find(({ order }) => order === emojiToDecreaseOrder)
        } while (!emojiToDecrease)

        // swap the order of the two emojis
        activeEmoji.order = emojiToDecrease.order
        emojiToDecrease.order = activeEmojiOrder
      }

      return { studioState: clonedStudioState }
    }, this.saveStudioStateToCache)
  }

  increaseStackOrder = (id) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      // get index of activeEmoji
      const activeEmoji = clonedEmojis[id || activeEmojiId]
      const activeEmojiOrder = activeEmoji.order

      const clonedEmojisValues = Object.values(clonedEmojis)

      if (clonedEmojisValues.length) {
        const topStackOrder = clonedEmojisValues.sort(sortByOrder)[clonedEmojisValues.length - 1].order

        if (activeEmojiOrder < topStackOrder) {        
          let emojiToIncrease
          let emojiToIncreaseOrder = activeEmojiOrder
          do {
            emojiToIncreaseOrder += 1
            emojiToIncrease = clonedEmojisValues.find(({ order }) => order === emojiToIncreaseOrder)
          } while (!emojiToIncrease)

          // swap the order of the two emojis
          activeEmoji.order = emojiToIncrease.order
          emojiToIncrease.order = activeEmojiOrder
        }
      }

      return { studioState: clonedStudioState }
    }, this.saveStudioStateToCache)
  }

  incrementField = (field, amount, cb = this.saveStudioStateToCache) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      clonedEmojis[activeEmojiId][field] += amount;
      
      return {studioState: clonedEmojis};
    }, cb)
  }

  onCaptionModalSave = async (newCaption) => {
    this.setState(({studioState}) => {
      const clonedStudioState = cloneDeep(studioState);
      clonedStudioState.caption = newCaption; 

      return {studioState: clonedStudioState};
    }, () => {
      this.saveStudioStateToCache();
      this.toggleCaptionModal(false);
    })
  }

  onColorChange = (hex) => {
    this.setState(({studioState}) => {
      const clonedStudioState = cloneDeep(studioState);
      clonedStudioState.backgroundColor = hex;

      return {studioState: clonedStudioState}
    }, () => this.saveStudioStateToCache());
  }

  deleteActiveEmoji = (cb = () => {}) => {
    let actionsAfterStateUpdate

    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      delete clonedEmojis[activeEmojiId]

      const clonedEmojisValues = Object.values(clonedEmojis)

      let newActiveEmojiId
      // if this deletes the last emoji
      // 1. clear active emoji
      // 2. bind show emojiPicker function to cb
      if (!clonedEmojisValues.length) {
        // 1.
        newActiveEmojiId = null
        // 2. 
        actionsAfterStateUpdate = () => {
          this.openEmojiPicker();
          cb();
        }
      }
      else {
        newActiveEmojiId = clonedEmojisValues[0].id
        actionsAfterStateUpdate = () => {
          this.updateAllKonvaCachesAndForceComponentUpdate();
          cb();
        };
      }

      clonedStudioState.activeEmojiId = newActiveEmojiId;

      return {studioState: clonedStudioState};
    }, () => {
      this.saveStudioStateToCache();
      actionsAfterStateUpdate();
    })
  }

  duplicateActiveEmoji = (cb = () => {}) => {
    this.setState(({studioState}) => {
      const {
        activeEmojiId, currentEmojiId
      } = studioState;

      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      const activeEmoji = clonedEmojis[activeEmojiId];
      const duplicatedActiveEmoji = cloneDeep(activeEmoji);

      // update the duplicate's unique information
      duplicatedActiveEmoji.id = currentEmojiId;
      duplicatedActiveEmoji.order = currentEmojiId;

      clonedEmojis[currentEmojiId] = duplicatedActiveEmoji;

      return {studioState: clonedStudioState};
    }, () => {
      this.updateAllKonvaCachesAndForceComponentUpdate();
      this.saveStudioStateToCache();
      cb();
    });
  }

  changeEmoji = (emoji) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      const activeEmoji = clonedEmojis[activeEmojiId]

      activeEmoji.emoji = emoji

      return {
        showEmojiPicker: false,
        studioState: clonedStudioState
      };
    }, () => {
      // if bugs with refactor, try replacing 'updateAllKonvaCachesAndForceComponentUpdate' with 'updateAllKonvaCaches'
      // (this was the original implementation)
      this.updateAllKonvaCachesAndForceComponentUpdate();
      this.saveStudioStateToCache();
    })
  } 

  createNewEmoji = (emoji) => {
    this.setState(({studioState}) => {
      const currentEmojiId = studioState.currentEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      const newEmoji = createNewEmojiComponentState(emoji, currentEmojiId);
      clonedEmojis[newEmoji.id] = newEmoji;

      clonedStudioState.activeEmojiId = newEmoji.id;
      clonedStudioState.currentEmojiId = currentEmojiId + 1;

      return {
        studioState: clonedStudioState,
        showEmojiPicker: false
      }
    }, () => {
      // if bugs with refactor, try replacing 'updateAllKonvaCachesAndForceComponentUpdate' with 'updateAllKonvaCaches'
      // (this was the original implementation)
      this.updateAllKonvaCachesAndForceComponentUpdate();
      this.saveStudioStateToCache();
    })
  }

  scaleField = (field, amount) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      clonedEmojis[activeEmojiId][field] *= amount;
      
      return {studioState: clonedStudioState};
    }, this.saveStudioStateToCache);
  }

  setField = (field, value) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      clonedEmojis[activeEmojiId][field] = value;
      
      return {studioState: clonedStudioState};
    }, () => {
      this.saveStudioStateToCache();
      this.updateKonvaCache();
      this.updateMaskKonvaCache();
    });
  }

  setFilterColor = (rgb) => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      clonedEmojis[activeEmojiId].red = rgb.r;
      clonedEmojis[activeEmojiId].blue = rgb.b;
      clonedEmojis[activeEmojiId].green = rgb.g;
      
      return {studioState: clonedStudioState};
    }, () => {
      this.saveStudioStateToCache();
      this.updateKonvaCache();
      this.updateMaskKonvaCache();
    })
  }

  toggleFilter = () => {
    this.setState(({studioState}) => {
      const activeEmojiId = studioState.activeEmojiId;
      const clonedStudioState = cloneDeep(studioState);
      const clonedEmojis = clonedStudioState.emojis;

      clonedEmojis[activeEmojiId].filters = clonedEmojis[activeEmojiId].filters
        ? undefined
        : [RGBA]
      
        return {studioState: clonedStudioState};
    }, () => {
      this.updateKonvaCache();
      this.saveStudioStateToCache();
    })
  }

  resetStudioSession = () => {
    this.clearCache();

    // @todo handle case where this cell is a duplicate of another cell
    // e.g. merge in the studio state from the duplicate

    this.setState({
      showEmojiPicker: true, // @todo false if this is a duplicated comic
      studioState: cloneDeep(this.initialStudioState)
    }, () => this.toggleResetWarningModal(false));
  }

  /*******
   * UI
   ***** 
   **** 
   **/
  closeEmojiPicker = () => {
    this.setState({ showEmojiPicker: false })
  }

  deleteDraft = () => {
    const {deleteCell} = require('../../../helpers/clientCache');
    deleteCell(this.props.cellUrlId);
  }

  exit = () => {
    this.props.showSpinner();

    if (Object.keys(this.state.studioState.emojis).length) {
      const {getComicUrlIdFromCellUrlId} = require('../../../helpers/clientCache');
      const comicUrlId = getComicUrlIdFromCellUrlId(this.props.cellUrlId);
      Router.pushRoute(`/s/comic/${comicUrlId}`);
    }
    else {
      Router.pushRoute('/gallery');
    } 
  }

  handlePreviewClick = async () => {
    this.toggleActionsModal(false);
    this.props.showSpinner();

    const {url: cellImageUrl} = await generateCellImageFromEmojis({
      emojis: this.state.studioState.emojis,
      backgroundColor: this.state.studioState.backgroundColor,
      htmlElementId: CELL_IMAGE_ID
    });

    this.setState({cellImageUrl}, () => {
      this.togglePreviewModal(true);
      this.props.hideSpinner();
    });
  }

  openEmojiPickerToChangeEmoji = (cb = () => {}) => {
    this.setState({
      onEmojiSelect: this.changeEmoji,
      showEmojiPicker: true
    }, cb);
  }

  openEmojiPicker = () => {
    this.setState({
      onEmojiSelect: this.createNewEmoji,
      showEmojiPicker: true
    });
  }

  onPickerCancel = () => {
    if (Object.keys(this.state.studioState.emojis).length) {
      this.closeEmojiPicker();
    }
    else {
      this.deleteDraft();
      this.exit();
    }
  }

  onResetClick = () => {
    this.toggleActionsModal(false);
    this.toggleResetWarningModal(true);
  }

  showCaptionModalFromActionsModal = () => {
    this.toggleActionsModal(false);
    this.toggleCaptionModal(true);
  }

  toggleActionsModal = (newValue) => {
    this.setState({ showActionsModal: newValue });
  }

  toggleCaptionModal = (newValue) => {
    this.setState({ showCaptionModal: newValue });
  }

  togglePreviewModal = (newValue = !this.state.showPreviewModal) => {
    this.setState({ showPreviewModal: newValue })
  }

  toggleResetWarningModal = (newValue = !this.state.showResetWarningModal) => {
    this.setState({ showResetWarningModal: newValue });
  }

  /*******
   * Render method
   ***** 
   **** 
   **/
  render () {
    const activeEmoji = this.state.studioState.emojis[this.state.studioState.activeEmojiId];

    return (
      <div>
        <Head>
          <title>{APP_TITLE} - cell studio</title>
        </Head>

        <div style={{display: 'none'}} id={CELL_IMAGE_ID} />

        <CenteredContainer>
          <EmojiCanvas
            activeEmojiId={this.state.studioState.activeEmojiId}
            backgroundColor={this.state.studioState.backgroundColor}
            emojis={this.state.studioState.emojis}
            emojiRefs={this.emojiRefs}
            handleDragEnd={this.handleDragEnd}
          />
          <EverythingElseContainer>
            <BuilderMenu
              activeEmoji={activeEmoji}
              changeActiveEmoji={this.changeActiveEmoji}
              backgroundColor={this.state.studioState.backgroundColor}
              decreaseStackOrder={this.decreaseStackOrder}
              emojis={this.state.studioState.emojis}
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
              isActionsModalVisible={this.state.showActionsModal}
              toggleFilter={this.toggleFilter}
              renderActionsMenu={({showCanvaColorMenu}) => (
                <ActionsModal
                  onCancelClick={() => this.toggleActionsModal(false)}
                  onCanvasColorSelect={() => showCanvaColorMenu()}
                  onResetClick={() => this.onResetClick()}
                  onPreviewClick={() => this.handlePreviewClick()}
                  toggleCaptionModal={this.showCaptionModalFromActionsModal}
                />
              )}
            />

            {this.state.showEmojiPicker && <EmojiPicker
              onSelect={this.state.onEmojiSelect}
              onCancel={this.onPickerCancel}
              backButtonLabel={this.state.studioState.activeEmojiId ? 'BACK' : 'EXIT'}
            />}
          </EverythingElseContainer>
        </CenteredContainer>

        {!this.state.showEmojiPicker && <NavButton
          value='EXIT'
          cb={() => this.exit()}
          position={BOTTOM_LEFT}
        />}

        {!this.state.showEmojiPicker && <NavButton
          value='ACTIONS'
          cb={() => this.toggleActionsModal(true)}
          position={BOTTOM_RIGHT}
          accented
        />}

        {this.state.showPreviewModal && <PreviewModal
          cellImageUrl={this.state.cellImageUrl}
          onCancelClick={() => this.togglePreviewModal(false)}
          onEditCaptionClick={() => this.toggleCaptionModal(true)}
          caption={this.state.studioState.caption || ''}
        />}

        {this.state.showCaptionModal && <CaptionModal
          onCancelClick={() => this.toggleCaptionModal(false)}
          onUpdateClick={this.onCaptionModalSave}
          caption={this.state.studioState.caption || ''}
        />}

        {this.state.showResetWarningModal && <WarningModal
          message='Reset the Canvas?'
          okButtonLabel='RESET'
          onCancelClick={() => this.toggleResetWarningModal(false)}
          onOkClick={() => this.resetStudioSession()}
        />}
      </div>)
  }
}

CellStudio.propTypes = {
  cellUrlId: PropTypes.string
};

export default CellStudio 