import React from 'react'
import styled from 'styled-components'
import nl2br from 'react-newline-to-break';

import {DynamicTextContainer} from '../components/DynamicTextContainer'

import { media } from '../helpers/style-utils'

const CellContainer = styled.div`
  margin: 0;
  padding: ${props => props.schemaVersion === 1 ? '0' : '1px'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  background: ${props => props.schemaVersion === 1 ? 'inherit' : `${props.theme.colors.lightGray}`};

  ${media.desktopMin`
    margin-bottom: ${props => props.schemaVersion === 1 ? '3px' : '1px'};
    margin-right: ${props => props.schemaVersion === 1 ? '3px' : '1px'};
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
  /* to normalize the height of the caption between shorter and taller comics on the same row */
  background: rgb(255, 250, 249);
  display: grid;
  height: 100%;
  width: ${props => props.width || (props.removeBorders ? '100%' : '300px')};
  max-width: calc(100vw - ${props => props.theme.padding}px);

  ${media.desktopMin`
    grid-template-rows: ${props => props.width || (props.removeBorders ? 'inherit' : '300px')};
  `}
`

const CellImage = styled.img`
  width: ${props => props.width || (props.removeBorders ? '100%' : '300px')};
  max-width: calc(100vw - ${props => props.theme.padding}px);
`

export default function Cell ({
  className, imageUrl, title, clickable, onClick, removeBorders, schemaVersion, width
}) {
  return (<CellContainer
    className={className}
    clickable={clickable || onClick}
    onClick={onClick}
    removeBorders={removeBorders}
    schemaVersion={schemaVersion}
  > 
    {schemaVersion === 1
      ? (<CellBorder>
        <CellImage
          removeBorders={removeBorders}
          src={imageUrl}
        />
      </CellBorder>)
      : (<OldCellBorder removeBorders={removeBorders} width={width}>
        <CellImage
          removeBorders={removeBorders}
          src={imageUrl}
          width={width}
        />
        {title && title.length && <DynamicTextContainer fontRatio={17}>
          {nl2br(title)}
        </DynamicTextContainer>}
      </OldCellBorder>)
    }
  </CellContainer>)
  return 
}