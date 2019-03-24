import React from 'react'
import styled from 'styled-components'
import Slider from '@material-ui/lab/Slider'

import {
  MenuButton,
  RedMenuButton,
  BlueMenuButton,
  GreenMenuButton
} from '../../components/Buttons'
import { NavButton } from '../../components/navigation'

import { sortByOrder } from '../../helpers'

import EmojiEditModal from './EmojiEditModal'

const CenteredButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SliderContainer = styled.div`
  width: 100%;
  padding: 2rem 0;

  button {
    width: 2rem;
    height: 2rem;
  }
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
  display: flex;
  justify-content: space-between;

  &:hover {
    background-color: ${props => props.theme.colors.black};
    color: ${props => props.theme.colors.white};
  }
`

const Label = styled.div`
  margin: .1rem auto;
  display: flex;
  justify-content: center;
  user-select: none;
`

const ThirdOfAButton = styled.span`
  height: 100%;
  width: 20%;
  justify-content: center;
  display: flex;
`

const EmojiContainer = styled(ThirdOfAButton)`
  width: 40%;
`

const ChangeLayerButton = styled(ThirdOfAButton)`
  border: 1px solid ${props => props.isIncrease ? props.theme.colors.clearGreen : props.theme.colors.clearRed};
  width: ${props => props.isActive ? 'calc(20% - 1px)' : '20%'};
  background-color: ${props => props.isIncrease ? props.theme.colors.clearerGreen : props.theme.colors.clearerRed};
  color: ${props => props.isIncrease ? props.theme.colors.clearGreen : props.theme.colors.clearRed};

  &:hover {
    background-color: ${props => props.isIncrease ? props.theme.colors.green : props.theme.colors.red};
    color: ${props => props.theme.colors.black};
  }
`

const MAIN = 'MAIN'
const SECONDARY = 'SECONDARY'

class BuilderMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentMenu: MAIN,
      showEmojiEditModal: false
    }

    this.menus = {
      [MAIN]: this.renderMainMenu,
      [SECONDARY]: this.renderSecondaryMenu
    }
  }

  increaseStackOrder = (e, id) => {
    // Don't open the "edit emoji" modal
    e.stopPropagation()
    e.preventDefault()

    this.props.increaseStackOrder(id)
  }

  decreaseStackOrder = (e, id) => {
    // Don't open the "edit emoji" modal
    e.stopPropagation()
    e.preventDefault()

    this.props.decreaseStackOrder(id)
  }

  onDragEnd = (a, b) => {
    // Hack to force the canvas to redraw with the latest active emoji values
    // Need to pass a new value to a field that is passed to the konva <Text /> instance associated with the active emoji
    this.props.setField('red', this.props.activeEmoji.red + .01)
  }

  renderMainMenu = () => {
    const {
      activeEmoji,
      changeActiveEmoji,
      emojis,
      setField,
      updateCache
    } = this.props

    const emojisArray = Object.values(emojis)

    return (<React.Fragment>
      <MenuButton onClick={() => this.setState({ currentMenu: SECONDARY })}>
        ADVANCED
      </MenuButton>

      {/* SIZE */}
      <SliderContainer>
        <Slider
          min={1}
          max={256}
          step={1}
          value={(activeEmoji && activeEmoji.size) || 0}
          onDragEnd={this.onDragEnd}
          onChange={(event, value) => setField('size', value)}
        />
      </SliderContainer>

      <GreenMenuButton onClick={this.props.openEmojiPicker}>
        +
      </GreenMenuButton>

      {emojisArray.sort(sortByOrder).reverse().map(({ emoji, id }, index) => (<SelectActiveEmojiButton
        key={`${id}${emoji}`}
        type='button'
        isActive={id === activeEmoji.id}
        onClick={() => id === activeEmoji.id ? this.toggleEmojiEditModal(true) : changeActiveEmoji(id)}
        value={emoji}
      >
        {index !== 0
          ? (<ChangeLayerButton
              isActive={id === activeEmoji.id}
              onClick={(e) => this.increaseStackOrder(e, id)}
              isIncrease
            >
              ↑
            </ChangeLayerButton>)
          : <ThirdOfAButton/>}
        <EmojiContainer>{emoji}</EmojiContainer>
        {index !== emojisArray.length - 1 
          ? (<ChangeLayerButton
              isActive={id === activeEmoji.id}
              onClick={(e) => this.decreaseStackOrder(e, id)}
            >
              ↓
            </ChangeLayerButton>)
          : <ThirdOfAButton/>}
      </SelectActiveEmojiButton>))}
    </React.Fragment>)
  }

  renderSecondaryMenu = () => {
    const {
      activeEmoji,
      incrementField,
      scaleField,
      setField,
      toggleFilter,
      updateCache
    } = this.props

    return (<React.Fragment>
      <BlueMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        SIMPLE
      </BlueMenuButton>

      <SliderContainer>
        <Slider
          min={-180}
          max={180}
          step={1}
          value={(activeEmoji && activeEmoji.rotation) || 0}
          onDragEnd={this.onDragEnd}
          onChange={(event, value) => setField('rotation', value)}
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
        <Label>AMOUNT</Label>
        <SliderContainer>
          <Slider
            min={0}
            max={1}
            step={.01}
            value={(activeEmoji && activeEmoji.alpha) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('alpha', value)}
          />
        </SliderContainer>
        <Label>RED</Label>
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            step={1}
            value={(activeEmoji && activeEmoji.red) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('red', value)}
          />
        </SliderContainer>
        <Label>BLUE</Label>
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            step={1}
            value={(activeEmoji && activeEmoji.blue) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('blue', value)}
          />
        </SliderContainer>
        <Label>GREEN</Label>
        <SliderContainer>
          <Slider
            min={0}
            max={255}
            step={1}
            value={(activeEmoji && activeEmoji.green) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('green', value)}
          />
        </SliderContainer>
      </React.Fragment>)}
    </React.Fragment>)
  }

  toggleEmojiEditModal = (newValue) => {
    this.setState({ showEmojiEditModal: newValue })
  }

  render () {
    const {
      activeEmoji,
      onChangeClick,
      onDeleteClick,
      onDuplicateClick
    } = this.props
    const { showEmojiEditModal } = this.state

    return (
      <React.Fragment>       
        {this.menus[this.state.currentMenu]()}

        {showEmojiEditModal && <EmojiEditModal
          emoji={activeEmoji}
          onCancelClick={() => this.toggleEmojiEditModal(false)}
          onChangeClick={() => onChangeClick(this.toggleEmojiEditModal.bind(this, false))}
          onDeleteClick={() => onDeleteClick(this.toggleEmojiEditModal.bind(this, false))}
          onDuplicateClick={() => onDuplicateClick(this.toggleEmojiEditModal.bind(this, false))}
        />}
      </React.Fragment>
    )
  }
}

export default BuilderMenu