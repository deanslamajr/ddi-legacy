import React from 'react'
import styled from 'styled-components'
import Slider from 'react-rangeslider'

import {
  MenuButton,
  RedMenuButton,
  BlueMenuButton,
  GreenMenuButton
} from '../../components/Buttons'

import 'react-rangeslider/lib/index.css'

const CenteredButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SliderContainer = styled.div`
  width: 100%;
  display: block;
`

const HalfMenuButton = styled(MenuButton)`
  width: 124px;
`

const SelectActiveEmojiButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.white};
  border: ${props => props.isActive ? '2px solid red' : 'none'};
  cursor: ${props => props.isActive ? 'default' : 'pointer'};
  font-size: 2rem;
  width: ${props => props.isActive ? '246px' : '250px'};

  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.black};
  }
`

const SliderLabel = styled.div`
  margin: .1rem auto;
  display: flex;
  justify-content: center;
  margin-bottom: -.9rem;
`

const Label = styled.div`
  margin: .1rem auto;
  display: flex;
  justify-content: center;
`

const MAIN = 'MAIN'
const SECONDARY = 'SECONDARY'

class BuilderMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentMenu: MAIN
    }

    this.menus = {
      [MAIN]: this.renderMainMenu,
      [SECONDARY]: this.renderSecondaryMenu
    }
  }

  renderMainMenu = () => {
    const {
      activeEmoji,
      changeActiveEmoji,
      emojis,
      setField,
      updateCache
    } = this.props

    return (<React.Fragment>
      <MenuButton onClick={() => this.setState({ currentMenu: SECONDARY })}>
        MORE
      </MenuButton>
      <SliderContainer>
        <Slider
          min={1}
          max={256}
          value={activeEmoji && activeEmoji.size}
          onChangeStart={() => {}}
          onChange={(value) => setField('size', value)}
          onChangeComplete={() => updateCache()}
        />
      </SliderContainer>

      <GreenMenuButton onClick={this.props.openEmojiPicker}>
        +
      </GreenMenuButton>

      {Object.values(emojis).map(({ emoji, id }) => (<SelectActiveEmojiButton
        key={`${id}${emoji}`}
        type='button'
        isActive={id === activeEmoji.id}
        onClick={() => changeActiveEmoji(id)}
        value={emoji}
      >
        {emoji}
      </SelectActiveEmojiButton>))}
    </React.Fragment>)
  }

  renderSecondaryMenu = () => {
    const {
      activeEmoji,
      decreaseStackOrder,
      increaseStackOrder,
      incrementField,
      scaleField,
      setField,
      toggleFilter,
      updateCache
    } = this.props

    return (<React.Fragment>
      <BlueMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        LESS
      </BlueMenuButton>

      <Label>Z</Label>
      <MenuButton onClick={() => increaseStackOrder()}>
        +
      </MenuButton>
      <MenuButton onClick={() => decreaseStackOrder()}>
        -
      </MenuButton>

      <SliderLabel>ROTATION</SliderLabel>
      <SliderContainer>
        <Slider
          min={-180}
          max={180}
          value={activeEmoji.rotation}
          onChangeStart={() => {}}
          onChange={(value) => setField('rotation', value)}
          onChangeComplete={() => updateCache()}
        />
      </SliderContainer>

      <Label>FLIP</Label>
      <MenuButton onClick={() => scaleField('scaleX', -1)}>
        X
      </MenuButton>
      <MenuButton onClick={() => scaleField('scaleY', -1)}>
        Y
      </MenuButton>

      <CenteredButtons>
        <HalfMenuButton onClick={() => incrementField('y', -5)}>
          UP
        </HalfMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <HalfMenuButton onClick={() => incrementField('x', -5)}>
          LEFT
        </HalfMenuButton>
        <HalfMenuButton onClick={() => incrementField('x', 5)}>
          RIGHT
        </HalfMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <HalfMenuButton onClick={() => incrementField('y', 5)}>
          DOWN
        </HalfMenuButton>
      </CenteredButtons>

      {/* TOGGLE FILTER*/}
      {activeEmoji.filters
        ? (<RedMenuButton onClick={toggleFilter}>RGB</RedMenuButton>)
        : (<GreenMenuButton onClick={toggleFilter}>RGB</GreenMenuButton>)
      }

      {activeEmoji.filters && (<React.Fragment>
        Amount
        <SliderContainer>
          <Slider
            min={0}
            max={1}
            step={.01}
            value={activeEmoji.alpha}
            onChangeStart={() => {}}
            onChange={(value) => setField('alpha', value)}
            onChangeComplete={() => updateCache()}
          />
        </SliderContainer>
        Red
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            value={activeEmoji.red}
            onChangeStart={() => {}}
            onChange={(value) => setField('red', value)}
            onChangeComplete={() => updateCache()}
          />
        </SliderContainer>
        Blue
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            value={activeEmoji.blue}
            onChangeStart={() => {}}
            onChange={(value) => setField('blue', value)}
            onChangeComplete={() => updateCache()}
          />
        </SliderContainer>
        Green
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            value={activeEmoji.green}
            onChangeStart={() => {}}
            onChange={(value) => setField('green', value)}
            onChangeComplete={() => updateCache()}
          />
        </SliderContainer>
      </React.Fragment>)}
    </React.Fragment>)
  }

  render () {
    return (
      <React.Fragment>       
        {this.menus[this.state.currentMenu]()}        
      </React.Fragment>
    )
  }
}

export default BuilderMenu