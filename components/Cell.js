import React from 'react'
import styled from 'styled-components'
import nl2br from 'react-newline-to-break';
import Img from 'react-image';

import {DynamicTextContainer} from '../components/DynamicTextContainer'
import {ErrorCell, LoadingCell} from '../components/Loading'

import { getCellUrl } from '../helpers';
import { media } from '../helpers/style-utils';
import theme from '../helpers/theme'


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

const getTemplateRows = (width) => {
  if (width === theme.cell.fullWidth) {
    return 'inherit';
  }

  return width || theme.cell.width;
}

const OldCellBorder = styled.div`
  /* to normalize the height of the caption between shorter and taller comics on the same row */
  background: rgb(255, 250, 249);
  display: grid;
  height: 100%;
  width: ${props => props.width || props.theme.cell.width};
  max-width: calc(100vw - ${props => props.theme.padding}px);

  ${media.desktopMin`
    grid-template-rows: ${props => getTemplateRows(props.width)};
  `}
`

const CellImage = styled(Img)`
  width: ${props => props.width || props.theme.cell.width};
  max-width: calc(100vw - ${props => props.theme.padding}px);
`

export default function Cell ({
  className, imageUrl, isImageUrlAbsolute, caption, clickable, onClick, removeBorders, schemaVersion, width
}) {
  const cellUrl = isImageUrlAbsolute
    ? imageUrl
    : getCellUrl(imageUrl, schemaVersion)

  return (<CellContainer
    className={className}
    clickable={clickable || onClick}
    onClick={onClick}
    schemaVersion={schemaVersion}
  > 
    {schemaVersion === 1
      ? (<CellBorder>
        <CellImage
          src={cellUrl}
          loader={<LoadingCell width={removeBorders && theme.cell.fullWidth} />}
          unloader={<ErrorCell width={removeBorders && theme.cell.fullWidth} />}
          width={removeBorders && theme.cell.fullWidth}
        />
      </CellBorder>)
      : (<OldCellBorder width={width || (removeBorders && theme.cell.fullWidth)}>
        <CellImage
          src={cellUrl}
          width={width || (removeBorders && theme.cell.fullWidth)}
          loader={<LoadingCell width={removeBorders && theme.cell.fullWidth} />}
          unloader={<ErrorCell width={removeBorders && theme.cell.fullWidth} />}
        />
        {caption && caption.length && <DynamicTextContainer fontRatio={17}>
          {nl2br(caption)}
        </DynamicTextContainer>}
      </OldCellBorder>)
    }
  </CellContainer>)
  return 
}