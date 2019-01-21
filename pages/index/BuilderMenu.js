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
const STACK_ORDER = 'STACK ORDER'
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
      [STACK_ORDER]: this.renderStackOrderMenu,
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
      <input type='button' onClick={() => this.setState({ currentMenu: STACK_ORDER })} value={STACK_ORDER} />
      <input type='button' onClick={() => this.setState({ currentMenu: RGB })} value={RGB} />
    </React.Fragment>)
  }

  renderStackOrderMenu = () => {
    const { increaseStackOrder, decreaseStackOrder } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}

      {/* UP */}
      <input type='button' onClick={() => increaseStackOrder()} value='MOVE UP' />
      <input type='button' onClick={() => decreaseStackOrder()} value='MOVE DOWN' />
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
    const { activeEmoji, setField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}
      
      <SliderContainer>
        <Slider
          min={1}
          max={256}
          value={activeEmoji.size}
          onChangeStart={() => {}}
          onChange={(value) => setField('size', value)}
          onChangeComplete={() => {}}
        />
      </SliderContainer>
    </React.Fragment>)
  }

  renderRotationMenu = () => {
    const { activeEmoji, setField } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}
        <SliderContainer>
          <Slider
            min={-180}
            max={180}
            value={activeEmoji.rotation}
            onChangeStart={() => {}}
            onChange={(value) => setField('rotation', value)}
            onChangeComplete={() => {}}
          />
        </SliderContainer>
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
      setField,
      toggleFilter
    } = this.props

    return (<React.Fragment>
      {this.renderReturnToMainMenuButton()}
      
      {/* TOGGLE FILTER*/}
      <input type='button' onClick={toggleFilter} value={activeEmoji.filters ? 'TURN OFF' : 'TURN ON'} />

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
            onChangeComplete={() => {}}
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
            onChangeComplete={() => {}}
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
            onChangeComplete={() => {}}
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
            onChangeComplete={() => {}}
          />
        </SliderContainer>
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