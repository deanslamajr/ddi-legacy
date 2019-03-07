import React from 'react'
import styled from 'styled-components'

const TitleContainer = styled.div`
  width: 250px;
  background: ${props => props.theme.colors.white};
  margin-top: 7px;
`

const TitleWidth = styled.div`
  margin-left: .25rem;
  margin-right: .25rem;
`

const CellContainer = styled.div`
  margin: 1rem 0 1rem;
  background: ${props => props.theme.colors.lightGreen};
  padding: 10px;
  cursor: pointer;
`

export default function Cell ({ className, imageUrl, title, onClick = () => {} }) {
  return (<CellContainer className={className} onClick={onClick}>
    <img src={imageUrl} />
    <TitleContainer>
      <TitleWidth>
        {title}
      </TitleWidth>
    </TitleContainer>
  </CellContainer>)
}