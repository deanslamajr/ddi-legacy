import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import { 
  BlueMenuButton,
  RedMenuButton,
  GreenMenuButton
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
        <BlueMenuButton onClick={onChangeClick}>
          CHANGE
        </BlueMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <GreenMenuButton onClick={onDuplicateClick}>
          DUPLICATE
        </GreenMenuButton>
      </CenteredButtons>
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