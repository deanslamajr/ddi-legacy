import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import Cell from '../components/Cell'

import { Link } from '../routes'
import { getApi } from '../helpers'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const NavigateToStudioButton = styled.a`
  margin: 2rem;
  padding: 1rem;
  border-radius: 3px;
  text-decoration: none;
  background-color: white;
  vertical-align: middle;
  box-shadow: none;
  text-shadow: none;
  font-size: 1rem;

  &:hover {
    background-color: black;
    color: white;
  }
`

function sortByUpdatedAt ({ updated_at: updatedAtA }, { updated_at: updatedAtB }) {
  const updatedAtDateA = new Date(updatedAtA)
  const updatedAtDateB = new Date(updatedAtB)
  return updatedAtDateB.getTime() - updatedAtDateA.getTime()
}

class GalleryRoute extends Component {
  state = {
  }

  static async getInitialProps ({ query, req }) {
    const { data: cells } = await axios.get(getApi('/cells', req))

    return {
      cells
    }
  }

  render () {
    const { cells } = this.props
    
    return (
      <div>
        <MobileViewportSettings />
        <GrayBackground />
        <CenteredContainer>
          {cells.sort(sortByUpdatedAt).map(({ id, image_url, title, url_id }) => (
            <Link key={id} route={`/i/${url_id}`}>
              <a>
                <Cell key={id} imageUrl={image_url} title={title} />
              </a>
            </Link>)
          )}

          <Link route='/studio'>
            <NavigateToStudioButton>Create New</NavigateToStudioButton>
          </Link>
        </CenteredContainer>
      </div>
    )
  }
}

export default GalleryRoute 