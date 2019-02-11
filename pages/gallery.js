import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import Cell from '../components/Cell'
import { NavButton, BOTTOM_RIGHT, GREEN, } from '../components/navigation'

import { Link, Router } from '../routes'
import { getApi } from '../helpers'

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

const UnstyledLink = styled.a`
  text-decoration: none;
  color: black;
  cursor: pointer;
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
    const { data: cells } = await axios.get(getApi('/api/cells', req))

    return {
      cells
    }
  }

  navigateToStudio = () => {
    Router.push('/studio/new/new')
  }

  render () {
    const { cells } = this.props
    
    return (
      <div>
        <MobileViewportSettings />
        <GrayBackground />
        <CenteredContainer>
          {cells.sort(sortByUpdatedAt).map(({ id, image_url, title, url_id }) => (
            <Link key={id} route={`/cell/${url_id}`}>
              <UnstyledLink>
                <Cell key={id} imageUrl={image_url} title={title} />
              </UnstyledLink>
            </Link>)
          )}
        </CenteredContainer>
        
        <NavButton
          value='CREATE'
          color={GREEN}
          cb={this.navigateToStudio}
          position={BOTTOM_RIGHT}
        />
      </div>
    )
  }
}

export default GalleryRoute 