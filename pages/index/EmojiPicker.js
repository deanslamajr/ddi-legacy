import { Component } from 'react'
import { emojiIndex } from 'emoji-mart'
import styled from 'styled-components'

const initialEmojiSet = Object.values(emojiIndex.emojis).filter(emoji => emoji.native).map(o => o.native)

const OuterContainer = styled.div`
  position: absolute;
  background-color: white;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const FillerSpan = styled.span`
  display: inline-block;
  width:15%;
`

const SearchContainer = styled.div`
  width: 99vw;
  margin-top: 1rem;
`

const SearchInput = styled.input`
  display: inline-block;
  font-size: 50px; /* To avoid iOS zoom on click */
  width: 70%;
  background: linear-gradient(#eee, #fff);
  transition: all 0.3s ease-out;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.4);
`

const EmojisContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 2.5rem;
`

const InnerContainer = styled.div`
  position: relative;
  background-color: white;
  
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
        <InnerContainer>
          <SearchContainer>
            <FillerSpan/>
            <SearchInput type='text' name='search' onChange={this.handleChange} />
            <FillerSpan/>
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
    )
  }
}

export default EmojiPicker