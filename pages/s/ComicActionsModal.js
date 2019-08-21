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
    </React.Fragment>)
  }

  renderMain = () => {
    return (<React.Fragment>
      <CenteredButtons>
        <MenuButton onClick={() => this.setState({currentView: DELETE_WARNING})}>
          DELETE
        </MenuButton>
      </CenteredButtons>
    </React.Fragment>);
  }

  views = {
    [MAIN]: this.renderMain,
    [DELETE_WARNING]: this.renderDeleteWarning
  }

  render () {
    return (<HomeModal onCancelClick={this.props.onCancelClick}>
      {this.views[this.state.currentView]()}
    </HomeModal>)
  }
}