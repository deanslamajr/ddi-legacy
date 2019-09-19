import React from 'react'
import styled from 'styled-components'
import getConfig from 'next/config'

import theme from '../helpers/theme';

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

const PercentageCompleteText = styled.span`
  position: absolute;
  top: 20%;
  z-index: 999;
  font-size: 4rem;
  font-weight: bold;
  color: ${theme.colors.white};
  opacity: .8;
  cursor: default;
  user-select: none;
`

export function LoadSpinner ({percentCompleted}) {
  return (
    <LoadSpinnerContainer>
      <Spinner>
        {Number.isInteger(percentCompleted) && <PercentageCompleteText>{percentCompleted}&#37;</PercentageCompleteText>}
      </Spinner>
    </LoadSpinnerContainer>
  )
}

const Image = styled.img`
  width: ${props => props.width || (props.removeborders ? '100%' : '300px')};
  max-width: calc(100vw - 7px);
`;

export const LoadingCell = ({removeborders}) => <Image
    src={`${publicRuntimeConfig.ASSETS_ROOT_URL}/loading.png`}
    removeborders={removeborders}
  />

export const ErrorCell = ({removeborders}) => <Image
    src={`${publicRuntimeConfig.ASSETS_ROOT_URL}/error.png`}
    removeborders={removeborders}
  />