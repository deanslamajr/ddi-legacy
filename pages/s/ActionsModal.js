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
      onCancelClick,
      onExitClick
    } = this.props

    return (<HomeModal>
      <CenteredButtons>
        <PinkMenuButton onClick={onExitClick}>
          EXIT
        </PinkMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onCancelClick}>
          CANCEL
        </MenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}