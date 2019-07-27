import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import Cell from '../../components/Cell'

import ComicActionsModal from './ComicActionsModal'
import AddCellModal from './AddCellModal'

import {
  PinkMenuButton
} from '../../components/Buttons'

import { NavButton, BOTTOM_RIGHT } from '../../components/navigation'

import { Router } from '../../routes'
import { forwardCookies, getApi, redirect, sortByOrder } from '../../helpers'
import theme from '../../helpers/theme'

import {DRAFT_SUFFIX} from '../../config/constants.json'

const SIDE_BUTTONS_SPACER = 0//.4
const cellWidth = `${(1 - SIDE_BUTTONS_SPACER) * theme.layout.width}px`;

function generateDraftUrl() {
  return `/s/comic/${shortid.generate()}${DRAFT_SUFFIX}`
}

const AddCellButton = styled(PinkMenuButton)`
  font-size: 2.5rem;
  width: ${props => props.theme.layout.width}px;
`

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  margin: 1rem auto ${props => props.theme.layout.bottomPadding}px;
`

const StudioCell = styled(Cell)`
  margin: 0 auto;
  width: ${cellWidth};
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
    if (!data.userCanEdit || !data.isActive) {
      // @todo log this case
      redirect(generateDraftUrl(), res);
      return {}
    }

    return {
      ...data,
      comicId: query.comicId
    }
  }

  state = {
    showComicActionsModal: false,
    showCellActionsModal: false,
    showAddCellModal: false
  }

  componentDidMount() {
    this.props.hideSpinner();
    window.scrollTo(0,document.body.scrollHeight);
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

  toggleComicActionsModal = (newValue) => {
    this.setState({ showComicActionsModal: newValue })
  }

  toggleCellActionsModal = (newValue) => {
    this.setState({ showCellActionsModal: newValue })
  }

  navigateBack = () => {
    this.props.showSpinner()
    this.toggleComicActionsModal(false)
    Router.pushRoute(`/comic/${this.props.comicId}`)
  }

  renderAddCellButton = () => {
    return (<AddCellButton onClick={() => this.showAddCellModal()}>
      +
    </AddCellButton>)
  }

  handleDeleteComicClick = async () => {
    this.props.showSpinner();
    this.toggleComicActionsModal(false);
    try {
      await axios.delete(`/api/comic/${this.props.comicId}`);
      // remove this comic from the gallery cache
      this.props.deleteComicFromCache(this.props.comicId, () => Router.pushRoute('/gallery'));
    }
    catch(error) {
      this.props.hideSpinner();
      // @todo log error
      console.error(error);
      return;
    }
  }

  render () {
    return <React.Fragment>
      <OuterContainer>
        {/* CELLS */}
        {this.props.cells && this.props.cells.sort(sortByOrder).map(({imageUrl, schemaVersion, title}, index) => (<div key={imageUrl}>
          <StudioCell
            imageUrl={imageUrl}
            schemaVersion={schemaVersion}
            title={title}
            width={cellWidth}
          />
        </div>))}
        {this.renderAddCellButton()}
      </OuterContainer>

      

      {this.state.showAddCellModal && <AddCellModal
        onCancelClick={this.hideAddCellModal}
        onAddCellFromNewClick={this.navigateToAddCellFromNew}
        onAddCellFromDuplicate={this.navigateToAddCell}
        cells={this.props.cells}
      />}

      {this.state.showComicActionsModal && <ComicActionsModal
        onCancelClick={() => this.toggleComicActionsModal(false)}
        onDeleteClick={() => this.handleDeleteComicClick()}
        onExitClick={() => this.navigateBack()}
      />}

      {/* {this.state.showCellActionsModal && <CellActionsModal
        onCancelClick={() => this.toggleCellActionsModal(false)}
        onEditClick={() => this.handleCellEdit()}
      />} */}

      <NavButton
        value='ACTIONS'
        cb={() => this.toggleComicActionsModal(true)}
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