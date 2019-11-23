import React from 'react'
import styled from 'styled-components'

import { Router } from '../../../routes'
import Cell from '../../../components/Cell'
import Modal, { CenteredButtons } from '../../../components/Modal'
import { PinkMenuButton } from '../../../components/Buttons'

import {SCHEMA_VERSION} from '../../../config/constants.json';

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

const CellPreview = styled(Cell)`
  margin-bottom: 1rem;
`

export default class CellActionsModal extends React.Component {
  navigateToCellStudio = () => {
    Router.pushRoute(`/s/cell/${this.props.cell.urlId}`);
  }

  render () {
    const {
      hasNewImage,
      imageUrl,
      schemaVersion = SCHEMA_VERSION,
      studioState
    } = this.props.cell;

    return (<HomeModal onCancelClick={this.props.onCancelClick}>
      <CellPreview
        imageUrl={imageUrl}
        isImageUrlAbsolute={hasNewImage}
        schemaVersion={schemaVersion}
        caption={studioState.caption}
        removeBorders
      />
      <CenteredButtons>
        <PinkMenuButton onClick={this.navigateToCellStudio}>
          EDIT
        </PinkMenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}