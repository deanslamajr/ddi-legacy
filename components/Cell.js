import React from 'react'
import styled from 'styled-components'

const TitleContainer = styled.div`
  width: 250px;
`

const CellContainer = styled.div`
  margin: 1rem;
`

export default function Cell ({ imageUrl, title }) {
  return (<CellContainer>
    <img src={imageUrl} />
    <TitleContainer>
      {title}
    </TitleContainer>
  </CellContainer>)
}