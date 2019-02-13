import React from 'react'
import styled from 'styled-components'

import { Router } from '../../routes'
import Cell from '../../components/Cell'

const navigateTo = (urlId) => Router.push(`/cell/${urlId}`) 

const PointerCursorContainer = styled(Cell)`
  cursor: pointer;

  &:hover {
    background-color: #C5D6D8;
  }
`

function Comic ({ cells }) {
  return (<div>
    {cells.map(({ imageUrl, title, urlId }) => <PointerCursorContainer
      onClick={() => navigateTo(urlId)}
      imageUrl={imageUrl}
      title={title}
      key={imageUrl}
    />)}
  </div>)
}

export default Comic