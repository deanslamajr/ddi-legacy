import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import Head from 'next/head'
import getConfig from 'next/config'

import { Router } from '../../routes'

import { NavButton, BOTTOM_RIGHT } from '../../components/navigation'

import EmojiPicker from './EmojiPicker'
import BuilderMenu from './BuilderMenu'
import ActionsModal from './ActionsModal'
import CaptionModal from './CaptionModal'
import WarningModal from './WarningModal'
import PreviewModal from './PreviewModal'
import PublishFailModal from './PublishFailModal'
import EmojiCanvas from './EmojiCanvas';

import {
  generateCellImage,
  konvaCacheConfig,
  CELL_IMAGE_ID,
  EMOJI_MASK_REF_ID,
  RGBA
} from '../../helpers/konvaDrawingUtils'

import { getApi, sortByOrder } from '../../helpers'

import { CAPTCHA_ACTION_CELL_PUBLISH } from '../../config/constants.json'

import {
  S3_ASSET_FILETYPE,
  STORAGEKEY_STUDIO
} from '../../config/constants.json'

const { publicRuntimeConfig } = getConfig();

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

function generateCellImageFilename () {
  return `${shortid.generate()}.png`
}

function createNewEmojiComponentState (emoji, currentEmojiId) {
  return {
    emoji,
    id: currentEmojiId,
    order: currentEmojiId,
    filters: undefined,
    selectedEmoji: undefined,
    x: 100,
    y: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    size: 100,
    alpha: .5,
    red: 125,
    green: 0,
    blue: 0,
    opacity: 1
  }
}

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
// Studio
class StudioRoute extends Component {
  constructor (props) {
    super(props)
    this.emojiRefs = []

    this.initialState = {
      activeEmojiId: null,
      cellImageUrl: null,
      comicId: this.props.comicId,
      currentEmojiId: 1,
      hasFailedCaptcha: false,
      parentId: this.props.parentId,
      onEmojiSelect: this.createNewEmoji,
      showEmojiPicker: this.props.parentId ? false : true,
      showCaptionModal: false,
      showActionsModal: false,
      showResetWarningModal: false,
      showPublishPreviewModal: false,
      showPublishFailModal: false,
      showSaveButton: true,
      emojis: {},
      title: ''
    }

    const parentsStudioState = this.props.studioState || {}
    // duplicate initial state so that we don't modify the original
    const initialState = Object.assign({}, this.initialState, parentsStudioState)

    this.state = initialState
  }

  static async getInitialProps ({ query, req }) {
    const comicId = query.comicId && query.comicId !== 'new'
      ? query.comicId
      : null

    let parentId = query.cellId && query.cellId !== 'new'
      ? query.cellId
      : null

    let studioState

    if (parentId) {
      const { data } = await axios.get(getApi(`/api/cell/${parentId}`, req))

      if (data && data.studioState) {
        studioState = data.studioState
      }
      // if data fetch returns no results, reset the parentId bc it is not valid
      // @todo do a similar validation for comicId
      else {
        parentId = null
      }
    }

    let backActionPath

    if (comicId && parentId) {
      backActionPath = `/comic/${comicId}`
    } else if (parentId) {
      backActionPath = `/cell/${parentId}`
    } else if (comicId) {
      backActionPath = `/comic/${comicId}`
    } else {
      backActionPath = '/gallery'
    }

    return {
      comicId,
      backActionPath,
      parentId,
      studioState
    }
  }

  doPostEmojiSelect = () => {
    this.updateCache()
    this.updateAllEmojisCache() // clear all outlines
  }

  createNewEmoji = (emoji) => {
    this.setState(({ currentEmojiId, emojis }) => {
      const newEmoji = createNewEmojiComponentState(emoji, currentEmojiId)

      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[newEmoji.id] = newEmoji

      return {
        activeEmojiId: newEmoji.id,
        currentEmojiId: currentEmojiId + 1,
        emojis: clonedEmojis,
        showEmojiPicker: false
      }
    }, this.doPostEmojiSelect)
  }

  getSignedRequest = async (captchaTokens) => {
    let signData = {
      filename: this.cellImageFile.name,
      title: this.state.title
    }

    if (captchaTokens.v2) {
      signData.v2Token = captchaTokens.v2;
    }
    else if (captchaTokens.v3) {
      signData.v3Token = captchaTokens.v3;
    }

    if (this.state.parentId) {
      signData.parentId = this.state.parentId
    }
    if (this.state.comicId) {
      signData.comicId = this.state.comicId
    }

    const { data } = await axios.post('/api/sign', signData)
    return data
  }

