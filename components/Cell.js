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
  padding: ${props => props.schemaVersion === 1 ? '0' : '1px'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:first-of-type {
    margin-left: ${props => props.removeBorders ? 'inherit' : '1rem'};
  }

  &:last-of-type {
    border-right: ${props => props.removeBorders ? 'inherit' : `1rem solid ${props.theme.colors.lightGray}`};
  }
`

const CellBorder = styled.div`
  padding: 0;
  margin-right: 1px;
  background: ${props => props.theme.colors.white};
  height: 100%;
`

const OldCellBorder = styled.div`
  padding: .25rem;
  background: ${props => props.theme.colors.white};
  height: 100%;
`

export default function Cell ({ className, imageUrl, title, onClick, removeBorders, schemaVersion }) {
  return (<CellContainer
    className={className}
    clickable={onClick}
    onClick={onClick}
    removeBorders={removeBorders}
    schemaVersion={schemaVersion}
  >
    {schemaVersion === 1
      ? (<CellBorder>
        <img src={imageUrl} />
      </CellBorder>)
      : (<OldCellBorder>
        <img src={imageUrl} />
        <TitleContainer>
          <TitleWidth>
            {title}
          </TitleWidth>
        </TitleContainer>
      </OldCellBorder>)
    }
  </CellContainer>)
  return 
}