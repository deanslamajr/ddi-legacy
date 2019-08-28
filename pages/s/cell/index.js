import { Component } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import shortid from 'shortid'
import propTypes from 'prop-types'

import { Router } from '../../../routes'
import { forwardCookies, getApi, redirect, sortByOrder } from '../../../helpers'
import theme from '../../../helpers/theme'

//
// Cell Studio
class CellStudio extends Component {
  // static async getInitialProps ({ query, req, res }) {
  //   // if on an unpublished comic, don't fetch comic data
  //   if(query.comicId.includes(DRAFT_SUFFIX)) {
  //     return {}
  //   }

  //   const { data } = await axios.get(getApi(`/api/comic/${query.comicId}`, req), forwardCookies(req))

  //   // redirect to new comic if user isn't authorized to edit this comic
  //   if (!data.userCanEdit || !data.isActive) {
  //     // @todo log this case
  //     redirect(generateDraftUrl(), res);
  //     return {}
  //   }

  //   return {
  //     ...data,
  //     comicId: query.comicId
  //   }
  // }

  render () {
    return <div>Cell Studio!</div>
  }
}

CellStudio.propTypes = {
};

export default CellStudio 