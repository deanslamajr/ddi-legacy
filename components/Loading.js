import React from 'react'
import styled from 'styled-components'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

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
    content: url(${`${publicRuntimeConfig.FAVICON_ROOT_URL}/shaka.gif`});
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

export function LoadSpinner () {
  return (
    <LoadSpinnerContainer>
      <Spinner/>
    </LoadSpinnerContainer>
  )
}

const Image = styled.img`
  width: ${props => props.width || (props.removeBorders ? '100%' : '300px')};
  max-width: calc(100vw - 7px);
`;

export const LoadingCell = ({removeBorders}) => <Image
    src={`${publicRuntimeConfig.ASSETS_ROOT_URL}/loading.png`}
    removeBorders
  />

export const ErrorCell = ({removeBorders}) => <Image
    src={`${publicRuntimeConfig.ASSETS_ROOT_URL}/error.png`}
    removeBorders
  />