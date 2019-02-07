import React from 'react'
import styled from 'styled-components'

export const TOP_CENTER = 'TOP_CENTER'
export const BOTTOM_LEFT = 'BOTTOM_LEFT'
export const BOTTOM_CENTER = 'BOTTOM_CENTER'
export const BOTTOM_RIGHT = 'BOTTOM_RIGHT'
export const RED = 'RED'
export const GREEN = 'GREEN'
export const BLUE = 'BLUE'
export const ORANGE = 'ORANGE'

const Button = styled.div`
  border: 1px solid #F7FFF7;
  cursor: pointer;
  z-index: 9999;
  height: 90px;
  width: 90px;
  margin: 0;
  user-select: none;
  color: #F7FFF7;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${props => {
    if (props.color === GREEN) {
      return '#679436'
    }
    else if (props.color === RED) {
      return '#FE4A49'
    }
    else if (props.color === BLUE) {
      return 'blue'
    }
    else if (props.color === ORANGE) {
      return 'orange'
    }
    return 'white'
  }};
`

const BottomLeftButton = styled(Button)`
  bottom: 0;
  left: 0;
`

const BottomCenterButton = styled(Button)`
  margin: 0 auto;
  bottom: 0;
  left: 0;
  right: 0;
`

const BottomRightButton = styled(Button)`
  bottom: 0;
  right: 0;
`

const TopCenterButton = styled(Button)`
  margin: 0 auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
` 

function getButtonByPosition (position) {
  let Button

  switch (position) {
    case TOP_CENTER:
      Button = TopCenterButton
      break
    case BOTTOM_LEFT:
      Button = BottomLeftButton
      break
    case BOTTOM_CENTER:
      Button = BottomCenterButton
      break
    case BOTTOM_RIGHT:
      Button = BottomRightButton
      break
  }

  return Button
}

class NavButton extends React.Component {
  render () {
    const { position, cb, color, value } = this.props

    const PositionedButton = getButtonByPosition(position)

    return (
      <PositionedButton color={color} onClick={cb}>
        {value}
      </PositionedButton>
    )
  }
}

export {
  NavButton
}
