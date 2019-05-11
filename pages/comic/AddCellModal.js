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
  width: 315px;
`

const HomeModal = styled(Modal)`
  width: 315px;
`

const CellContainer = styled.div`
  width: 270px;
  display: flex;
  margin: auto;
`

const CellsContainer = styled.div`
  overflow-y: auto;
  height: 60%;
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
              removeBorders
              schemaVersion={schemaVersion || schema_version}
              title={title}
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