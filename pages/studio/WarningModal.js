import React from 'react'
import styled from 'styled-components'

import { MenuButton, RedMenuButton } from '../../components/Buttons'

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

const Modal = styled.div`
  color: #FE4A49;
  background-color: #C5D6D8;
  width: 70vw;
  height: 30vh;
  display: flex;
  padding: 1rem;
  border-radius: 1px;
  justify-content: space-around;
  flex-direction: column;
`

const CenteredButtons = styled.div`
  display: flex;
`

const MessageContainer = styled.div`
  font-size: 2rem;
  display: flex;
  justify-content: center;
`

function WarningModal ({ message, onCancelClick, onOkClick, okButtonLabel }) {
  return (<TransparentDarkBackground>
    <Modal>
      <MessageContainer>
        {message}
      </MessageContainer>
      <CenteredButtons>
        <MenuButton onClick={onCancelClick}>
          CANCEL
        </MenuButton>
        <RedMenuButton onClick={onOkClick}>
          {okButtonLabel}
        </RedMenuButton>
      </CenteredButtons>
    </Modal>
  </TransparentDarkBackground>)
}

export default WarningModal