  getStudioState = () => {
    return pick(this.state, ['activeEmojiId', 'currentEmojiId', 'emojis', 'showEmojiPicker', 'title', 'parentId'])
  }

  finishCellPublish = async (cellId, comicId) => {
    const studioState = this.getStudioState()

    delete studioState.parentId

    try {
      await axios.put(`/api/cell/${cellId}`, { studioState });
      this.clearCache();
      Router.pushRoute(`/comic/${comicId}`);
    }
    catch (e) {
      // @todo better UX
      console.error(e)
    }
  }

  retryPublish = (token) => {
    this.props.showSpinner()
    this.togglePublishFailModal(false);
    
    this.saveCell(token);
  }

  cancelPublishAttemp = () => {
    this.setState({ showSaveButton: true })
    this.props.hideSpinner();
    this.togglePublishFailModal(false)
  }

  handleSaveCellConfirm = () => {
    this.props.showSpinner();
    this.togglePublishPreviewModal(false);
    this.saveCell();
  } 

  saveCell = async (v2CaptchaToken) => {
    let token
    
    try {
      if (!v2CaptchaToken && publicRuntimeConfig.CAPTCHA_V3_SITE_KEY) {
        token = await this.props.recaptcha.execute(CAPTCHA_ACTION_CELL_PUBLISH);
      }
        
      this.setState({ showSaveButton: false }, async () => {
        try {
          const {
            comicId, id, signedRequest
          } = await this.getSignedRequest({
            v2: v2CaptchaToken,
            v3: token
          });
  
          await uploadImage(this.cellImageFile, signedRequest);
  
          this.finishCellPublish(id, comicId);
        }
        catch (e) {
          const isCaptchaFail = e && e.response && e.response.status === 400;
          // @todo log this
          this.togglePublishFailModal(true, isCaptchaFail);
        }
      })
    }
    catch (e) {
      // @todo log this
      this.togglePublishFailModal(true, false);
    }
  }

  navigateBack = () => {
    this.props.showSpinner()
    this.toggleActionsModal(false)
    Router.pushRoute(this.props.backActionPath)
  }

  openEmojiPicker = () => {
    this.setState({
      onEmojiSelect: this.createNewEmoji,
      showEmojiPicker: true
    })
  }

  closeEmojiPicker = () => {
    this.setState({ showEmojiPicker: false })
  }

