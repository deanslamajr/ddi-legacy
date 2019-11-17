import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer } from '../../../components/Modal'
import { PinkMenuButton } from '../../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

export default class PublishPreviewModal extends React.Component {
  render () {
    return (<HomeModal onCancelClick={this.props.onCancelClick}>
      <MessageContainer>
        You've reached the limit of unpublished cells.
        Please publish before adding or changing additional cells.
      </MessageContainer>
              
      <CenteredButtons>
        <PinkMenuButton onClick={() => this.props.onPublishClick()}>
          PUBLISH
        </PinkMenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}