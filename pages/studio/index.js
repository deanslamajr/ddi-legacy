import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import Konva from 'konva'
import { Stage, Layer, Rect, Text } from 'react-konva'
import axios from 'axios'
import getConfig from 'next/config'
import shortid from 'shortid'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'

import { GrayBackground, MobileViewportSettings } from '../../components/Layouts'
import { NavButton, BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT, BLUE, GREEN, RED } from '../../components/navigation'
import LoadSpinner from '../../components/LoadSpinner'

import EmojiPicker from './EmojiPicker'
import BuilderMenu from './BuilderMenu'
import WarningModal from './WarningModal'

import { getApi } from '../../helpers'

import { STORAGEKEY_STUDIO } from '../../config/constants.json'

const RGBA = 'RGBA'
const filters = {
  [RGBA]: Konva.Filters.RGBA
}

const konvaCacheConfig = {
  offset: 30,
  pixelRatio: 1, /// fixes android graphics glitch
  //drawBorder: true /// for debugging
}

//
// Environment variables
// @see {@link https://nextjs.org/docs/#exposing-configuration-to-the-server--client-side}
const { publicRuntimeConfig } = getConfig()

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
    blue: 0
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
`

const TitleInput = styled.textarea`
  font-size: 16px;
  margin: .5rem;
  height: 4rem;
  width: 244px;
  padding: 3px;
  outline: none;
  resize: none;

  &::placeholder {
    color: gray;
    opacity: 0.5;
  }
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
      showEmojiPicker: this.props.parentId ? false : true,
      showLoadSpinner: false,
      showResetWarningModal: false,
      showSaveWarningModal: false,
      showSaveButton: true,
      emojis: {},
      title: ''
    }

    // initially show load spinner
    const parentsStudioState = this.props.studioState || {}
    const initialState = Object.assign({}, this.initialState, { showLoadSpinner: true }, parentsStudioState)

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

    return {
      comicId,
      parentId,
      studioState
    }
  }

  doPostEmojiSelect = () => {
    this.updateCache()
    this.updateAllEmojisCache() // clear all outlines
    this.outlineActiveEmoji()
  }

  onEmojiSelect = (emoji) => {
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
    let requestUrlPath = `/api/sign?file-name=${file.name}&file-type=${file.type}&title=${this.state.title}`

    if (this.state.parentId) {
      requestUrlPath = `${requestUrlPath}&parent-id=${this.state.parentId}`
    }
    if (this.state.comicId) {
      requestUrlPath = `${requestUrlPath}&comic-id=${this.state.comicId}`
    }

    try {
      const { data } = await axios.get(requestUrlPath)
      return data
    }
    catch (e) {
      throw e
    }
  }

  getStudioState = () => {
    return pick(this.state, ['activeEmojiId', 'currentEmojiId', 'emojis', 'showEmojiPicker', 'title', 'parentId'])
  }

  finishCellPublish = async (cellId) => {
    const studioState = this.getStudioState()

    delete studioState.parentId

    try {
      await axios.put(`/api/cell/${cellId}`, { studioState })
      Router.pushRoute(`/cell/${cellId}`)
    }
    catch (e) {
      console.error(e)
    }
  }

  saveCell = async (event) => {
    this.toggleSaveWarningModal(false)
    this.setState({ showLoadSpinner: true }, () => {
      // clears active emoji border
      this.updateEmojiCache(undefined, false)
      this.incrementField('red', 1, this.clearCache) // hack bc we need to get a konva image refresh for the canvas to get the 'remove border' update

      this.setState({ showSaveButton: false }, () => {
        this.stage.toCanvas().toBlob(async (blob) => {
          const file = new File([blob], generateFilename(), {
            type: 'image/png',
          })
    
          try {
            const {
              id,
              signedRequest } = await this.getSignedRequest(file)
    
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', signedRequest)
            xhr.onreadystatechange = async () => {
              if(xhr.readyState === 4){
                if(xhr.status === 200){
                  // update cell in DB
                  await this.finishCellPublish(id)
                }
                else{
                  console.error('could not upload file!')
                }
              }
            }
            xhr.send(file)
          }
          catch (e) {
            console.error(e)
          }
        })
      })
    })
  }

  navigateToGallery = () => {
    Router.pushRoute('/gallery')
  }

  openEmojiPicker = () => {
    this.setState({ showEmojiPicker: true })
  }

  closeEmojiPicker = () => {
    this.setState({ showEmojiPicker: false })
  }

  increaseStackOrder = () => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)

      // get index of activeEmoji
      const activeEmoji = clonedEmojis[activeEmojiId]
      const activeEmojiOrder = activeEmoji.order

      if (activeEmojiOrder < Object.keys(this.state.emojis).length) {
        const clonedEmojisValues = Object.values(clonedEmojis)
        const emojiToDecreaseOrder = clonedEmojisValues.find(({ order }) => order === activeEmojiOrder + 1)

        // increase the order of activeEmoji
        activeEmoji.order = activeEmojiOrder + 1
        
        // decrease the order of the emoji with order === activeEmoji.order + 1
        emojiToDecreaseOrder.order = activeEmojiOrder
      }

      return { emojis: clonedEmojis }
    }, this.updateCache)
  }

  decreaseStackOrder = () => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)

      // get index of activeEmoji
      const activeEmoji = clonedEmojis[activeEmojiId]
      const activeEmojiOrder = activeEmoji.order

      if (activeEmojiOrder > 1) {
        const clonedEmojisValues = Object.values(clonedEmojis)
        const emojiToDecreaseOrder = clonedEmojisValues.find(({ order }) => order === activeEmojiOrder - 1)

        // decrease the order of activeEmoji
        activeEmoji.order = activeEmojiOrder - 1
        
        // increase the order of the emoji with order === activeEmoji.order - 1
        emojiToDecreaseOrder.order = activeEmojiOrder
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
      this.updateEmojiCache(activeEmojiId)

      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] = value
      
      return { emojis: clonedEmojis }
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
  }

  changeActiveEmoji = (id) => {
    this.setState({ activeEmojiId: id }, this.updateEmojiAndSessionCache)
  }

  handleTitleChange = (event) => {
    this.setState({ title: event.target.value}, this.updateCache)
  }

  clearCache = () => {
    const store = require('store2')
    store(STORAGEKEY_STUDIO, {})
  }

  resetStudioSession = () => {
    this.clearCache()

    delete this.initialState.parentId

    this.setState(this.initialState, () => this.toggleResetWarningModal(false))
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

  toggleSaveWarningModal = (newValue = !this.state.showSaveWarningModal) => {
    this.setState({ showSaveWarningModal: newValue })
  }

  componentDidMount () {
    if (!this.state.parentId) {
      const store = require('store2')
      const studioCache = store(STORAGEKEY_STUDIO)

      if (studioCache) {
        studioCache.showLoadSpinner = false

        this.restoreFromCache(studioCache)
      }
    }

    this.setState({ showLoadSpinner: false })
  }

  render () {
    const { showLoadSpinner, showResetWarningModal, showSaveWarningModal } = this.state

    const activeEmoji = this.state.emojis[this.state.activeEmojiId]

    return (
      <div>
        <MobileViewportSettings />
        <GrayBackground />
        <CenteredContainer>
          <Stage ref={ref => this.stage = ref} width={250} height={250}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={250}
                height={250}
                fill='white'
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
                useCache
              />))}
            </Layer>
          </Stage>

          {this.state.showSaveButton && (
            <React.Fragment>
              <TitleInput
                type='text'
                placeholder='add a caption'
                value={this.state.title}
                onChange={this.handleTitleChange}
              />

              <BuilderMenu
                activeEmoji={activeEmoji}
                changeActiveEmoji={this.changeActiveEmoji}
                decreaseStackOrder={this.decreaseStackOrder}
                emojis={this.state.emojis}
                increaseStackOrder={this.increaseStackOrder}
                incrementField={this.incrementField}
                openEmojiPicker={this.openEmojiPicker}
                scaleField={this.scaleField}
                setField={this.setField}
                toggleFilter={this.toggleFilter}
                updateCache={this.updateCache}
                updateEmojiCache={this.updateEmojiCache}
              />

              {this.state.showEmojiPicker && <EmojiPicker
                onSelect={this.onEmojiSelect}
                onCancel={this.state.activeEmojiId ? this.closeEmojiPicker : this.navigateToGallery}
              />}
            </React.Fragment>)}
        </CenteredContainer>

        {!this.state.showEmojiPicker && <React.Fragment>
          <NavButton
            value='GALLERY'
            color={BLUE}
            cb={this.navigateToGallery}
            position={BOTTOM_LEFT}
          />
          <NavButton
            value='RESET'
            color={RED}
            cb={() => this.toggleResetWarningModal(true)}
            position={BOTTOM_CENTER}
          />
          <NavButton
            value='SAVE'
            color={GREEN}
            cb={() => this.toggleSaveWarningModal(true)}
            position={BOTTOM_RIGHT}
          />
        </React.Fragment>}

        {showSaveWarningModal && <WarningModal
          message='Save the Canvas?'
          okButtonLabel='SAVE'
          onCancelClick={() => this.toggleSaveWarningModal(false)}
          onOkClick={() => this.saveCell()}
          colorTheme='GREEN'
        />}

        {showResetWarningModal && <WarningModal
          message='Clear the Canvas?'
          okButtonLabel='CLEAR CANVAS'
          onCancelClick={() => this.toggleResetWarningModal(false)}
          onOkClick={() => this.resetStudioSession()}
        />}

        {showLoadSpinner && <LoadSpinner />}
      </div>
    )
  }
}

export default StudioRoute