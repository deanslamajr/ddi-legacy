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
import EmojiPicker from './EmojiPicker'
import BuilderMenu from './BuilderMenu'

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
`

const LoadSpinner = styled.div`
  z-index: 999999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.5);
`

//
// Studio
class StudioRoute extends Component {
  constructor (props) {
    super(props)
    this.emojiRefs = []

    this.initialState = {
      activeEmojiId: null,
      currentEmojiId: 1,
      showEmojiPicker: this.props.isNew ? true : false,
      showLoadSpinner: false,
      showSaveButton: true,
      emojis: {},
      title: 'untitled'
    }

    // initially show load spinner
    const parentsStudioState = this.props.studioState || {}
    const initialState = Object.assign({}, this.initialState, { showLoadSpinner: true }, parentsStudioState)

    this.state = initialState
  }

  static async getInitialProps ({ query, req }) {
    const isNew = query.cellId === 'new'
    let studioState

    if (!isNew) {
      const { data } = await axios.get(getApi(`/cell/${query.cellId}`, req))
      studioState = data.studioState
    }

    return {
      isNew,
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
    try {
      const { data } = await axios.get(`/sign?file-name=${file.name}&file-type=${file.type}&title=${this.state.title}`)
      return data
    }
    catch (e) {
      throw e
    }
  }

  getStudioState = () => {
    return pick(this.state, ['activeEmojiId', 'currentEmojiId', 'emojis', 'showEmojiPicker', 'title'])
  }

  finishCellPublish = async (cellId) => {
    const studioState = this.getStudioState()

    try {
      await axios.put(`/cell/${cellId}`, { studioState })
      Router.pushRoute(`/i/${cellId}`)
    }
    catch (e) {
      console.error(e)
    }
  }

  saveCell = async (event) => {
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
    this.setState(this.initialState)
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

  componentDidMount () {
    if (this.props.isNew) {
      console.log('isNew')
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
    const { showLoadSpinner } = this.state

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
              <TitleInput type='text' value={this.state.title} onChange={this.handleTitleChange} />

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

              {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
            </React.Fragment>)}
        </CenteredContainer>

        <NavButton
          value='GALLERY'
          color={BLUE}
          cb={this.navigateToGallery}
          position={BOTTOM_LEFT}
        />
        <NavButton
          value='RESET'
          color={RED}
          cb={this.resetStudioSession}
          position={BOTTOM_CENTER}
        />
        <NavButton
          value='SAVE'
          color={GREEN}
          cb={this.saveCell}
          position={BOTTOM_RIGHT}
        />

        {showLoadSpinner && <LoadSpinner>TACO</LoadSpinner>}
      </div>
    )
  }
}

export default StudioRoute