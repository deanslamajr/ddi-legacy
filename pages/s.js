import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import { Router } from '../routes'
import { forwardCookies, getApi } from '../helpers'

import {DRAFT_SUFFIX} from '../config/constants.json'

function generateDraftUrl() {
  return `/s/comic/${shortid.generate()}${DRAFT_SUFFIX}`
}

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
      ...data
    }
  }

  componentDidMount() {
    this.props.hideSpinner();
  }

  render () {
    return <div>{JSON.stringify(this.props.cells)}</div>
  }
}

StudioV2.propTypes = {
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