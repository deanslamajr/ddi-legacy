import Head from 'next/head'
import { Router } from '../../routes'
import { Component } from 'react'
import styled from 'styled-components'
import Konva from 'konva'
import { Stage, Layer, Rect, Text } from 'react-konva'
import axios from 'axios'
import getConfig from 'next/config'
import shortid from 'shortid'

import EmojiPicker from './EmojiPicker'

const konvaCacheConfig = { offset: 10 }

// Environment variables
// @see {@link https://nextjs.org/docs/#exposing-configuration-to-the-server--client-side}
const { publicRuntimeConfig } = getConfig()

function generateFilename () {
  return `${shortid.generate()}.png`
}

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const CenteredButtons = styled.div`
  display: flex;
`

class Test extends Component {
  state = {
    showEmojiPicker: true,
    showSaveButton: true,
    // Emoji
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

  onEmojiSelect = (emoji) => {
    this.setState({
      chosenEmoji: emoji,
      showEmojiPicker: false
    }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
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

  moveUp = () => {
    this.setState({ y: this.state.y - 10}, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  moveLeft = () => {
    this.setState({ x: this.state.x - 10}, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  moveRight = () => {
    this.setState({ x: this.state.x + 10}, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  moveDown = () => {
    this.setState({ y: this.state.y + 10}, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  makeLarger = () => {
    this.setState({ size: this.state.size + 1 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  makeSmaller = () => {
    this.setState({ size: this.state.size - 1 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  anticlockwiseRotation = () => {
    this.setState({ rotation: this.state.rotation - 10 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  clockwiseRotation = () => {
    this.setState({ rotation: this.state.rotation + 10 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  flipX = () => {
    this.setState({ scaleX: this.state.scaleX * -1 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  flipY = () => {
    this.setState({ scaleY: this.state.scaleY * -1 }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  toggleFilter = () => {
    const filters = this.state.filters
      ? undefined
      : [Konva.Filters.RGBA]

    this.setState({ filters }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  changeColor = (color, amount) => {
    this.setState({ [color]: this.state[color] + amount }, () => {
      this.emoji.cache(konvaCacheConfig)
    })
  }

  render () {
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <CenteredContainer>
          <Stage ref={ref => this.stage = ref} width={250} height={250}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={250}
                height={250}
                stroke='black'
                fill='white'
              />
              {this.state.chosenEmoji && (
                <Text
                  ref={ref => this.emoji = ref}
                  filters={this.state.filters}
                  x={this.state.x}
                  y={this.state.y}
                  scaleX={this.state.scaleX}
                  scaleY={this.state.scaleY}
                  text={this.state.chosenEmoji}
                  fontSize={this.state.size}
                  rotation={this.state.rotation}
                  alpha={this.state.alpha}
                  red={this.state.red}
                  green={this.state.green}
                  blue={this.state.blue}
                />
              )}
            </Layer>
          </Stage>

          {this.state.showSaveButton && <input type="button" onClick={this.saveCell} value='Save!' />}

          {this.state.chosenEmoji && <input type="button" onClick={this.openEmojiPicker} value={this.state.chosenEmoji} />}

          {/* UP */}
          {this.state.chosenEmoji && <input type='button' onClick={this.moveUp} value='UP' />}
          <CenteredButtons>
            {/* LEFT */}
            {this.state.chosenEmoji && <input type='button' onClick={this.moveLeft} value='LEFT' />}
            {/* RIGHT */}
            {this.state.chosenEmoji && <input type='button' onClick={this.moveRight} value='RIGHT' />}
          </CenteredButtons>
          {/* DOWN */}
          {this.state.chosenEmoji && <input type='button' onClick={this.moveDown} value='DOWN' />}

          <CenteredButtons>
            {/* @todo - Use a slider with smaller steps than the current 10 */}
            {/* LARGER */}
            {this.state.chosenEmoji && <input type='button' onClick={this.makeLarger} value='LARGER' />}
            {/* SMALLER */}
            {this.state.chosenEmoji && <input type='button' onClick={this.makeSmaller} value='SMALLER' />}
          </CenteredButtons>

          <CenteredButtons>
            {/* ROTATION -> */}
            {this.state.chosenEmoji && <input type='button' onClick={this.anticlockwiseRotation} value='ROTATE ->' />}
            {/* ROTAION <- */}
            {this.state.chosenEmoji && <input type='button' onClick={this.clockwiseRotation} value='ROTATE <-' />}
          </CenteredButtons>

          <CenteredButtons>
            {/* FLIP X */}
            {this.state.chosenEmoji && <input type='button' onClick={this.flipX} value='FLIP X' />}
            {/* FLIP Y */}
            {this.state.chosenEmoji && <input type='button' onClick={this.flipY} value='FLIP Y' />}
          </CenteredButtons>

          {/* TOGGLE FILTER*/}
          {this.state.chosenEmoji && <input type='button' onClick={this.toggleFilter} value='TOGGLE FILTER' />}
          {this.state.filters && (<React.Fragment>
            <CenteredButtons>
              {/* INCREASE EFFECT OF FILTER */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('alpha', .1)} value='INCREASE EFFECT' />}
              {/* DECREASE EFFECT OF FILTER */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('alpha', -.1)} value='DECREASE EFFECT' />}
            </CenteredButtons>
            <CenteredButtons>
              {/* INCREASE RED */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('red', 12)} value='INCREASE RED' />}
              {/* DECREASE RED */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('red', -12)} value='DECREASE RED' />}
            </CenteredButtons>
            <CenteredButtons>
              {/* INCREASE BLUE */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('blue', 12)} value='INCREASE BLUE' />}
              {/* DECREASE BLUE */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('blue', -12)} value='DECREASE BLUE' />}
            </CenteredButtons>
            <CenteredButtons>
              {/* INCREASE GREEN */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('green', 12)} value='INCREASE GREEN' />}
              {/* DECREASE GREEN */}
              {this.state.chosenEmoji && <input type='button' onClick={() => this.changeColor('green', -12)} value='DECREASE GREEN' />}
            </CenteredButtons>
          </React.Fragment>)}

          {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
        </CenteredContainer>
      </div>
    )
  }
}

export default Test 