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

const CenteredButtons = styled.div`
  display: flex;
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
      emojis: {}
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
      const { data } = await axios.get(`/sign?file-name=${file.name}&file-type=${file.type}`)
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

          {this.state.showSaveButton && <input type="button" onClick={this.saveCell} value='Save!' />}

          {this.state.activeEmojiId && (<React.Fragment>
            <input type="button" onClick={this.openEmojiPicker} value={activeEmoji.emoji} />

            {/* UP */}
            <input type='button' onClick={() => this.incrementField('y', -10)} value='UP' />
            <CenteredButtons>
              {/* LEFT */}
              <input type='button' onClick={() => this.incrementField('x', -10)} value='LEFT' />
              {/* RIGHT */}
              <input type='button' onClick={() => this.incrementField('x', 10)} value='RIGHT' />
            </CenteredButtons>
            {/* DOWN */}
            <input type='button' onClick={() => this.incrementField('y', 10)} value='DOWN' />

            <CenteredButtons>
              {/* @todo - Use a slider with smaller steps than the current 10 */}
              {/* LARGER */}
              <input type='button' onClick={() => this.incrementField('size', 1)} value='LARGER' />
              {/* SMALLER */}
              <input type='button' onClick={() => this.incrementField('size', -1)} value='SMALLER' />
            </CenteredButtons>

            <CenteredButtons>
              {/* ROTATION -> */}
              <input type='button' onClick={() => this.incrementField('rotation', -10)} value='ROTATE ->' />
              {/* ROTAION <- */}
              <input type='button' onClick={() => this.incrementField('rotation', 10)} value='ROTATE <-' />
            </CenteredButtons>

            <CenteredButtons>
              {/* FLIP X */}
              <input type='button' onClick={() => this.scaleField('scaleX', -1)} value='FLIP X' />
              {/* FLIP Y */}
              <input type='button' onClick={() => this.scaleField('scaleY', -1)} value='FLIP Y' />
            </CenteredButtons>

            {/* TOGGLE FILTER*/}
            <input type='button' onClick={this.toggleFilter} value='TOGGLE FILTER' />
            {activeEmoji.filters && (<React.Fragment>
              <CenteredButtons>
                {/* INCREASE EFFECT OF FILTER */}
                <input type='button' onClick={() => this.incrementField('alpha', .1)} value='INCREASE EFFECT' />
                {/* DECREASE EFFECT OF FILTER */}
                <input type='button' onClick={() => this.incrementField('alpha', -.1)} value='DECREASE EFFECT' />
              </CenteredButtons>
              <CenteredButtons>
                {/* INCREASE RED */}
                <input type='button' onClick={() => this.incrementField('red', 12)} value='INCREASE RED' />
                {/* DECREASE RED */}
                <input type='button' onClick={() => this.incrementField('red', -12)} value='DECREASE RED' />
              </CenteredButtons>
              <CenteredButtons>
                {/* INCREASE BLUE */}
                <input type='button' onClick={() => this.incrementField('blue', 12)} value='INCREASE BLUE' />
                {/* DECREASE BLUE */}
                <input type='button' onClick={() => this.incrementField('blue', -12)} value='DECREASE BLUE' />
              </CenteredButtons>
              <CenteredButtons>
                {/* INCREASE GREEN */}
                <input type='button' onClick={() => this.incrementField('green', 12)} value='INCREASE GREEN' />
                {/* DECREASE GREEN */}
                <input type='button' onClick={() => this.incrementField('green', -12)} value='DECREASE GREEN' />
              </CenteredButtons>
            </React.Fragment>)}
          </React.Fragment>)}

          {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
        </CenteredContainer>
      </div>
    )
  }
}

export default Studio 