import React from 'react'
import styled from 'styled-components'

import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 1rem auto;
`

const PreviewModalContainer = styled(Modal)`
  height: inherit;
  width: inherit;
`

const CellImage = styled.img`
  width: ${props => props.theme.canvas.width}px;
`;

function PreviewModal ({
  canvasImageUrl,
  onCancelClick,
  onEditCaptionClick,
  onOkClick
}) {
  return (<PreviewModalContainer>
    <MessageContainer>
      Publish this Canvas?
    </MessageContainer>
    <CenteredContainer>
      <CellImage src={canvasImageUrl} />
    </CenteredContainer>
    <CenteredButtons>
      <MenuButton onClick={onEditCaptionClick}>
        CAPTION
      </MenuButton>
    </CenteredButtons>
    <CenteredButtons>
      <PinkMenuButton onClick={onOkClick}>
        PUBLISH
      </PinkMenuButton>
    </CenteredButtons>
    <CenteredButtons>
      <MenuButton onClick={onCancelClick}>
        CANCEL
      </MenuButton>
    </CenteredButtons>
  </PreviewModalContainer>)
}

export default PreviewModal