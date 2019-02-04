import React from 'react'
import styled from 'styled-components'

//
// Styled Components
//
const LoadSpinnerContainer = styled.div`
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

const Spinner = styled.div`
  display: inline-block;
  position: relative;

  &:after {
    content: "🤙";
    font-size: 3rem;
    display: block;
    animation: spin 2s infinite;
  }

  @keyframes spin {
  0% {
    transform: rotate(0);
    animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }
  50% {
    transform: rotate(720deg);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  100% {
    transform: rotate(3600deg);
  }
}
`

//
// MainMenu

function LoadSpinner () {
  return (
    <LoadSpinnerContainer>
      <Spinner/>
    </LoadSpinnerContainer>
  )
}

export default LoadSpinner 