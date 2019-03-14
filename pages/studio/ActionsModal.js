import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons } from '../../components/Modal'
import { RedMenuButton, GreenMenuButton } from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
`

export default class ActionsModal extends React.Component {
  render () {
    const {
      onCancelClick,
      onResetClick,
      onPublishClick
    } = this.props

    return (<HomeModal>
      <CenteredButtons>
        <GreenMenuButton onClick={onPublishClick}>
          PUBLISH
        </GreenMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <RedMenuButton onClick={onResetClick}>
          RESET
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