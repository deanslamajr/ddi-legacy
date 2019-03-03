import React from 'react'
import styled from 'styled-components'

import { MenuButton, RedMenuButton, GreenMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

const RedMessageContainer = styled(MessageContainer)`
  color: #FE4A49;
`

function WarningModal ({ message, onCancelClick, onOkClick, okButtonLabel, colorTheme }) {
  let OkButton = colorTheme
    ? GreenMenuButton
    : RedMenuButton

  let Message = colorTheme
    ? MessageContainer
    : RedMessageContainer
  
  return (<Modal>
    <Message>
      {message}
    </Message>
    <CenteredButtons>
      <MenuButton onClick={onCancelClick}>
        CANCEL
      </MenuButton>
      <OkButton onClick={onOkClick}>
        {okButtonLabel}
      </OkButton>
    </CenteredButtons>
  </Modal>)
}

export default WarningModal