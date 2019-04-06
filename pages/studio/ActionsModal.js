import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons } from '../../components/Modal'
import { BlueMenuButton, RedMenuButton, GreenMenuButton } from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

export default class ActionsModal extends React.Component {
  render () {
    const {
      onCancelClick,
      onExitClick,
      onResetClick,
      onPublishClick
    } = this.props

    return (<HomeModal>
      <CenteredButtons>
        <BlueMenuButton onClick={onExitClick}>
          BACK
        </BlueMenuButton>
      </CenteredButtons>
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