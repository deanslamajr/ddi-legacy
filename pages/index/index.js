import Head from 'next/head'
import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import Konva from 'konva'
import { Stage, Layer, Rect, Text } from 'react-konva'
import axios from 'axios'
import getConfig from 'next/config'
import shortid from 'shortid'
import cloneDeep from 'lodash/cloneDeep'

import { GrayBackground } from '../../components/Layouts'
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

function createNewEmoji (emoji) {
  return {
    emoji,
    id: ++currentEmojiId,
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

    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
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
              {Object.keys(this.state.emojis).sort().map(emojiId => {
                const emoji = this.state.emojis[emojiId]
                
                return <Text
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
                />
              })}
            </Layer>
          </Stage>

          {this.state.showSaveButton && (
            <React.Fragment>
              <input type='button' onClick={this.saveCell} value='Save!' />

              <input type='text' value={this.state.title} onChange={this.handleTitleChange} />

              {this.state.activeEmojiId && <BuilderMenu
                activeEmoji={activeEmoji}
                changeActiveEmoji={this.changeActiveEmoji}
                emojis={this.state.emojis}
                incrementField={this.incrementField}
                openEmojiPicker={this.openEmojiPicker}
                scaleField={this.scaleField}
                emojiSize={activeEmoji.size}
                setField={this.setField}
                toggleFilter={this.toggleFilter}
              />}

              {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
            </React.Fragment>)}
        </CenteredContainer>
      </div>
    )
  }
}

export default Studio 