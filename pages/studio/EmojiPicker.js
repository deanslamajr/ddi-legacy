import { Component, Fragment } from 'react'
import { emojiIndex } from 'emoji-mart'
import styled from 'styled-components'
import emojiRegexFactory from 'emoji-regex'

import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT } from '../../components/navigation'

const emojis = Object.values(emojiIndex.emojis).filter(emoji => emoji.native).map(o => o.native)

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array#answer-2450976
function shuffle (array) {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

function getReshuffledEmojis () {
  return shuffle(emojis)
}

let initialEmojiSet = getReshuffledEmojis()

const OuterContainer = styled.div`
  position: absolute;
  background-color: ${props => props.theme.colors.gray3};
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SearchContainer = styled.div`
  overflow-x: hidden;
  margin-top: .5rem;
  position: fixed;
  top: 1rem;
  width: 50rem;
  left: 50%;
  margin-left: -400px;
`

const SearchInput = styled.input`
  display: inline-block;
  font-size: 50px; /* To avoid iOS zoom on click */
  width: 70%;
  background: linear-gradient(#eee, #fff);
  transition: all 0.3s ease-out;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.4);
  width: 100%;
  text-align: center;

  &::placeholder {
    color: gray;
    font-size: 50px;
    opacity: 0.5;
  }
`

const EmojisContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 2.5rem;
  margin-top: 6rem;
`

const InnerContainer = styled.div`
  position: relative;
  background-color: ${props => props.theme.colors.white};
`

const EmojiContainer = styled.span`
  width: 5rem;
  height: 5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Emoji = ({ emoji, onSelect }) => {
  return (
    <EmojiContainer onClick={() => onSelect(emoji)} >
      {emoji}
    </EmojiContainer>
  )
}

class EmojiPicker extends Component {
  initialEmojiSet = initialEmojiSet

  state = {
    emojis: this.initialEmojiSet
  }

  shuffleEmojis = () => {
    initialEmojiSet = getReshuffledEmojis()
    this.setState({ emojis: initialEmojiSet })
  }

  handleChange = (event) => {
    const searchValue = event.target.value
    const emojis = searchValue !== ''
      ? emojiIndex.search(event.target.value).sort(o => o.name).map((o) => o.native)
      : this.initialEmojiSet

    if (searchValue && searchValue.length === 1) {
      emojis.unshift(searchValue)
    } else {
      const emojiRegex = emojiRegexFactory()
      const match = emojiRegex.exec(searchValue)
      if (match) {
        emojis.unshift(match[0])
      }
    }

    this.setState({ emojis })
  }

  render () {
    return (
      <Fragment>
        <OuterContainer>
          <InnerContainer>
            <SearchContainer>
              <SearchInput
                type='text'
                name='search'
                onChange={this.handleChange}
                placeholder='search by keyword'
              />
            </SearchContainer>
          
            <EmojisContainer>
              {this.state.emojis.map(emoji => (
                <Emoji
                  key={emoji}
                  emoji={emoji}
                  onSelect={this.props.onSelect}
                />))}
            </EmojisContainer>
          </InnerContainer>
        </OuterContainer>

        <NavButton
          value={this.props.backButtonLabel}
          cb={() => this.props.onCancel()}
          position={BOTTOM_LEFT}
          accented
        />

        <NavButton
          value='SHUFFLE'
          cb={() => this.shuffleEmojis()}
          position={BOTTOM_RIGHT}
        />
      </Fragment>
    )
  }
}

export default EmojiPicker