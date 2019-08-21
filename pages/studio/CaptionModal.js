import React from 'react'
import styled from 'styled-components'

import { MenuButton, PinkMenuButton } from '../../components/Buttons'
import Modal, { CenteredButtons } from '../../components/Modal'
import { validateTitle } from '../../shared/validators'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 1rem auto;
  width: 100%;
`

const PreviewModalContainer = styled(Modal)`
  height: inherit;
  width: 350px;
  max-width: 100vw;
`

const TitleInput = styled.textarea`
  font-size: 16px;
  height: 4rem;
  width: calc(100% - ${props => props.theme.padding}px);
  padding: 3px;
  outline: none;
  resize: none;
  background-color: ${props => props.theme.colors.white};

  &::placeholder {
    color: ${props => props.theme.colors.lightGray};
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
    return (<PreviewModalContainer onCancelClick={this.props.onCancelClick}>
      <CenteredContainer>
        <TitleInput
          wrap='soft'
          type='text'
          placeholder='add a caption'
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
      </CenteredContainer>
      <CenteredButtons>
        <PinkMenuButton onClick={this.onUpdateClick}>
          UPDATE
        </PinkMenuButton>
      </CenteredButtons>
    </PreviewModalContainer>)
  }
}

export default CaptionModal