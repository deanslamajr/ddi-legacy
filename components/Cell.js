import React from 'react'
import styled from 'styled-components'

import { media } from '../helpers/style-utils'

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
  background: ${props => props.schemaVersion === 1 ? 'inherit' : `${props.theme.colors.lightGray}`};

  ${media.desktopMin`
    margin-bottom: ${props => props.schemaVersion === 1 ? '3px' : '1px'};
    margin-right: ${props => props.schemaVersion === 1 ? '3px' : '1px'};
  `}

  ${media.phoneMax`
    &:first-of-type {
      margin-top: ${props => props.removeBorders ? 'inherit' : `1rem`};
    }

    &:last-of-type {
      margin-bottom: ${props => props.removeBorders ? 'inherit' : `5rem`};
    }
  `}
`

const CellBorder = styled.div`
  padding: 0;
  background: ${props => props.theme.colors.lightGray};
  height: 100%;

  ${media.desktopMin`
    background: ${props => props.theme.colors.white};
  `}
`

const OldCellBorder = styled.div`
  background: ${props => props.theme.colors.white};
  height: 100%;
  width: 100%;
`

export default function Cell ({ className, imageUrl, title, onClick, removeBorders, schemaVersion }) {
  return (<CellContainer
    className={className}
    clickable={onClick}
    onClick={onClick}
    removeBorders={removeBorders}
    schemaVersion={schemaVersion}
  >
    {schemaVersion >= 1
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