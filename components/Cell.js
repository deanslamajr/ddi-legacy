import React from 'react'
import styled from 'styled-components'

const TitleContainer = styled.div`
  width: 250px;
  background: #f9f9f9;;
  border-top: black solid 1px;
`

const TitleWidth = styled.div`
  margin-left: .25rem;
  margin-right: .25rem;
`

const CellContainer = styled.div`
  margin: 1rem;
  background: white;
  border: black solid 1px;
`

export default function Cell ({ imageUrl, title }) {
  return (<CellContainer>
    <img src={imageUrl} />
    <TitleContainer>
      <TitleWidth>
        {title}
      </TitleWidth>
    </TitleContainer>
  </CellContainer>)
}