import React from 'react'
import styled from 'styled-components'

import { MenuButton, GreenMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons, MessageContainer } from '../../components/Modal'
import { validateTitle } from '../../shared/validators'

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
`

const TitleInput = styled.textarea`
  font-size: 16px;
  height: 4rem;
  width: 244px;
  padding: 3px;
  outline: none;
  resize: none;
  background-color: ${props => props.theme.colors.white};
  border: none;

  &::placeholder {
    color: ${props => props.theme.colors.gray};
    opacity: 0.5;
  }
`

class CaptionModal extends React.Component {
  state = {
    title: this.props.title
  }

  handleTitleChange = (event) => {
    let newTitle = validateTitle(event.target.value)
    this.setState({ title: newTitle })
  }

  onUpdateClick = () => {
    this.props.onUpdateClick(this.state.title)
  }
  
  render () {
    return (<PreviewModalContainer>
      <CenteredContainer>
        <TitleInput
          type='text'
          placeholder='add a caption'
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
      </CenteredContainer>
      <CenteredButtons>
        <MenuButton onClick={this.props.onCancelClick}>
          CANCEL
        </MenuButton>
        <GreenMenuButton onClick={this.onUpdateClick}>
          UPDATE
        </GreenMenuButton>
      </CenteredButtons>
    </PreviewModalContainer>)
  }
}

export default CaptionModal