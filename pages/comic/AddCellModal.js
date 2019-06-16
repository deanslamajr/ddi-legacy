import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer as Message } from '../../components/Modal'
import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Cell from '../../components/Cell'

import { sortByOrder } from '../../helpers'

const HOME = 'HOME'
const CELL_LIST = 'CELL_LIST'

const DuplicateModal = styled(Modal)`
  height: 100%;
  width: 100%;
  align-items: center;
`

const HomeModal = styled(Modal)`
  width: 315px;
`

const CellsContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 70%;
  margin: 2rem auto; 
  width: 270px;
  max-width: calc(100vw - ${props => props.theme.padding}px);
`

const CellContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: auto;
`

const MessageContainer = styled(Message)`
  margin-top: 1.5rem;
`

export default class AddCellModal extends React.Component {
  state = {
    currentView: HOME
  }

  showCellListView = () => {
    this.setState({ currentView: CELL_LIST })
  }

  showHomeView = () => {
    this.setState({ currentView: HOME })
  }

  render () {
    const {
      cells,
      onAddCellFromNewClick,
      onAddCellFromDuplicate,
      onCancelClick
    } = this.props

    return this.state.currentView === HOME
      ? (<HomeModal>
        <Message>
          Add a new cell
        </Message>
          
        <CenteredButtons>
          <MenuButton onClick={this.showCellListView}>
            FROM DUPLICATE
          </MenuButton>
        </CenteredButtons>
        <CenteredButtons>
          <MenuButton onClick={onAddCellFromNewClick}>
            FROM NEW
          </MenuButton>
        </CenteredButtons>
        <CenteredButtons>
          <PinkMenuButton onClick={onCancelClick}>
            CANCEL
          </PinkMenuButton>
        </CenteredButtons>
      </HomeModal>)
      : (<DuplicateModal>
        <MessageContainer>
          Pick a cell to duplicate:
        </MessageContainer>
        <CellsContainer>
          {cells.sort(sortByOrder).map(({ imageUrl, image_url, schemaVersion, schema_version, title, urlId, url_id }) => <CellContainer>
            <Cell
              imageUrl={imageUrl || image_url}
              key={imageUrl || image_url}
              onClick={() => onAddCellFromDuplicate(urlId || url_id)}
              schemaVersion={schemaVersion || schema_version}
              title={title}
              width="250px"
            />
          </CellContainer>)}
        </CellsContainer>
        <CenteredButtons>
          <MenuButton onClick={this.showHomeView}>
            BACK
          </MenuButton>
        </CenteredButtons>
      </DuplicateModal>)
  }
}