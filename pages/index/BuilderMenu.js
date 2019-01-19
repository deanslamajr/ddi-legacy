import React from 'react'
import styled from 'styled-components'
import Slider from 'react-rangeslider'

import 'react-rangeslider/lib/index.css'

const CenteredButtons = styled.div`
  display: flex;
`

const SliderContainer = styled.div`
  width: 100%;
  display: block;
`

const MAIN = 'MAIN'
const POSITION = 'POSITION'
const SIZE = 'SIZE'
const ROTATION = 'ROTATION'
const FLIP = 'FLIP'
const RGB = 'RGB'

class BuilderMenu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      currentMenu: MAIN
    }

    this.menus = {
      [MAIN]: this.renderMainMenu,
      [POSITION]: this.renderPositionMenu,
      [SIZE]: this.renderSizeMenu,
      [ROTATION]: this.renderRotationMenu,
      [FLIP]: this.renderFlipMenu,
      [RGB]: this.renderRGBMenu
    }
  }

  renderReturnToMainMenuButton = () => {
    return <input type='button' onClick={() => this.setState({ currentMenu: MAIN })} value='RETURN TO MAIN MENU' />
  }

  renderMainMenu = () => {
    return (<React.Fragment>
      <input type='button' onClick={this.props.openEmojiPicker} value='ADD' />
      <input type='button' onClick={() => this.setState({ currentMenu: POSITION })} value={POSITION} />
      <input type='button' onClick={() => this.setState({ currentMenu: SIZE })} value={SIZE} />
      <input type='button' onClick={() => this.setState({ currentMenu: ROTATION })} value={ROTATION} />
      <input type='button' onClick={() => this.setState({ currentMenu: FLIP })} value={FLIP} />
      <input type='button' onClick={() => this.setState({ currentMenu: RGB })} value={RGB} />
    </React.Fragment>)
  }

  renderPositionMenu = () => {
    const { incrementField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}

      {/* UP */}
      <input type='button' onClick={() => incrementField('y', -10)} value='UP' />
        <CenteredButtons>
          {/* LEFT */}
          <input type='button' onClick={() => incrementField('x', -10)} value='LEFT' />
          {/* RIGHT */}
          <input type='button' onClick={() => incrementField('x', 10)} value='RIGHT' />
        </CenteredButtons>
        {/* DOWN */}
      <input type='button' onClick={() => incrementField('y', 10)} value='DOWN' />
    </React.Fragment>)
  }

  renderSizeMenu = () => {
    const { emojiSize, setField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}
      
      <SliderContainer>
        <Slider
          min={1}
          max={256}
          value={emojiSize}
          onChangeStart={() => {}}
          onChange={(value) => setField('size', value)}
          onChangeComplete={() => {}}
        />
      </SliderContainer>
    </React.Fragment>)
  }

  renderRotationMenu = () => {
    const { incrementField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}

      <CenteredButtons>
        {/* ROTATION -> */}
        <input type='button' onClick={() => incrementField('rotation', -10)} value='ROTATE ->' />
        {/* ROTAION <- */}
        <input type='button' onClick={() => incrementField('rotation', 10)} value='ROTATE <-' />
      </CenteredButtons>
    </React.Fragment>)
  }

  renderFlipMenu = () => {
    const { scaleField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}

      <CenteredButtons>
        {/* FLIP X */}
        <input type='button' onClick={() => scaleField('scaleX', -1)} value='FLIP X' />
        {/* FLIP Y */}
        <input type='button' onClick={() => scaleField('scaleY', -1)} value='FLIP Y' />
      </CenteredButtons>
    </React.Fragment>)
  }

  renderRGBMenu = () => {
    const {
      activeEmoji,
      incrementField,
      toggleFilter
    } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}
      
      {/* TOGGLE FILTER*/}
      <input type='button' onClick={toggleFilter} value='TOGGLE FILTER' />

      {activeEmoji.filters && (<React.Fragment>
        <CenteredButtons>
          {/* INCREASE EFFECT OF FILTER */}
          <input type='button' onClick={() => incrementField('alpha', .1)} value='INCREASE EFFECT' />
          {/* DECREASE EFFECT OF FILTER */}
          <input type='button' onClick={() => incrementField('alpha', -.1)} value='DECREASE EFFECT' />
        </CenteredButtons>
        <CenteredButtons>
          {/* INCREASE RED */}
          <input type='button' onClick={() => incrementField('red', 12)} value='INCREASE RED' />
          {/* DECREASE RED */}
          <input type='button' onClick={() => incrementField('red', -12)} value='DECREASE RED' />
        </CenteredButtons>
        <CenteredButtons>
          {/* INCREASE BLUE */}
          <input type='button' onClick={() => incrementField('blue', 12)} value='INCREASE BLUE' />
          {/* DECREASE BLUE */}
          <input type='button' onClick={() => incrementField('blue', -12)} value='DECREASE BLUE' />
        </CenteredButtons>
        <CenteredButtons>
          {/* INCREASE GREEN */}
          <input type='button' onClick={() => incrementField('green', 12)} value='INCREASE GREEN' />
          {/* DECREASE GREEN */}
          <input type='button' onClick={() => incrementField('green', -12)} value='DECREASE GREEN' />
        </CenteredButtons>
      </React.Fragment>)}
    </React.Fragment>)
  }

  render () {
    const {
      activeEmoji,
      changeActiveEmoji,
      emojis
    } = this.props

    return (
      <React.Fragment>
        <CenteredButtons>
          {Object.values(emojis).map(({ emoji, id }) => (<input
            key={`${id}${emoji}`}
            type='button'
            disabled={id === activeEmoji.id}
            onClick={() => changeActiveEmoji(id)}
            value={emoji}
          />))}
        </CenteredButtons>
        
        {this.menus[this.state.currentMenu]()}        
      </React.Fragment>
    )
  }
}

export default BuilderMenu