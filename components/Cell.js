import React from 'react'
import styled from 'styled-components'

const TitleContainer = styled.div`
  width: 250px;
  background: white;
  margin-top: 7px;
`

const TitleWidth = styled.div`
  margin-left: .25rem;
  margin-right: .25rem;
`

const CellContainer = styled.div`
  margin: 1rem 0 1rem;
  background: #F7FFF7;
  padding: 10px;
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