import React from 'react'
import styled from 'styled-components'
import Slider from '@material-ui/lab/Slider'

import NewSlider from '../../components/slider'

import {
  MenuButton,
  RedMenuButton,
  BlueMenuButton,
  GreenMenuButton,
  DisabledButton
} from '../../components/Buttons'

import {
  MIN_SIZE,
  MAX_SIZE,
  MIN_ROTATION,
  MAX_ROTATION,
  MIN_OPACITY,
  MAX_OPACITY,
  MIN_ALPHA,
  MAX_ALPHA,
  MIN_RGB,
  MAX_RGB,
  MAX_EMOJIS_COUNT
} from '../../config/constants.json'

import { sortByOrder } from '../../helpers'

import EmojiEditModal from './EmojiEditModal'

const CenteredButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SliderContainer = styled.div`
  width: 100%;
  padding: 1.5rem 0;

  button {
    width: 2rem;
    height: 2rem;
    background-color: ${props => props.theme.colors.blue};
  }

  /* & div {
    background-color: ${props => props.theme.colors.blue};
  } */
`

const HalfMenuButton = styled(MenuButton)`
  max-width: 124px;
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

const Label = styled.span`
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
const FILTERS = 'FILTERS'

function getOpacity (activeEmoji) {
  const defaultOpacity = 1

  // Backwards compatibility
  if (!activeEmoji || typeof activeEmoji.opacity === 'undefined') {
    return defaultOpacity
  }

  return activeEmoji.opacity
}

class BuilderMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentMenu: MAIN,
      showEmojiEditModal: false
    }

    this.menus = {
      [MAIN]: this.renderMainMenu,
      [SECONDARY]: this.renderSecondaryMenu,
      [FILTERS]: this.renderFiltersMenu
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
      setField
    } = this.props

    const emojisArray = Object.values(emojis)
    const canAddEmojis = emojisArray.length <= MAX_EMOJIS_COUNT

    return (<React.Fragment>
      <MenuButton onClick={() => this.setState({ currentMenu: SECONDARY })}>
        ADVANCED
      </MenuButton>

      {/* SIZE */}
      <SliderContainer>
        {/* <Slider
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={1}
          value={(activeEmoji && activeEmoji.size) || 0}
          onDragEnd={this.onDragEnd}
          onChange={(event, value) => setField('size', value)}
        /> */}
        <NewSlider
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={1}
          value={(activeEmoji && activeEmoji.size) || 0}
          onChangeComplete={this.onDragEnd}
          tooltip={false}
          onChange={(value) => setField('size', value)}
        />
      </SliderContainer>

      {canAddEmojis
        ? (<GreenMenuButton onClick={this.props.openEmojiPicker}>
            +
          </GreenMenuButton>)
        : (<DisabledButton >
            EMOJI LIMIT REACHED
          </DisabledButton>)
      }

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
      toggleCaptionModal
    } = this.props

    return (<React.Fragment>
      <BlueMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        SIMPLE
      </BlueMenuButton>

      <MenuButton onClick={() => toggleCaptionModal(true)}>
        CAPTION
      </MenuButton>

      <SliderContainer>
        <Slider
          min={MIN_ROTATION}
          max={MAX_ROTATION}
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

      <GreenMenuButton onClick={() => this.setState({ currentMenu: FILTERS })}>
        FILTERS
      </GreenMenuButton>
    </React.Fragment>)
  }

  renderFiltersMenu = () => {
    const {
      activeEmoji,
      setField,
      toggleFilter
    } = this.props

    return (<React.Fragment>
      <BlueMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        BACK
      </BlueMenuButton>

      <SliderContainer>
        <Label>OPACITY</Label>
        <Slider
          min={MIN_OPACITY}
          max={MAX_OPACITY}
          step={.01}
          value={getOpacity(activeEmoji)}
          onDragEnd={this.onDragEnd}
          onChange={(event, value) => setField('opacity', value)}
        />
      </SliderContainer>

      {/* TOGGLE FILTER*/}
      {activeEmoji.filters
        ? (<RedMenuButton onClick={toggleFilter}>INACTIVATE RGB</RedMenuButton>)
        : (<GreenMenuButton onClick={toggleFilter}>ACTIVATE RGB </GreenMenuButton>)
      }

      {activeEmoji.filters && (<React.Fragment>
        <SliderContainer>
          <Label>AMOUNT</Label>
          <Slider
            min={MIN_ALPHA}
            max={MAX_ALPHA}
            step={.01}
            value={(activeEmoji && activeEmoji.alpha) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('alpha', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>RED</Label>
          <Slider
            min={MIN_RGB}
            max={MAX_RGB}
            step={1}
            value={(activeEmoji && activeEmoji.red) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('red', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>BLUE</Label>
          <Slider
            min={MIN_RGB}
            max={MAX_RGB}
            step={1}
            value={(activeEmoji && activeEmoji.blue) || 0}
            onDragEnd={this.onDragEnd}
            onChange={(event, value) => setField('blue', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>GREEN</Label>
          <Slider
            min={MIN_RGB}
            max={MAX_RGB}
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