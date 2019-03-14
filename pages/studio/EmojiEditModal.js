import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import { RedMenuButton, GreenMenuButton } from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
`

export default class ActionsModal extends React.Component {
  render () {
    const {
      emoji,
      onCancelClick,
      onDeleteClick
    } = this.props

    return (<HomeModal>
      <MessageContainer>
        {emoji ? emoji.emoji : ''}
      </MessageContainer>
      <CenteredButtons>
        <RedMenuButton onClick={onDeleteClick}>
          DELETE
        </RedMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <RedMenuButton onClick={onCancelClick}>
          CANCEL
        </RedMenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}