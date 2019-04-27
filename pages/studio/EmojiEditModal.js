import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import { 
  PinkMenuButton,
  MenuButton
} from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
`

export default class ActionsModal extends React.Component {
  render () {
    const {
      emoji,
      onCancelClick,
      onChangeClick,
      onDeleteClick,
      onDuplicateClick
    } = this.props

    return (<HomeModal>
      <MessageContainer>
        {emoji ? emoji.emoji : ''}
      </MessageContainer>
      <CenteredButtons>
        <MenuButton onClick={onChangeClick}>
          CHANGE
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onDuplicateClick}>
          DUPLICATE
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onDeleteClick}>
          DELETE
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <PinkMenuButton onClick={onCancelClick}>
          CANCEL
        </PinkMenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}