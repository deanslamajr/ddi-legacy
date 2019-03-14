import React from 'react'
import styled from 'styled-components'

import { MenuButton, RedMenuButton, GreenMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

function EmojiEditModal ({ emoji, onCancelClick }) {
 
  return (<Modal>
    <MessageContainer>
      {emoji.emoji}
    </MessageContainer>
    <CenteredButtons>
      <MenuButton onClick={onCancelClick}>
        CANCEL
      </MenuButton>
    </CenteredButtons>
  </Modal>)
}

export default EmojiEditModal