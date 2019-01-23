import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import { GrayBackground } from '../components/Layouts'
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
        <GrayBackground />
        <CenteredContainer>
          {cells.map(({ image_url, title }) => <Cell imageUrl={image_url} title={title} />)}
          <Link href='/studio'>
            <NavigateToStudioButton>Create New</NavigateToStudioButton>
          </Link>
        </CenteredContainer>
      </div>
    )
  }
}

export default GalleryRoute 