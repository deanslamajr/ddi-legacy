import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import Konva from 'konva'
import { Stage, Layer, Rect, Text } from 'react-konva'
import axios from 'axios'
import getConfig from 'next/config'
import shortid from 'shortid'
import cloneDeep from 'lodash/cloneDeep'

import { GrayBackground, MobileViewportSettings } from '../../components/Layouts'
import { GreenMenuButton } from '../../components/Buttons'
import EmojiPicker from './EmojiPicker'
import BuilderMenu from './BuilderMenu'

const konvaCacheConfig = { offset: 10 }
let currentEmojiId = 0

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

function createNewEmoji (emoji) {
  currentEmojiId = currentEmojiId + 1
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
`

const TitleInput = styled.textarea`
  font-size: 16px;
  margin: .5rem;
  height: 4rem;
  width: 15rem;
`

//
// Studio
class Studio extends Component {
  constructor (props) {
    super(props)
    this.emojiRefs = []

    this.state = {
      activeEmojiId: null,
      showEmojiPicker: true,
      showSaveButton: true,
      emojis: {},
      title: 'untitled'
    }
  }

  onEmojiSelect = (emoji) => {
    this.setState(({ emojis }) => {
      const newEmoji = createNewEmoji(emoji)

      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[newEmoji.id] = newEmoji

      return {
        activeEmojiId: newEmoji.id,
        emojis: clonedEmojis,
        showEmojiPicker: false
      }
    }, () => this.updateEmojiCache())
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

  saveCell = async (event) => {
    this.setState({ showSaveButton: false })

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
        xhr.onreadystatechange = () => {
          if(xhr.readyState === 4){
            if(xhr.status === 200){
              Router.pushRoute(`/i/${id}`)
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
    }, () => this.updateEmojiCache())
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
    }, () => this.updateEmojiCache())
  }

  incrementField = (field, amount) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] += amount
      
      return { emojis: clonedEmojis }
    }, () => this.updateEmojiCache())
  }

  setField = (field, value) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] = value
      
      return { emojis: clonedEmojis }
    }, () => this.updateEmojiCache())
  }

  scaleField = (field, amount) => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)
      clonedEmojis[activeEmojiId][field] *= amount
      
      return { emojis: clonedEmojis }
    }, () => this.updateEmojiCache())
  }

  toggleFilter = () => {
    this.setState(({ activeEmojiId, emojis }) => {
      const clonedEmojis = cloneDeep(emojis)

      clonedEmojis[activeEmojiId].filters = clonedEmojis[activeEmojiId].filters
        ? undefined
        : [Konva.Filters.RGBA]
      
      return { emojis: clonedEmojis }
    }, () => this.updateEmojiCache())
  }

  changeColor = (color, amount) => {
    this.setState({ [color]: this.state[color] + amount }, () => {
      this.updateEmojiCache()
    })
  }

  updateEmojiCache = () => {
    console.log('updating emoji cache...')
    Object.values(this.emojiRefs).map(emojiRef => emojiRef.cache(konvaCacheConfig))
  }

  changeActiveEmoji = (id) => {
    this.setState({ activeEmojiId: id })
  }

  handleTitleChange = (event) => {
    this.setState({ title: event.target.value})
  }

  render () {
    const activeEmoji = this.state.emojis[this.state.activeEmojiId]

    console.log('activeEmoji:%o', activeEmoji)
    console.log('this.emojiRefs:%o', this.emojiRefs)

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
                filters={emoji.filters}
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
              />))}
            </Layer>
          </Stage>

          {this.state.showSaveButton && (
            <React.Fragment>
              <TitleInput type='text' value={this.state.title} onChange={this.handleTitleChange} />

              {this.state.activeEmojiId && <BuilderMenu
                activeEmoji={activeEmoji}
                changeActiveEmoji={this.changeActiveEmoji}
                decreaseStackOrder={this.decreaseStackOrder}
                emojis={this.state.emojis}
                increaseStackOrder={this.increaseStackOrder}
                incrementField={this.incrementField}
                openEmojiPicker={this.openEmojiPicker}
                scaleField={this.scaleField}
                emojiSize={activeEmoji.size}
                setField={this.setField}
                toggleFilter={this.toggleFilter}
              />}

              <GreenMenuButton onClick={this.saveCell}>
                Save!
              </GreenMenuButton>

              {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
            </React.Fragment>)}
        </CenteredContainer>
      </div>
    )
  }
}

export default Studio 