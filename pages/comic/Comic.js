import React from 'react'
import styled from 'styled-components'

import { Router } from '../../routes'
import Cell from '../../components/Cell'

const navigateTo = (urlId) => Router.push(`/cell/${urlId}`) 

const PointerCursorContainer = styled(Cell)`
  cursor: pointer;
`

const ComicContainer = styled.div`
  display: flex;
  margin: 0 1rem 0;
`

const noop = () => {}

function Comic ({ cells, clickable }) {
  const Container = clickable
    ? PointerCursorContainer
    : Cell

  return (<ComicContainer>
    {/* @todo replace having to support both casings for imageUrl and urlId */}
    {cells.map(({ imageUrl, image_url, title, urlId, url_id }) => <Container
      onClick={() => clickable ? navigateTo(urlId || url_id) : noop}
      imageUrl={imageUrl || image_url}
      title={title}
      key={imageUrl || image_url}
    />)}
  </ComicContainer>)
}

export default Comic