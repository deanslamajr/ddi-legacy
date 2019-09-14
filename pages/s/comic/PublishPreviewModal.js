import React from 'react'
import styled from 'styled-components'

import Cell from '../../../components/Cell'
import Modal, { CenteredButtons, MessageContainer } from '../../../components/Modal'
import { PinkMenuButton } from '../../../components/Buttons'

import theme from '../../../helpers/theme'

import {SCHEMA_VERSION} from '../../../config/constants.json';

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

const StudioCell = styled(Cell)`
  margin: 0 auto;
  width: ${props => props.width}px;
`

const CellsContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 70vh;
  margin: 2rem auto; 
  width: 270px;
  max-width: calc(100vw - ${props => props.theme.padding}px);
`
const CellContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: auto;
`

export default class PublishPreviewModal extends React.Component {
  render () {
    return (<HomeModal onCancelClick={this.props.onCancelClick}>
      <MessageContainer>
        Publish this comic?
      </MessageContainer>


      <CellsContainer>
        {this.props.cells.map((cell) => (
          <CellContainer key={cell.imageUrl}>
            <StudioCell
              imageUrl={cell.imageUrl}
              isImageUrlAbsolute={cell.hasNewImage}
              schemaVersion={cell.schemaVersion || SCHEMA_VERSION}
              title={cell.studioState.caption}
              width={theme.layout.width}
              />
          </CellContainer>
        ))}
      </CellsContainer>
              
      <CenteredButtons>
        <PinkMenuButton onClick={() => this.props.onPublishClick()}>
          PUBLISH
        </PinkMenuButton>
      </CenteredButtons>
    </HomeModal>)
  }
}