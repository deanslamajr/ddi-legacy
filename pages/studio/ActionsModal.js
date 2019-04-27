import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons } from '../../components/Modal'
import { PinkMenuButton, MenuButton } from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

export default class ActionsModal extends React.Component {
  render () {
    const {
      backButtonLabel,
      onCancelClick,
      onExitClick,
      onResetClick,
      onPublishClick
    } = this.props

    return (<HomeModal>
      <CenteredButtons>
        <MenuButton onClick={onExitClick}>
          {backButtonLabel}
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <PinkMenuButton onClick={onPublishClick}>
          PUBLISH
        </PinkMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onResetClick}>
          RESET
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onCancelClick}>
          CANCEL
        </MenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}