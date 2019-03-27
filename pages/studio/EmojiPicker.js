import { Component, Fragment } from 'react'
import { emojiIndex } from 'emoji-mart'
import styled from 'styled-components'

import { NavButton, BOTTOM_LEFT, BOTTOM_RIGHT, BLUE } from '../../components/navigation'

// from https://thekevinscott.com/emojis-in-javascript/
const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/

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
  background-color: ${props => props.theme.colors.white};
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
          value='BACK'
          color={BLUE}
          cb={() => this.props.onCancel()}
          position={BOTTOM_LEFT}
        />

        <NavButton
          value='SHUFFLE'
          color={BLUE}
          cb={() => this.shuffleEmojis()}
          position={BOTTOM_RIGHT}
        />
      </Fragment>
    )
  }
}

export default EmojiPicker