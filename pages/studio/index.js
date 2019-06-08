import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import Head from 'next/head'
import qs from 'query-string'

import { NavButton, BOTTOM_RIGHT } from '../../components/navigation'

import EmojiPicker from './EmojiPicker'
import BuilderMenu from './BuilderMenu'
import ActionsModal from './ActionsModal'
import CaptionModal from './CaptionModal'
import WarningModal from './WarningModal'
import PreviewModal from './PreviewModal'
import EmojiCanvas from './EmojiCanvas';

import {
  generateCellImage,
  generateCaptionImage,
  konvaCacheConfig,
  CELL_IMAGE_ID,
  CAPTION_IMAGE_ID,
  RGBA
} from '../../helpers/konvaDrawingUtils'

import { getApi, sortByOrder } from '../../helpers'

import {
  S3_ASSET_FILETYPE,
  STORAGEKEY_STUDIO
} from '../../config/constants.json'

const EMOJI_IMAGE_ID = 'emoji-image';

function uploadImage(imageFile, signedRequest) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedRequest)
    xhr.onreadystatechange = async () => {
      if(xhr.readyState === 4){
        if(xhr.status === 200){
          // update cell in DB
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

function generateCellCaptionFilename (cellImageFilename) {
  const filenameTokens = cellImageFilename
    ? cellImageFilename.split('.')
    : shortid.generate(); // case where cellImageFilename does not exist e.g. actions->caption before ever viewing preview modal
  return `${filenameTokens[0]}_caption.png`
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
      captionImageUrl: null,
      cellImageUrl: null,
      comicId: this.props.comicId,
      currentEmojiId: 1,
      parentId: this.props.parentId,
      onEmojiSelect: this.createNewEmoji,
      showEmojiPicker: this.props.parentId ? false : true,
      showCaptionModal: false,
      showActionsModal: false,
      showResetWarningModal: false,
      showPublishPreviewModal: false,
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
    this.outlineActiveEmoji()
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

  getSignedRequest = async () => {
    let signData = {
      'file-name': this.cellImageFile.name,
      'caption-filename': this.captionImageFile.name,
      title: this.state.title
    }

    if (this.state.parentId) {
      signData['parent-id'] = this.state.parentId
    }
    if (this.state.comicId) {
      signData['comic-id'] = this.state.comicId
    }

    const queryString = qs.stringify(signData)
    const requestUrlPath = `/api/sign?${queryString}`

    try {
      const { data } = await axios.get(requestUrlPath)
      return data
    }
    catch (e) {
      // @todo improve UX
      throw e
    }
  }

  getStudioState = () => {
    return pick(this.state, ['activeEmojiId', 'currentEmojiId', 'emojis', 'showEmojiPicker', 'title', 'parentId'])
  }

  finishCellPublish = async (cellId, comicId) => {
    const studioState = this.getStudioState()

    delete studioState.parentId

    try {
      this.clearCache()
      await axios.put(`/api/cell/${cellId}`, { studioState })
      Router.pushRoute(`/comic/${comicId}`)
    }
    catch (e) {
      // @todo better UX
      console.error(e)
    }
  }

  saveCell = async () => {
    this.props.showSpinner()
    this.togglePublishPreviewModal(false)

    this.setState({ showSaveButton: false }, async () => {
      try {
        const {captionSignData, signData} = await this.getSignedRequest();
        const {
          comicId,
          id,
          signedRequest
        } = signData;

        await uploadImage(this.cellImageFile, signedRequest);
        await uploadImage(this.captionImageFile, captionSignData.signedRequest);

        this.finishCellPublish(id, comicId);
      }
      catch (e) {
        // @todo better UX
        console.error(e)
      }
    })
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
      this.updateCache()
      this.updateEmojiCache()
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

  updateEmojiCache = (emojiId = this.state.activeEmojiId, useOutline = true) => {
    const activeEmojiRef = this.emojiRefs[emojiId]

    if (activeEmojiRef) {
      const cacheConfig = useOutline
        ? Object.assign({}, konvaCacheConfig, { drawBorder: true })
        : konvaCacheConfig

      activeEmojiRef.cache(cacheConfig)
    }
  }

  updateAllEmojisCache = () => {
    Object.keys(this.state.emojis).forEach(emoji => this.updateEmojiCache(emoji, this.state.activeEmojiId === emoji.id))
  }

  updateEmojiAndSessionCache = () => {
    this.updateAllEmojisCache()
    this.outlineActiveEmoji()
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

  outlineActiveEmoji = () => {
    // set outline
    this.updateEmojiCache(undefined, true)
  }

  restoreFromCache = (cache) => {
    this.setState(cache, this.updateEmojiAndSessionCache)
  }

  handleDragEnd = (e) => {
    const { x, y } = e.target.attrs

    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId].x = x
      clonedEmojis[activeEmojiId].y = y
      
      return { emojis: clonedEmojis }
    }, this.updateCache)
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

  generateCellImage = async (state) => {
    const cellImageBlob = await generateCellImage(state.emojis);
  
    this.cellImageFile = new File([cellImageBlob], generateCellImageFilename(), {
      type: S3_ASSET_FILETYPE,
    });

    return URL.createObjectURL(this.cellImageFile);
  }

  generateCaptionImage = async (caption) => {
    if (caption && caption.length > 0) {
      const captionImageBlob = await generateCaptionImage(caption);

      const cellImageFilename = this.cellImageFile && this.cellImageFile.name;

      this.captionImageFile = new File([captionImageBlob], generateCellCaptionFilename(cellImageFilename), {
        type: S3_ASSET_FILETYPE,
      });
      
      return URL.createObjectURL(this.captionImageFile);
    } else {
      return null;
    }
  }

  handleImagesGeneration = async () => {
    this.toggleActionsModal(false)
    this.props.showSpinner()

    // generate preview
    // clears active emoji border
    this.updateEmojiCache(undefined, false)
    this.incrementField('red', 1) // hack bc we need to get a konva image refresh for the canvas to get the 'remove border' update

    const cellImageUrl = await this.generateCellImage(this.state);
    const captionImageUrl = await this.generateCaptionImage(this.state.title);

    this.setState({
      captionImageUrl,
      cellImageUrl
    }, () => {
      this.togglePublishPreviewModal(true)
      this.props.hideSpinner()
    })
  }

  onCaptionModalSave = async (newTitle) => {
    this.props.showSpinner();

    const captionImageUrl = await this.generateCaptionImage(newTitle); 

    this.setState({
      captionImageUrl,
      title: newTitle
    }, () => {
      this.updateCache();
      this.toggleCaptionModal(false);
      this.props.hideSpinner()
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

    if (studioCache && Object.keys(studioCache).length) {
      // if the cached parentId matches the current parentId, refresh from cache
      if (!this.state.parentId || this.state.parentId === studioCache.parentId) {
        this.restoreFromCache(studioCache)
        if (!studioCache.activeEmojiId) {
          this.openEmojiPicker()
        }
      }
    }
    else {
      this.outlineActiveEmoji()
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
        <div style={{display: 'none'}} id={CAPTION_IMAGE_ID} />
        <div style={{display: 'none'}} id={EMOJI_IMAGE_ID} />
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
          onPublishClick={() => this.handleImagesGeneration()}
          toggleCaptionModal={this.showCaptionModalFromActionsModal}
        />}

        {this.state.showPublishPreviewModal && <PreviewModal
          captionImageUrl={this.state.captionImageUrl}
          cellImageUrl={this.state.cellImageUrl}
          onCancelClick={() => this.togglePublishPreviewModal(false)}
          onEditCaptionClick={() => this.toggleCaptionModal(true)}
          onOkClick={() => this.saveCell()}
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