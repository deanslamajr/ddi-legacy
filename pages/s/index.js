import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import ActionsModal from './ActionsModal'
import AddCellModal from './AddCellModal'

import {
  PinkMenuButton
} from '../../components/Buttons'

import { NavButton, BOTTOM_RIGHT } from '../../components/navigation'

import { Router } from '../../routes'
import { forwardCookies, getApi } from '../../helpers'

import {DRAFT_SUFFIX} from '../../config/constants.json'

function generateDraftUrl() {
  return `/s/comic/${shortid.generate()}${DRAFT_SUFFIX}`
}

const AddCellButton = styled(PinkMenuButton)`
  font-size: 2.5rem;
`

const OuterContainer = styled.div`
  margin-top: 1rem;
`

//
// MainMenu
class StudioV2 extends Component {
  static async getInitialProps ({ query, req, res }) {
    // if on an unpublished comic, don't fetch comic data
    if(query.comicId.includes(DRAFT_SUFFIX)) {
      return {}
    }

    const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req))

    // redirect to new comic if user isn't authorized to edit this comic
    if (!data.userCanEdit) {
      if (res) {
        res.writeHead(302, {
          Location: generateDraftUrl()
        })
        res.end()
      } else {
        Router.pushRoute(generateDraftUrl());
      }
      return {}
    }

    return {
      ...data,
      comicId: query.comicId
    }
  }

  state = {
    showActionsModal: false,
    showAddCellModal: false
  }

  componentDidMount() {
    this.props.hideSpinner();
  }

  hideAddCellModal = () => {
    this.setState({ showAddCellModal: false })
  }

  showAddCellModal = () => {
    this.setState({ showAddCellModal: true })
  }

  navigateToAddCellFromNew = () => {
    const { comicId } = this.props

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/studio/${comicId}/new`)
  }

  navigateToAddCell = (cellUrlId) => {
    const { comicId } = this.props

    this.props.showSpinner()
    this.hideAddCellModal();
    Router.pushRoute(`/studio/${comicId}/${cellUrlId}`)
  }

  toggleActionsModal = (newValue) => {
    this.setState({ showActionsModal: newValue })
  }

  navigateBack = () => {
    this.props.showSpinner()
    this.toggleActionsModal(false)
    Router.pushRoute(`/comic/${this.props.comicId}`)
  }

  render () {
    return <React.Fragment>
      <OuterContainer>
        <AddCellButton onClick={this.showAddCellModal}>
          +
        </AddCellButton>
      </OuterContainer>

      {this.state.showAddCellModal && <AddCellModal
        onCancelClick={this.hideAddCellModal}
        onAddCellFromNewClick={this.navigateToAddCellFromNew}
        onAddCellFromDuplicate={this.navigateToAddCell}
        cells={this.props.cells}
      />}

      {this.state.showActionsModal && <ActionsModal
        onCancelClick={() => this.toggleActionsModal(false)}
        onExitClick={() => this.navigateBack()}
      />}

      <NavButton
        value='ACTIONS'
        cb={() => this.toggleActionsModal(true)}
        position={BOTTOM_RIGHT}
        accented
      />
    </React.Fragment>
  }
}

StudioV2.propTypes = {
  comicId: propTypes.string,
  cells: propTypes.arrayOf(propTypes.shape({
    urlId: propTypes.string,
    imageUrl: propTypes.string,
    order: propTypes.number,
    schemaVersion: propTypes.number,
    studioState: propTypes.object,
    title: propTypes.string
  })),
  urlId: propTypes.string,
  title: propTypes.string,
  userCanEdit: propTypes.bool
};

export default StudioV2 