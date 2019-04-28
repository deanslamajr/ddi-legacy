import React from 'react'
import styled from 'styled-components'

import NewSlider from '../../components/NewSlider'

import {
  MenuButton,
  PinkMenuButton,
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
  padding: .5rem 0 1.5rem;
`

const HalfMenuButton = styled(MenuButton)`
  max-width: 124px;
`

const SelectActiveEmojiButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.white};
  border: ${props => props.isActive ? `2px solid ${props.theme.colors.pink}` : 'none'};
  cursor: ${props => props.isActive ? 'default' : 'pointer'};
  font-size: 2rem;
  height: ${props => props.isActive ? 'calc(2.75rem - 4px)' : '2.75rem'};
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
  border: 1px solid ${props => props.theme.colors.darkGray};
  border-right: ${props => !props.onLeft && props.isActive ? 'none' : `1px solid ${props.theme.colors.darkGray}`};
  width: ${props => props.isActive ? 'calc(20% - 1px)' : '20%'};
  height: ${props => props.isActive ? 'calc(2.75rem - 6px)' : '2.75rem'};
  background-color: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.darkGray};
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.colors.pink};
    color: ${props => props.theme.colors.black};
  }
`

const AddEmojiButton = styled(PinkMenuButton)`
  font-size: 2.5rem;
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
      <SliderContainer>
        <Label>SIZE</Label>
        <NewSlider
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={1}
          value={(activeEmoji && activeEmoji.size) || 0}
          onChange={(value) => setField('size', value)}
        />
      </SliderContainer>
      <SliderContainer>
        <Label>ROTATION</Label>
        <NewSlider
          min={MIN_ROTATION}
          max={MAX_ROTATION}
          step={1}
          value={(activeEmoji && activeEmoji.rotation) || 0}
          onChange={(value) => setField('rotation', value)}
        />
      </SliderContainer>

      <MenuButton onClick={() => this.setState({ currentMenu: SECONDARY })}>
        ADVANCED
      </MenuButton>
      
      {canAddEmojis
        ? (<AddEmojiButton onClick={this.props.openEmojiPicker}>
            +
          </AddEmojiButton>)
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
              onLeft
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
      incrementField,
      scaleField
    } = this.props

    return (<React.Fragment>
      <PinkMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        SIMPLE
      </PinkMenuButton>

      <MenuButton onClick={() => this.setState({ currentMenu: FILTERS })}>
        FILTERS
      </MenuButton>

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
    </React.Fragment>)
  }

  renderFiltersMenu = () => {
    const {
      activeEmoji,
      setField,
      toggleFilter
    } = this.props

    return (<React.Fragment>
      <PinkMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
        BACK
      </PinkMenuButton>

      <SliderContainer>
        <Label>OPACITY</Label>
        <NewSlider
          min={MIN_OPACITY}
          max={MAX_OPACITY}
          step={.01}
          value={getOpacity(activeEmoji)}
          onChange={(value) => setField('opacity', value)}
        />
      </SliderContainer>

      {/* TOGGLE FILTER*/}
      <MenuButton onClick={toggleFilter}>{activeEmoji.filters ? 'INACTIVATE RGB' : 'ACTIVATE RGB'}</MenuButton>

      {activeEmoji.filters && (<React.Fragment>
        <SliderContainer>
          <Label>AMOUNT</Label>
          <NewSlider
            min={MIN_ALPHA}
            max={MAX_ALPHA}
            step={.01}
            value={(activeEmoji && activeEmoji.alpha) || 0}
            onChange={(value) => setField('alpha', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>RED</Label>
          <NewSlider
            min={MIN_RGB}
            max={MAX_RGB}
            step={1}
            value={(activeEmoji && activeEmoji.red) || 0}
            onChange={(value) => setField('red', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>BLUE</Label>
          <NewSlider
            min={MIN_RGB}
            max={MAX_RGB}
            step={1}
            value={(activeEmoji && activeEmoji.blue) || 0}
            onChange={(value) => setField('blue', value)}
          />
        </SliderContainer>
        
        <SliderContainer>
          <Label>GREEN</Label>
          <NewSlider
            min={MIN_RGB}
            max={MAX_RGB}
            step={1}
            value={(activeEmoji && activeEmoji.green) || 0}
            onChange={(value) => setField('green', value)}
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