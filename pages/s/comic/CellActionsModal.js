import React from 'react'
import styled from 'styled-components'

import Cell from '../../../components/Cell'
import Modal, { CenteredButtons } from '../../../components/Modal'
import { MenuButton } from '../../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

const CellPreview = styled(Cell)`
  margin-bottom: 1rem;
`

export default class CellActionsModal extends React.Component {
  render () {
    const {
      imageUrl,
      schemaVersion,
      title
    } = this.props.cell;

    return (<HomeModal onCancelClick={this.props.onCancelClick}>
      <CellPreview
        imageUrl={imageUrl}
        schemaVersion={schemaVersion}
        title={title}
        removeBorders
      />
      <CenteredButtons>
        <MenuButton>
          EDIT
        </MenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}