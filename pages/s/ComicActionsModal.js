import React from 'react'
import styled from 'styled-components'

import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import { PinkMenuButton, MenuButton } from '../../components/Buttons'

const HomeModal = styled(Modal)`
  width: 315px;
  height: inherit;
`

const MAIN = 'MAIN';
const DELETE_WARNING = 'DELETE_WARNING';

export default class ComicActionsModal extends React.Component {
  state = {
    currentView: MAIN
  }

  renderDeleteWarning = () => {
    const {
      onCancelClick,
      onDeleteClick
    } = this.props;

    return (<React.Fragment>
      <MessageContainer>
        Are you sure you want to delete this comic?
      </MessageContainer>
      <CenteredButtons>
        <MenuButton onClick={onDeleteClick}>
          DELETE
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <PinkMenuButton onClick={onCancelClick}>
          CANCEL
        </PinkMenuButton>
      </CenteredButtons>
    </React.Fragment>)
  }

  renderMain = () => {
    const {
      onCancelClick,
      onExitClick
    } = this.props;

    return (<React.Fragment>
      <CenteredButtons>
        <PinkMenuButton onClick={onExitClick}>
          EXIT
        </PinkMenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={() => this.setState({currentView: DELETE_WARNING})}>
          DELETE
        </MenuButton>
      </CenteredButtons>
      <CenteredButtons>
        <MenuButton onClick={onCancelClick}>
          CANCEL
        </MenuButton>
      </CenteredButtons>
    </React.Fragment>);
  }

  views = {
    [MAIN]: this.renderMain,
    [DELETE_WARNING]: this.renderDeleteWarning
  }

  render () {
    console.log('this.views', this.views)
    return (<HomeModal>
      {this.views[this.state.currentView]()}
    </HomeModal>)
  }
}