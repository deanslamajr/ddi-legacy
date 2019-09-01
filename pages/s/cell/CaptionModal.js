import React from 'react'
import styled from 'styled-components'

import { MenuButton, PinkMenuButton } from '../../../components/Buttons'
import Modal, { CenteredButtons } from '../../../components/Modal'
import { validateCaption } from '../../../shared/validators'

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

const CaptionInput = styled.textarea`
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
    caption: this.props.caption
  }

  handleCaptionChange = (event) => {
    const newCaption = validateCaption(event.target.value)
    this.setState({ caption: newCaption })
  }

  onUpdateClick = () => {
    this.props.onUpdateClick(this.state.caption)
  }
  
  render () {
    return (<PreviewModalContainer onCancelClick={this.props.onCancelClick}>
      <CenteredContainer>
        <CaptionInput
          wrap='soft'
          type='text'
          placeholder='add a caption'
          value={this.state.caption}
          onChange={this.handleCaptionChange}
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