import React from 'react'
import styled from 'styled-components'

import Cell from '../../../components/Cell'
import {PinkMenuButton} from '../../../components/Buttons'
import Modal, { CenteredButtons } from '../../../components/Modal'

import {SCHEMA_VERSION} from '../../../config/constants.json'

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
  caption
}) {
  return (<PreviewModalContainer onCancelClick={onCancelClick}>
    <CenteredContainer>
      <Cell
        removeBorders
        imageUrl={cellImageUrl}
        schemaVersion={SCHEMA_VERSION}
        title={caption}
        width="250px"
        isPreview
      />
    </CenteredContainer>
    <CenteredButtons>
      <PinkMenuButton onClick={onEditCaptionClick}>
        CAPTION
      </PinkMenuButton>
    </CenteredButtons>
  </PreviewModalContainer>)
}

export default PreviewModal