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
  margin: 1px;
  /* padding: 10px; */
  padding: 0;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:first-of-type {
    margin-left: ${props => props.removeBorders ? 'inherit' : '1rem'};
  }

  &:last-of-type {
    border-right: ${props => props.removeBorders ? 'inherit' : `1rem solid ${props.theme.colors.gray3}`};
  }
`

const CellBorder = styled.div`
  padding: .25rem;
  background: ${props => props.theme.colors.white};
  height: 100%;
`

export default function Cell ({ className, imageUrl, title, onClick, removeBorders }) {
  return (<CellContainer
    className={className}
    clickable={onClick}
    onClick={onClick}
    removeBorders={removeBorders}
  >
    <CellBorder>
      <img src={imageUrl} />
      <TitleContainer>
        <TitleWidth>
          {title}
        </TitleWidth>
      </TitleContainer>
    </CellBorder>
  </CellContainer>)
}