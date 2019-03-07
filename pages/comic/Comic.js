import React from 'react'
import styled from 'styled-components'

import { Router } from '../../routes'
import Cell from '../../components/Cell'

import { sortByOrder } from '../../helpers'

const navigateTo = (urlId, showSpinner) => {
  showSpinner()
  Router.push(`/cell/${urlId}`)
}

const ComicContainer = styled.div`
  display: flex;
  margin: 0 1rem 0;
`

const noop = () => {}

function Comic ({ cells, clickable, showSpinner = noop }) {
  return (<ComicContainer>
    {/* @todo replace having to support both casings for imageUrl and urlId */}
    {cells.sort(sortByOrder).map(({ imageUrl, image_url, title, urlId, url_id }) => <Cell
      onClick={() => clickable ? navigateTo(urlId || url_id, showSpinner) : noop()}
      imageUrl={imageUrl || image_url}
      title={title}
      key={imageUrl || image_url}
    />)}
  </ComicContainer>)
}

export default Comic