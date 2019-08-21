import React from 'react'
import styled from 'styled-components'

import {NavButton, TOP_CENTER} from './navigation'

const TransparentDarkBackground = styled.div`
  z-index: 999999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

export const CenteredButtons = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 1rem;
`

const ModalContainer = styled.div`
  background-color: ${props => props.theme.colors.lightGray};
  width: 70vw;
  padding: 1rem;
  border-radius: 1px;

  div:last-of-type {
    margin-bottom: 0;
  }
`

export const MessageContainer = styled.div`
  color: ${props => props.theme.colors.black};
  font-size: 1.5rem;
  text-align: center;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`

const ExitButton = styled(NavButton)`
  font-size: 4rem;
`

function Modal ({ children, className, onCancelClick }) {
  return (<TransparentDarkBackground>
    <ModalContainer className={className}>
      <ExitButton
        accented
        cb={onCancelClick}
        position={TOP_CENTER}
        value='&times;'
      />
      {children}
    </ModalContainer>
  </TransparentDarkBackground>)
}

export default Modal