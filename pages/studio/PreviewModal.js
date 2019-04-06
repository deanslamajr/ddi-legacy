import React from 'react'
import styled from 'styled-components'

import { MenuButton, GreenMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import Cell from '../../components/Cell'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 1rem auto;
`

const PreviewModalContainer = styled(Modal)`
  height: inherit;
`

function PreviewModal ({
  canvasImageUrl,
  onCancelClick,
  onOkClick,
  title
}) {  
  return (<PreviewModalContainer>
    <MessageContainer>
      Publish this Canvas?
    </MessageContainer>
    <CenteredContainer>
      <Cell imageUrl={canvasImageUrl} title={title} />
    </CenteredContainer>
    <CenteredButtons>
      <MenuButton onClick={onCancelClick}>
        CANCEL
      </MenuButton>
      <GreenMenuButton onClick={onOkClick}>
        PUBLISH
      </GreenMenuButton>
    </CenteredButtons>
  </PreviewModalContainer>)
}

export default PreviewModal