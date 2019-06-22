import React from 'react'
import styled from 'styled-components'

import Cell from '../../components/Cell'
import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'

import {SCHEMA_VERSION} from '../../config/constants.json'

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
  max-width: 100vw;
`

function PreviewModal ({
  cellImageUrl,
  onCancelClick,
  onEditCaptionClick,
  onOkClick,
  title
}) {
  return (<PreviewModalContainer>
    <MessageContainer>
      Publish this Canvas?
    </MessageContainer>
    <CenteredContainer>
      <Cell
        removeBorders
        imageUrl={cellImageUrl}
        schemaVersion={SCHEMA_VERSION}
        title={title}
        width="250px"
      />
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