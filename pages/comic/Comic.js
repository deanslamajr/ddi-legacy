import React from 'react'
import styled from 'styled-components'

import { Router } from '../../routes'

import Cell from '../../components/Cell'

import {sortByOrder, sortCellsV4} from '../../helpers/sorts'
import { media } from '../../helpers/style-utils'

const navigateTo = (urlId, showSpinner) => {
  showSpinner()
  Router.pushRoute(`/cell/${urlId}`)
}

const ComicContainer = styled.div`
  display: flex;
  margin: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  
  ${media.desktopMin`
    flex-wrap: wrap;
    justify-content: center;
  `}

  ${media.phoneMax`
    margin: 1rem auto 5rem;
    flex-direction: column;
  `}
`

const noop = () => {}

function Comic ({ cells, clickable, initialCellUrlId, showSpinner = noop }) {
  let sortedCells;

  if (cells.length && cells[0].schemaVersion >= 4) {
    sortedCells = sortCellsV4(initialCellUrlId, cells);
  } else {
    sortedCells = cells.sort(sortByOrder);
  }
  return (<ComicContainer>
    {/* @todo replace having to support both casings for imageUrl and urlId */}
    {/*  This is due to the 2 different ways this is consumed: */}
    {/*  1. /gallery - passes untransformed cells data from DB */}
    {/*  2. /comic/:comicId - passes transformed cells data */}
    {sortedCells.map(({
      imageUrl,
      image_url,
      schemaVersion,
      schema_version,
      title,
      urlId,
      url_id
    }) => (<Cell
      onClick={() => clickable ? navigateTo(urlId || url_id, showSpinner) : noop()}
      imageUrl={imageUrl || image_url}
      title={title}
      key={imageUrl || image_url}
      schemaVersion={schemaVersion || schema_version}
    />))}
  </ComicContainer>)
}

export default Comic