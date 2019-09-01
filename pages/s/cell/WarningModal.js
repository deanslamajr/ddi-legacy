import React from 'react'
import styled from 'styled-components'

import { MenuButton } from '../../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../../components/Modal'

const StyledModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

function WarningModal ({ message, onCancelClick, onOkClick, okButtonLabel }) {
  return (<StyledModal onCancelClick={onCancelClick}>
    <MessageContainer>
      {message}
    </MessageContainer>
    <CenteredButtons>
      <MenuButton onClick={onOkClick}>
        {okButtonLabel}
      </MenuButton>
    </CenteredButtons>
  </StyledModal>)
}

export default WarningModal