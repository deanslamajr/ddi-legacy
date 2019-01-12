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
    selectedEmoji: undefined,
    x: 0,
    y: 0,
    scale: 1,
    size: 100
  }

  onEmojiSelect = (emoji) => {
    console.log('selected emoji: %o', emoji)
    this.setState({
      chosenEmoji: emoji,
      showEmojiPicker: false
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
    this.setState({ y: this.state.y - 10})
  }

  moveLeft = () => {
    this.setState({ x: this.state.x - 10})
  }

  moveRight = () => {
    this.setState({ x: this.state.x + 10})
  }

  moveDown = () => {
    this.setState({ y: this.state.y + 10})
  }

  makeLarger = () => {
    this.setState({ size: this.state.size + 1 })
  }

  makeSmaller = () => {
    this.setState({ size: this.state.size - 1 })
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
                stroke={'black'}
              />
              {this.state.chosenEmoji && (
                <Text
                  x={this.state.x}
                  y={this.state.y}
                  text={this.state.chosenEmoji}
                  fontSize={this.state.size}
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

          {this.state.showEmojiPicker && <EmojiPicker onSelect={this.onEmojiSelect} />}
        </CenteredContainer>
      </div>
    )
  }
}

export default Test 