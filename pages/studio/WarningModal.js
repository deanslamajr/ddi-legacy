import React from 'react'
import styled from 'styled-components'

import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

const RedMessageContainer = styled(MessageContainer)`
  color: ${props => props.theme.colors.red};
`

function WarningModal ({ message, onCancelClick, onOkClick, okButtonLabel }) {
  return (<Modal>
    <MessageContainer>
      {message}
    </MessageContainer>
    <CenteredButtons>
      <PinkMenuButton onClick={onCancelClick}>
        CANCEL
      </PinkMenuButton>
      <MenuButton onClick={onOkClick}>
        {okButtonLabel}
      </MenuButton>
    </CenteredButtons>
  </Modal>)
}

export default WarningModal