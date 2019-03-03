import React from 'react'
import styled from 'styled-components'

const TransparentDarkBackground = styled.div`
  z-index: 999999;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

const ModalContainer = styled.div`
  background-color: #C5D6D8;
  width: 70vw;
  height: 30vh;
  display: flex;
  padding: 1rem;
  border-radius: 1px;
  justify-content: space-around;
  flex-direction: column;
`

export const CenteredButtons = styled.div`
  display: flex;
  justify-content: center;
`

export const MessageContainer = styled.div`
  color: #679436;
  font-size: 2rem;
  display: flex;
  justify-content: center;
`

function Modal ({ children, className }) {
  return (<TransparentDarkBackground>
    <ModalContainer className={className}>
      {children}
    </ModalContainer>
  </TransparentDarkBackground>)
}

export default Modal