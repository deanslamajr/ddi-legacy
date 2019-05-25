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

  ${media.desktopMin`
    &:last-of-type {
      border-right: ${props => props.removeBorders ? 'inherit' : `1rem solid ${props.theme.colors.lightGray}`};
    }
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
  margin-right: 3px;
  background: ${props => props.theme.colors.lightGray};
  height: 100%;
`

const OldCellBorder = styled.div`
  padding: .25rem;
  background: ${props => props.theme.colors.white};
  height: 100%;
  width: ${props => props.theme.canvas.width}px;
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