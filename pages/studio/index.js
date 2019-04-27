import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import Konva from 'konva'
import { Stage, Layer, Rect, Text } from 'react-konva'
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

import { getApi } from '../../helpers'
import theme from '../../helpers/theme'

import {
  S3_ASSET_FILETYPE,
  STORAGEKEY_STUDIO
} from '../../config/constants.json'

const RGBA = 'RGBA'
const filters = {
  [RGBA]: Konva.Filters.RGBA
}

const konvaCacheConfig = {
  offset: 30,
  pixelRatio: 1, /// fixes android graphics glitch
  //drawBorder: true /// for debugging
}

function generateFilename () {
  return `${shortid.generate()}.png`
}

function sortByOrder ({ order: a }, { order: b }) {
  return a - b
}

function createNewEmoji (emoji, currentEmojiId) {
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
const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6rem;
  /* Hack to fix slider in fully right position making mobile view scroll :( */
  overflow-x: hidden;
`

const FixedCanvasContainer = styled.div`
  position: fixed;
  top: 0;
  z-index: 999;
`

const EverythingElseContainer = styled.div`
  margin-top: 255px;
  width: 250px;
`

//
// Studio
class StudioRoute extends Component {
  constructor (props) {
    super(props)
    this.emojiRefs = []

    this.initialState = {
      activeEmojiId: null,
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
    const backButtonLabel = 'EXIT'

    if (comicId && parentId) {
      //backButtonLabel = 'TO COMIC'
      backActionPath = `/comic/${comicId}`
    } else if (parentId) {
      //backButtonLabel = 'TO CELL'
      backActionPath = `/cell/${parentId}`
    } else if (comicId) {
      //backButtonLabel = 'TO COMIC'
      backActionPath = `/comic/${comicId}`
    } else {
      //backButtonLabel = 'TO GALLERY'
      backActionPath = '/gallery'
    }

    return {
      comicId,
      backActionPath,
      backButtonLabel,
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
      const newEmoji = createNewEmoji(emoji, currentEmojiId)

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

  getSignedRequest = async (file) => {
    let signData = {
      'file-name': file.name,
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

  saveCell = async (event) => {
    this.props.showSpinner()
    this.togglePublishPreviewModal(false)

    this.setState({ showSaveButton: false }, async () => {
      try {
        const {
          comicId,
          id,
          signedRequest
        } = await this.getSignedRequest(this.renderedImageFile)

        const xhr = new XMLHttpRequest()
        xhr.open('PUT', signedRequest)
        xhr.onreadystatechange = async () => {
          if(xhr.readyState === 4){
            if(xhr.status === 200){
              // update cell in DB
              await this.finishCellPublish(id, comicId)
            }
            else{
              // @todo better UX
              console.error('could not upload file!')
            }
          }
        }
        xhr.send(this.renderedImageFile)
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
    Object.keys(this.state.emojis).forEach(emoji => this.updateEmojiCache(emoji, false))
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

  onPublishClick = () => {
    this.toggleActionsModal(false)
    this.props.showSpinner()

    // generate preview
    // clears active emoji border
    this.updateEmojiCache(undefined, false)
    this.incrementField('red', 1) // hack bc we need to get a konva image refresh for the canvas to get the 'remove border' update
    
    this.stage.toCanvas().toBlob((blob) => {
      const file = new File([blob], generateFilename(), {
        type: S3_ASSET_FILETYPE,
      })

      this.renderedImageFile = file

      this.setState({
        renderedImageUrl: URL.createObjectURL(this.renderedImageFile)
      }, () => {
        this.togglePublishPreviewModal(true)
        this.props.hideSpinner()
      })
    })
  }

  onCaptionModalSave = (newTitle) => {
    this.setState({ title: newTitle }, this.updateCache)
    this.toggleCaptionModal(false)
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
      this.forceUpdate()
    }

    this.props.hideSpinner()
  }

  render () {
    const {
      activeEmojiId,
      showActionsModal,
      showResetWarningModal,
      showPublishPreviewModal
    } = this.state

    const activeEmoji = this.state.emojis[activeEmojiId]

    return (
      <div>
        <Head>
          <title>DrawDrawInk - Studio</title>
        </Head>

        <CenteredContainer>
          <FixedCanvasContainer>
            <Stage ref={ref => this.stage = ref} width={250} height={250}>
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={250}
                  height={250}
                  fill={theme.colors.white}
                />
                {Object.values(this.state.emojis).sort(sortByOrder).map(emoji => (<Text
                  draggable={emoji.id === this.state.activeEmojiId}
                  key={`${emoji.id}${emoji.emoji}`}
                  ref={ref => this.emojiRefs[emoji.id] = ref}
                  filters={emoji.filters && emoji.filters.map(filter => filters[filter])}
                  x={emoji.x}
                  y={emoji.y}
                  scaleX={emoji.scaleX}
                  scaleY={emoji.scaleY}
                  text={emoji.emoji}
                  fontSize={emoji.size}
                  rotation={emoji.rotation}
                  alpha={emoji.alpha}
                  red={emoji.red}
                  green={emoji.green}
                  blue={emoji.blue}
                  onDragEnd={this.handleDragEnd}
                  opacity={typeof emoji.opacity !== 'undefined' ? emoji.opacity : 1 /* backwards compatibility */}
                  useCache
                />))}
              </Layer>
            </Stage>
          </FixedCanvasContainer>

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
                toggleCaptionModal={this.toggleCaptionModal}
              />

              {this.state.showEmojiPicker && <EmojiPicker
                onSelect={this.state.onEmojiSelect}
                onCancel={this.onPickerCancel}
                backButtonLabel={this.state.activeEmojiId ? 'BACK' : this.props.backButtonLabel}
              />}
            </EverythingElseContainer>)}
        </CenteredContainer>

        {!this.state.showEmojiPicker && <React.Fragment>
          <NavButton
            value='ACTIONS'
            cb={() => this.toggleActionsModal(true)}
            position={BOTTOM_RIGHT}
            accented
          />
        </React.Fragment>}

        {this.state.showCaptionModal && <CaptionModal
          onCancelClick={() => this.toggleCaptionModal(false)}
          onUpdateClick={this.onCaptionModalSave}
          title={this.state.title || ''}
        />}

        {showActionsModal && <ActionsModal
          onCancelClick={() => this.toggleActionsModal(false)}
          onExitClick={() => this.navigateBack()}
          onResetClick={() => this.onResetClick()}
          onPublishClick={() => this.onPublishClick()}
          backButtonLabel={this.props.backButtonLabel}
        />}

        {showPublishPreviewModal && <PreviewModal
          canvasImageUrl={this.state.renderedImageUrl}
          onCancelClick={() => this.togglePublishPreviewModal(false)}
          onOkClick={() => this.saveCell()}
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