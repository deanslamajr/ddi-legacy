import React from 'react'
import styled from 'styled-components'

import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

const PublishFailModalContainer = styled(Modal)`
  height: inherit;
  width: inherit;
`

function PublishFailModal ({onRetryClick, onCancelClick}) {  
  return (<PublishFailModalContainer>
    <MessageContainer>
      There was an error while publishing this cell :(
    </MessageContainer>
    <CenteredButtons>
      <PinkMenuButton onClick={onRetryClick}>
        TRY AGAIN
      </PinkMenuButton>
    </CenteredButtons>
    <CenteredButtons>
      <MenuButton onClick={onCancelClick}>
        CANCEL
      </MenuButton>
    </CenteredButtons>
  </PublishFailModalContainer>)
}

export default PublishFailModal