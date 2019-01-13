import { Component } from 'react'
import { emojiIndex } from 'emoji-mart'
import styled from 'styled-components'

const initialEmojiSet = Object.values(emojiIndex.emojis).filter(emoji => emoji.native).map(o => o.native)

const OuterContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SearchInput = styled.input`
  width: 70%;
`

const EmojisContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: 2.5rem;

`

const EmojiContainer = styled.span`
  margin: 1rem;
`

const Emoji = ({ emoji, onSelect }) => {
  return (
    <EmojiContainer onClick={() => onSelect(emoji)} >
      {emoji}
    </EmojiContainer>
  )
}

class EmojiPicker extends Component {
  state = {
    emojis: initialEmojiSet
  }

  handleChange = (event) => {
    const searchValue = event.target.value
    const emojis = searchValue !== ''
      ? emojiIndex.search(event.target.value).sort(o => o.name).map((o) => o.native)
      : initialEmojiSet

    this.setState({ emojis })
  }

  render () {
    return (
      <OuterContainer>
        <SearchInput type='text' name='search' onChange={this.handleChange} />
        <EmojisContainer>
          {this.state.emojis.map(emoji => (
            <Emoji
              key={emoji}
              emoji={emoji}
              onSelect={this.props.onSelect}
            />))}
        </EmojisContainer>
      </OuterContainer>
    )
  }
}

export default EmojiPicker