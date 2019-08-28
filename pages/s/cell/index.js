import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import { Router } from '../../../routes'
import { forwardCookies, getApi, redirect, sortByOrder } from '../../../helpers'
import theme from '../../../helpers/theme'

import {DRAFT_SUFFIX} from '../../../config/constants.json'

function generateDraftUrl() {
  // @todo verify this id doesn't already exist in localstorage
  return `/s/cell/${shortid.generate()}${DRAFT_SUFFIX}`
}

//
// Cell Studio
class CellStudio extends Component {
  static async getInitialProps ({ query, req, res }) {
    // if on an unpublished comic, don't fetch comic data
    if(query.cellId === 'new') {
      redirect(generateDraftUrl(), res);
      return {}
    }

    if(query.cellId.includes(DRAFT_SUFFIX)) {
      return {}
    }

    return {
    }
  }

  componentDidMount() {
    this.props.hideSpinner();
  }

  render () {
    return <div>Cell Studio!</div>
  }
}

CellStudio.propTypes = {
};

export default CellStudio 