  increaseStackOrder = (id) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)

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

      return { emojis: clonedEmojis }
    }, this.updateCache)
  }

  decreaseStackOrder = (id) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)

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

      return { emojis: clonedEmojis }
    }, this.updateCache)
  }

  incrementField = (field, amount, cb = this.updateCache) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] += amount
      
      return { emojis: clonedEmojis }
    }, cb)
  }

  setField = (field, value) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] = value
      
      return { emojis: clonedEmojis }
    }, () => {
      this.updateCache();
      this.updateEmojiCache();
      this.updateMaskCache();
    })
  }

  scaleField = (field, amount) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] *= amount
      
      return { emojis: clonedEmojis }
    }, this.updateCache)
  }

  toggleFilter = () => {
    this.setState(({ activeEmojiId, emojis }) => {
      this.updateEmojiCache(activeEmojiId)
      const clonedEmojis = cloneDeep(emojis)

      clonedEmojis[activeEmojiId].filters = clonedEmojis[activeEmojiId].filters
        ? undefined
        : [RGBA]
      
      return { emojis: clonedEmojis }
    }, this.updateCache)
  }

  updateEmojiCache = (emojiId = this.state.activeEmojiId, useOutline) => {
    const activeEmojiRef = this.emojiRefs[emojiId]

    if (activeEmojiRef) {
      const cacheConfig = useOutline
        ? Object.assign({}, konvaCacheConfig, { drawBorder: true })
        : konvaCacheConfig

      activeEmojiRef.cache(cacheConfig)
    }
  }

  updateAllEmojisCache = () => {
    Object.keys(this.state.emojis).forEach(emoji => this.updateEmojiCache(emoji))
    this.updateMaskCache();
  }

  updateMaskCache = () => {
    this.updateEmojiCache(EMOJI_MASK_REF_ID, true);
  }

  updateEmojiAndSessionCache = () => {
    this.updateAllEmojisCache()
    this.forceUpdate()
  }

  changeActiveEmoji = (id) => {
    this.setState({ activeEmojiId: id }, () => {
      this.updateEmojiAndSessionCache()
      this.updateCache()
    })
  }

  clearCache = () => {
    const store = require('store2')
    store(STORAGEKEY_STUDIO, {})
  }

  resetStudioSession = () => {
    this.clearCache()

    const parentsStudioState = this.props.studioState || {}
    // duplicate initial state so that we don't modify the original
    const initialState = Object.assign({}, this.initialState, parentsStudioState)

    this.setState(initialState, () => this.toggleResetWarningModal(false))
  }

  updateCache = () => {
    const latestState = this.getStudioState()

    const store = require('store2')
    store(STORAGEKEY_STUDIO, latestState)
  }

  restoreFromCache = (cache) => {
    this.setState(cache, this.updateEmojiAndSessionCache);
  }

  handleDragEnd = ({xDiff, yDiff}) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      const activeEmoji = clonedEmojis[activeEmojiId];
      
      clonedEmojis[activeEmojiId].x = activeEmoji.x + xDiff;
      clonedEmojis[activeEmojiId].y = activeEmoji.y + yDiff;
      
      return { emojis: clonedEmojis }
    }, this.updateCache);
  }

  toggleResetWarningModal = (newValue = !this.state.showResetWarningModal) => {
    this.setState({ showResetWarningModal: newValue })
  }

  togglePublishPreviewModal = (newValue = !this.state.showPublishPreviewModal) => {
    this.setState({ showPublishPreviewModal: newValue })
  }

  toggleActionsModal = (newValue) => {
    this.setState({ showActionsModal: newValue })
  }

  toggleCaptionModal = (newValue) => {
    this.setState({ showCaptionModal: newValue })
  }

  togglePublishFailModal = (newValue, hasFailedCaptcha) => {
    this.setState({
      hasFailedCaptcha,
      showPublishFailModal: newValue
    })
  }

  openEmojiPickerToChangeEmoji = (cb = () => {}) => {
    this.setState({
      onEmojiSelect: this.changeEmoji,
      showEmojiPicker: true
    }, cb)
  }

  changeEmoji = (emoji) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      const activeEmoji = clonedEmojis[activeEmojiId]

      activeEmoji.emoji = emoji

      return {
        emojis: clonedEmojis,
        showEmojiPicker: false
      }
    }, this.doPostEmojiSelect)
  } 

  duplicateActiveEmoji = (cb = () => {}) => {
    this.setState(({ activeEmojiId, currentEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      const activeEmoji = clonedEmojis[activeEmojiId]
      const duplicatedActiveEmoji = cloneDeep(activeEmoji)

      // update the duplicate's unique information
      duplicatedActiveEmoji.id = currentEmojiId
      duplicatedActiveEmoji.order = currentEmojiId

      clonedEmojis[currentEmojiId] = duplicatedActiveEmoji

      return {
        activeEmojiId: currentEmojiId,
        currentEmojiId: currentEmojiId + 1,
        emojis: clonedEmojis
      }
    }, () => {
      this.updateEmojiAndSessionCache()
      this.updateCache()
      cb()
    })
  }

  deleteActiveEmoji = (cb = () => {}) => {
    let actionsAfterStateUpdate

    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
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
          cb()
          this.openEmojiPicker()
        }
      }
      else {
        newActiveEmojiId = clonedEmojisValues[0].id
        actionsAfterStateUpdate = cb
      }

      return {
        activeEmojiId: newActiveEmojiId,
        emojis: clonedEmojis
      }
    }, () => {
      this.updateEmojiAndSessionCache()
      this.updateCache()
      actionsAfterStateUpdate()
    })
  }

  onResetClick = () => {
    this.toggleActionsModal(false)
    this.toggleResetWarningModal(true)
  }

  showCaptionModalFromActionsModal = () => {
    this.toggleActionsModal(false)
    this.toggleCaptionModal(true)
  }

  generateCellImage = async (emojis) => {
    const cellImageBlob = await generateCellImage(emojis);
  
    this.cellImageFile = new File([cellImageBlob], generateCellImageFilename(), {
      type: S3_ASSET_FILETYPE,
    });

    return URL.createObjectURL(this.cellImageFile);
  }

  handlePublishClick = async () => {
    this.toggleActionsModal(false)
    this.props.showSpinner()

    const cellImageUrl = await this.generateCellImage(this.state.emojis);

    this.setState({
      cellImageUrl
    }, () => {
      this.togglePublishPreviewModal(true)
      this.props.hideSpinner()
    })
  }

  onCaptionModalSave = async (newTitle) => {
    this.setState({
      title: newTitle
    }, () => {
      this.updateCache();
      this.toggleCaptionModal(false);
    })
  }

  onPickerCancel = () => {
    const resetStudioAndNavidateAway = () => {
      this.resetStudioSession()
      Router.pushRoute(this.props.backActionPath)
    }

    this.state.activeEmojiId
      ? this.closeEmojiPicker()
      : resetStudioAndNavidateAway()
  }

  componentDidMount () {
    const store = require('store2')
    const studioCache = store(STORAGEKEY_STUDIO)

    // restore studio state from localstorage cache if:
    //   * Studio state exists in localstorage 
    //   AND either of the following is true
    //   1. the studio state doesn't have a parentId i.e. studio state of a 'new' studio
    //   2. the cached parentId matches the studio state's parentId i.e. a copied studio state
    if ((studioCache && Object.keys(studioCache).length) &&
     (!this.state.parentId || this.state.parentId === studioCache.parentId)
    ) {
      this.restoreFromCache(studioCache)
      if (!studioCache.activeEmojiId) {
        this.openEmojiPicker()
      }
    }
    else {
      // no studio state to refresh from localstorage
      // but still need to trigger konva cache refresh
      this.updateEmojiAndSessionCache();
    }

    this.props.hideSpinner()
    
    /**
     * @todo step 2 generating emoji items as images
     */
    // getEmojiImageAsUrl()
    //   .then(emojiUrl => {
    //     console.log('emojiUrl', emojiUrl)
    //     this.setState({emojiUrl})

    //     const imageObj = new window.Image();
    //     imageObj.onload = () => {
    //       this.setState({emojiImageObj: imageObj})
    //     };
    //     imageObj.src = emojiUrl.url;
    //   })
  }

  render () {
    const {
      activeEmojiId,
      showActionsModal,
      showResetWarningModal
    } = this.state

    const activeEmoji = this.state.emojis[activeEmojiId]

    return (
      <div>
        <Head>
          <title>DrawDrawInk - Studio</title>
        </Head>

        <div style={{display: 'none'}} id={CELL_IMAGE_ID} />
        {this.state.emojiUrl && <img url={this.state.emojiUrl.url} />}
        <CenteredContainer>
          <EmojiCanvas
            activeEmojiId={this.state.activeEmojiId}
            emojis={this.state.emojis}
            emojiRefs={this.emojiRefs}
            handleDragEnd={this.handleDragEnd}
          />
          {this.state.showSaveButton && (
            <EverythingElseContainer>
              <BuilderMenu
                activeEmoji={activeEmoji}
                changeActiveEmoji={this.changeActiveEmoji}
                decreaseStackOrder={this.decreaseStackOrder}
                emojis={this.state.emojis}
                increaseStackOrder={this.increaseStackOrder}
                incrementField={this.incrementField}
                onChangeClick={this.openEmojiPickerToChangeEmoji}
                onDeleteClick={this.deleteActiveEmoji}
                onDuplicateClick={this.duplicateActiveEmoji}
                openEmojiPicker={this.openEmojiPicker}
                scaleField={this.scaleField}
                setField={this.setField}
                toggleFilter={this.toggleFilter}
              />

              {this.state.showEmojiPicker && <EmojiPicker
                onSelect={this.state.onEmojiSelect}
                onCancel={this.onPickerCancel}
                backButtonLabel={this.state.activeEmojiId ? 'BACK' : 'EXIT'}
              />}
            </EverythingElseContainer>
          )}
        </CenteredContainer>

        {!this.state.showEmojiPicker && <React.Fragment>
          <NavButton
            value='ACTIONS'
            cb={() => this.toggleActionsModal(true)}
            position={BOTTOM_RIGHT}
            accented
          />
        </React.Fragment>}

        {showActionsModal && <ActionsModal
          onCancelClick={() => this.toggleActionsModal(false)}
          onExitClick={() => this.navigateBack()}
          onResetClick={() => this.onResetClick()}
          onPublishClick={() => this.handlePublishClick()}
          toggleCaptionModal={this.showCaptionModalFromActionsModal}
        />}

        {this.state.showPublishFailModal && <PublishFailModal
          hasFailedCaptcha={this.state.hasFailedCaptcha}
          onRetryClick={this.retryPublish}
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
        />}
      </div>
    )
  }
}

export default StudioRoute