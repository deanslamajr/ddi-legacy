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
  overflow-wrap: break-word;
`

const CellContainer = styled.div`
  margin: 0;
  background: ${props => props.theme.colors.lightGreen};
  padding: 10px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:first-of-type {
    margin-left: 1rem;
  }

  &:last-of-type {
    border-right: 1rem solid #C5D6D8;
  }
`

export default function Cell ({ className, imageUrl, title, onClick }) {
  return (<CellContainer className={className} clickable={onClick} onClick={onClick}>
    <img src={imageUrl} />
    <TitleContainer>
      <TitleWidth>
        {title}
      </TitleWidth>
    </TitleContainer>
  </CellContainer>)
}