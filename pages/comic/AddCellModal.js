import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer as Message } from '../../components/Modal'
import { RedMenuButton, GreenMenuButton } from '../../components/Buttons'
import Cell from '../../components/Cell'

import { sortByOrder } from '../../helpers'

const HOME = 'HOME'
const CELL_LIST = 'CELL_LIST'

const DuplicateModal = styled(Modal)`
  height: 100%;
  display: block;
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
  height: 70%;
  margin: 2rem auto;
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
          <GreenMenuButton onClick={this.showCellListView}>
            FROM DUPLICATE
          </GreenMenuButton>
        </CenteredButtons>
        <CenteredButtons>
          <GreenMenuButton onClick={onAddCellFromNewClick}>
            FROM NEW
          </GreenMenuButton>
        </CenteredButtons>
        <CenteredButtons>
          <RedMenuButton onClick={onCancelClick}>
            CANCEL
          </RedMenuButton>
        </CenteredButtons>
      </HomeModal>)
      : (<DuplicateModal>
        <MessageContainer>
          Pick a cell to duplicate:
        </MessageContainer>
        <CellsContainer>
          {cells.sort(sortByOrder).map(({ imageUrl, image_url, title, urlId, url_id }) => <CellContainer>
            <Cell
              onClick={() => onAddCellFromDuplicate(urlId || url_id)}
              imageUrl={imageUrl || image_url}
              title={title}
              key={imageUrl || image_url}
            />
          </CellContainer>)}
        </CellsContainer>
        <CenteredButtons>
          <RedMenuButton onClick={this.showHomeView}>
            BACK
          </RedMenuButton>
        </CenteredButtons>
      </DuplicateModal>)
  }
}