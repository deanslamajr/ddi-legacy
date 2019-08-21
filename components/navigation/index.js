import React from 'react'
import styled from 'styled-components'

import {buttonShadow, media} from '../../helpers/style-utils'

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
  font-size: .9rem;
  text-align: center;
  user-select: none;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: .5rem;

  ${buttonShadow()}

  ${media.phoneMax`
    margin: 3px;
  `}

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

  ${media.phoneMax`
    margin: 3px auto;
  `}
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

  ${media.phoneMax`
    margin: 3px auto;
  `}
` 

const TopRightButton = styled(Button)`
  position: fixed;
  top: 0;
  right: 0;
` 

function getButtonByPosition (position) {
  let button

  switch (position) {
    case TOP_CENTER:
      button = TopCenterButton
      break
    case TOP_RIGHT:
      button = TopRightButton
      break
    case BOTTOM_LEFT:
      button = BottomLeftButton
      break
    case BOTTOM_CENTER:
      button = BottomCenterButton
      break
    case BOTTOM_RIGHT:
      button = BottomRightButton
      break
    default:
      button = Button
  }

  return button
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
