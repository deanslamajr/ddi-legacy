import React from 'react'
import styled from 'styled-components'
import rgbHex from 'rgb-hex'
import hexRgb from 'hex-rgb'

import EmojiEditModal from './EmojiEditModal'

import { Spacer } from '../../../components/Spacer'
import NewSlider from '../../../components/NewSlider'
import {
  MenuButton,
  PinkMenuButton,
  DisabledButton,
} from '../../../components/Buttons'

import theme from '../../../helpers/theme'
import { sortByOrder } from '../../../helpers/sorts'

import {
  MIN_SIZE,
  MAX_SIZE,
  MIN_SKEW,
  MAX_SKEW,
  MIN_ROTATION,
  MAX_ROTATION,
  MIN_OPACITY,
  MAX_OPACITY,
  MIN_ALPHA,
  MAX_ALPHA,
  MAX_EMOJIS_COUNT,
} from '../../../config/constants.json'

// function toRgb (hex) {
//   const cleanedHex = parseInt(hex.substr(1), 16);
//   var r = cleanedHex >> 16;
//   var g = cleanedHex >> 8 & 0xFF;
//   var b = cleanedHex & 0xFF;
//   return {r,g,b};
// }

const toHex = ({ r, g, b }) => `#${rgbHex(r, g, b)}`
const toRgb = (hex) => {
  const { red: r, green: g, blue: b } = hexRgb(hex.substr(1))
  return { r, g, b }
}

const ColorPicker = styled.input`
  padding: 0;
  width: 100%;
  height: 2.75rem;
  /* hack to disable zoom on focus (iOS) */
  /* @see https://stackoverflow.com/questions/2989263/disable-auto-zoom-in-input-text-tag-safari-on-iphone#answer-6394497 */
  font-size: 16px;
`

const CenteredButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const SliderContainer = styled.div`
  width: 100%;
  padding: 0.5rem 0 1.5rem;
`

const HalfMenuButton = styled(MenuButton)`
  max-width: 124px;
`

const SelectActiveEmojiButton = styled(MenuButton)`
  background-color: ${(props) => props.theme.colors.white};
  border: ${(props) =>
    props.isActive ? `2px solid ${props.theme.colors.pink}` : 'none'};
  cursor: ${(props) => (props.isActive ? 'default' : 'pointer')};
  font-size: 2rem;
  height: ${(props) => (props.isActive ? 'calc(2.75rem - 4px)' : '2.75rem')};
  width: ${(props) => (props.isActive ? '246px' : '250px')};
  display: flex;
  justify-content: space-between;

  &:hover {
    background-color: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }
`

const Label = styled.span`
  margin: 0.1rem auto;
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
  white-space: nowrap;
  overflow: hidden;
`

const ChangeLayerButton = styled(ThirdOfAButton)`
  border: 1px solid ${(props) => props.theme.colors.darkGray};
  border-right: ${(props) =>
    !props.isLeft && props.isActive
      ? 'none'
      : `1px solid ${props.theme.colors.darkGray}`};
  width: ${(props) => (props.isActive ? 'calc(20% - 1px)' : '20%')};
  height: ${(props) => (props.isActive ? 'calc(2.75rem - 6px)' : '2.75rem')};
  background-color: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.darkGray};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.colors.pink};
    color: ${(props) => props.theme.colors.black};
  }
`

const AddEmojiButton = styled(PinkMenuButton)`
  font-size: 2.5rem;
`

const NudgeButton = styled(HalfMenuButton)`
  font-size: 2rem;
  margin: 1px auto;
`

const MAIN = 'MAIN'
const SECONDARY = 'SECONDARY'
const FILTERS = 'FILTERS'
const BG_COLOR = 'BG_COLOR'

function getOpacity(activeEmoji) {
  const defaultOpacity = 1

  // Backwards compatibility
  if (!activeEmoji || typeof activeEmoji.opacity === 'undefined') {
    return defaultOpacity
  }

  return activeEmoji.opacity
}

class BuilderMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentMenu: MAIN,
      showEmojiEditModal: false,
    }

    this.menus = {
      [MAIN]: this.renderMainMenu,
      [SECONDARY]: this.renderSecondaryMenu,
      [FILTERS]: this.renderFiltersMenu,
      [BG_COLOR]: this.renderBackgroundColorMenu,
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
    this.props.setField('red', this.props.activeEmoji.red + 0.01)
  }

  renderMainMenu = () => {
    const { activeEmoji, changeActiveEmoji, emojis, setField } = this.props

    const emojisArray = Object.values(emojis)
    const canAddEmojis = emojisArray.length <= MAX_EMOJIS_COUNT

    return (
      <React.Fragment>
        {activeEmoji && (
          <React.Fragment>
            <SliderContainer>
              <Label>SIZE</Label>
              <NewSlider
                min={MIN_SIZE}
                max={MAX_SIZE / 2}
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

            <MenuButton
              onClick={() => this.setState({ currentMenu: SECONDARY })}
            >
              ADVANCED
            </MenuButton>
          </React.Fragment>
        )}

        <Spacer />

        {canAddEmojis ? (
          <AddEmojiButton onClick={this.props.openEmojiPicker}>
            +
          </AddEmojiButton>
        ) : (
          <DisabledButton>EMOJI LIMIT REACHED</DisabledButton>
        )}

        {emojisArray
          .sort(sortByOrder)
          .reverse()
          .map(({ emoji, id }, index) => (
            <SelectActiveEmojiButton
              key={`${id}${emoji}`}
              type="button"
              isActive={id === activeEmoji.id}
              onClick={() =>
                id === activeEmoji.id
                  ? this.toggleEmojiEditModal(true)
                  : changeActiveEmoji(id)
              }
              value={emoji}
            >
              {index !== 0 ? (
                <ChangeLayerButton
                  isActive={id === activeEmoji.id}
                  onClick={(e) => this.increaseStackOrder(e, id)}
                  isLeft
                >
                  ↑
                </ChangeLayerButton>
              ) : (
                <ThirdOfAButton />
              )}
              <EmojiContainer>{emoji}</EmojiContainer>
              {index !== emojisArray.length - 1 ? (
                <ChangeLayerButton
                  isActive={id === activeEmoji.id}
                  onClick={(e) => this.decreaseStackOrder(e, id)}
                >
                  ↓
                </ChangeLayerButton>
              ) : (
                <ThirdOfAButton />
              )}
            </SelectActiveEmojiButton>
          ))}
      </React.Fragment>
    )
  }

  showCanvaColorMenu = () => {
    this.setState({ currentMenu: BG_COLOR })
    this.props.hideActionsMenu()
  }

  renderSecondaryMenu = () => {
    const { activeEmoji, incrementField, scaleField, setField } = this.props

    return (
      <React.Fragment>
        <PinkMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
          SIMPLE
        </PinkMenuButton>

        <Spacer />

        <MenuButton onClick={() => this.setState({ currentMenu: FILTERS })}>
          FILTERS
        </MenuButton>

        <Spacer />

        <Label>SKEW X</Label>
        <NewSlider
          min={MIN_SKEW}
          max={MAX_SKEW}
          step={0.05}
          value={(activeEmoji && activeEmoji.skewX) || 0}
          onChange={(value) => setField('skewX', value)}
        />
        <Label>SKEW Y</Label>
        <NewSlider
          min={MIN_SKEW}
          max={MAX_SKEW}
          step={0.05}
          value={(activeEmoji && activeEmoji.skewY) || 0}
          onChange={(value) => setField('skewY', value)}
        />

        <Spacer />

        <Label>FLIP</Label>
        <CenteredButtons>
          <HalfMenuButton onClick={() => scaleField('scaleX', -1)}>
            X
          </HalfMenuButton>
          <HalfMenuButton onClick={() => scaleField('scaleY', -1)}>
            Y
          </HalfMenuButton>
        </CenteredButtons>

        <Spacer />

        <CenteredButtons>
          <NudgeButton onClick={() => incrementField('y', -1)}>↑</NudgeButton>
        </CenteredButtons>
        <CenteredButtons>
          <NudgeButton onClick={() => incrementField('x', -1)}>←</NudgeButton>
          <NudgeButton onClick={() => incrementField('x', 1)}>→</NudgeButton>
        </CenteredButtons>
        <CenteredButtons>
          <NudgeButton onClick={() => incrementField('y', 1)}>↓</NudgeButton>
        </CenteredButtons>
      </React.Fragment>
    )
  }

  renderBackgroundColorMenu = () => {
    return (
      <React.Fragment>
        <PinkMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
          BACK
        </PinkMenuButton>

        <Spacer />

        <ColorPicker
          type="color"
          value={this.props.backgroundColor}
          onChange={(e) => this.props.onColorChange(e.target.value)}
        />

        <Spacer />

        <MenuButton
          onClick={() => this.props.onColorChange(theme.colors.white)}
        >
          RESET
        </MenuButton>
      </React.Fragment>
    )
  }

  renderFiltersMenu = () => {
    const { activeEmoji, setField, toggleFilter } = this.props

    const rgb = activeEmoji
      ? { r: activeEmoji.red, g: activeEmoji.green, b: activeEmoji.blue }
      : { r: 0, g: 0, b: 0 }

    return (
      <React.Fragment>
        <PinkMenuButton onClick={() => this.setState({ currentMenu: MAIN })}>
          BACK
        </PinkMenuButton>

        <Spacer />

        {activeEmoji.filters && (
          <React.Fragment>
            <ColorPicker
              type="color"
              value={toHex(rgb)}
              onChange={(e) => this.props.setFilterColor(toRgb(e.target.value))}
            />

            <Spacer />

            <SliderContainer>
              <Label>AMOUNT</Label>
              <NewSlider
                min={MIN_ALPHA}
                max={MAX_ALPHA}
                step={0.01}
                value={(activeEmoji && activeEmoji.alpha) || 0}
                onChange={(value) => setField('alpha', value)}
              />
            </SliderContainer>
          </React.Fragment>
        )}

        {/* TOGGLE FILTER*/}
        <MenuButton onClick={toggleFilter}>
          {activeEmoji.filters ? 'DISABLE COLOR' : 'ENABLE COLOR'}
        </MenuButton>

        <Spacer />

        <SliderContainer>
          <Label>OPACITY</Label>
          <NewSlider
            min={MIN_OPACITY}
            max={MAX_OPACITY}
            step={0.01}
            value={getOpacity(activeEmoji)}
            onChange={(value) => setField('opacity', value)}
          />
        </SliderContainer>
      </React.Fragment>
    )
  }

  toggleEmojiEditModal = (newValue) => {
    this.setState({ showEmojiEditModal: newValue })
  }

  render() {
    const {
      activeEmoji,
      onChangeClick,
      onDeleteClick,
      onDuplicateClick,
      renderActionsMenu,
      isActionsModalVisible,
    } = this.props
    const { showEmojiEditModal } = this.state

    return (
      <React.Fragment>
        {this.menus[this.state.currentMenu]()}

        {showEmojiEditModal && (
          <EmojiEditModal
            emoji={activeEmoji}
            onCancelClick={() => this.toggleEmojiEditModal(false)}
            onChangeClick={() =>
              onChangeClick(this.toggleEmojiEditModal.bind(this, false))
            }
            onDeleteClick={() =>
              onDeleteClick(this.toggleEmojiEditModal.bind(this, false))
            }
            onDuplicateClick={() =>
              onDuplicateClick(this.toggleEmojiEditModal.bind(this, false))
            }
          />
        )}

        {isActionsModalVisible &&
          renderActionsMenu({ showCanvaColorMenu: this.showCanvaColorMenu })}
      </React.Fragment>
    )
  }
}

export default BuilderMenu
