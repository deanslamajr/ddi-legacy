import React from 'react'
import styled from 'styled-components'

export const TOP_CENTER = 'TOP_CENTER'
export const TOP_RIGHT = 'TOP_RIGHT'
export const BOTTOM_LEFT = 'BOTTOM_LEFT'
export const BOTTOM_CENTER = 'BOTTOM_CENTER'
export const BOTTOM_RIGHT = 'BOTTOM_RIGHT'

const Button = styled.div`
  border: 1px solid ${props => props.theme.colors.white};
  background-color: ${props => props.accented ? props.theme.colors.pink : props.theme.colors.white};
  color: ${props => props.accented ? props.theme.colors.white : props.theme.colors.black};

  cursor: pointer;
  z-index: 9999;
  border-radius: 5rem;
  width: 60px;
  height: 60px;
  margin: .5rem;
  font-size: .9rem;
  text-align: center;
  user-select: none;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props => props.theme.colors.black};
    color: ${props => props.accented ? props.theme.colors.pink : props.theme.colors.white};
  }
`

const BottomLeftButton = styled(Button)`
  bottom: 0;
  left: 0;
`

const BottomCenterButton = styled(Button)`
  margin: .5rem auto;
  bottom: 0;
  left: 0;
  right: 0;
`

const BottomRightButton = styled(Button)`
  bottom: 0;
  right: 0;
`

const TopCenterButton = styled(Button)`
  margin: .5rem auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
` 

const TopRightButton = styled(Button)`
  position: fixed;
  top: 0;
  right: 0;
` 

function getButtonByPosition (position) {
  let Button

  switch (position) {
    case TOP_CENTER:
      Button = TopCenterButton
      break
    case TOP_RIGHT:
      Button = TopRightButton
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
    const { position, cb, className, accented, value } = this.props

    const PositionedButton = getButtonByPosition(position)

    return (
      <PositionedButton className={className} accented={accented} onClick={cb}>
        {value}
      </PositionedButton>
    )
  }
}

export {
  NavButton
}
