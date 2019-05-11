import App, { Container } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import getConfig from 'next/config'
import axios from 'axios'
import queryString from 'query-string'

import theme from '../helpers/theme'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import LoadSpinner from '../components/LoadSpinner'

const { publicRuntimeConfig } = getConfig()

// relax same-origin checks against subdomain
// this allows browser downloads of assets.drawdraw.ink
// if (typeof document !== 'undefined' && publicRuntimeConfig.APP_URL_DOMAIN) {
//   document.domain = publicRuntimeConfig.APP_URL_DOMAIN 
// }

async function getNewerComics (currentComics) {
  const latestUpdatedAt = currentComics[0].updated_at
  const { data } = await axios.get(`/api/comics/latest?latestUpdatedAt=${latestUpdatedAt}`)
  return data.comics.length
    ? {
        comics: data.comics.reverse(),
        possiblyHasMore: data.possiblyHasMore
      }
    : null
}

class MyApp extends App {
  state = {
    activeComicId: null,
    comics: [],
    hasMoreComics: false,
    newerComics: null,
    showSpinner: true
  }

  hideSpinner = () => {
    this.setState({ showSpinner: false })
  }

  showSpinner = () => {
    this.setState({ showSpinner: true })
  }

  appendLatestComics = async (cb = () => {}) => {
    const clonedComics = Array.from(this.state.comics)

    // if any comics that exist in old list are also in new list, remove from old list
    // e.g. a comic was recently updated
    this.state.newerComics.comics.forEach(newComic => {
      const duplicateIndex = clonedComics.findIndex(({ id }) => id === newComic.id)

      if (duplicateIndex > -1) {
        clonedComics.splice(duplicateIndex, 1)
      }
    })

    const newComics = this.state.newerComics.comics.concat(clonedComics)

    const newerComics = this.state.newerComics.possiblyHasMore
      ? await getNewerComics(newComics)
      : null

    this.setState({
      comics: newComics,
      newerComics
    }, cb)
  }

  fetchComics = async (cb = () => {}) => {
    if (!this.state.comics.length) {
      const { data } = await axios.get('/api/comics')

      this.setState({
        comics: data.comics,
        hasMoreComics: data.hasMore
      }, cb)
    }
    else {
      const newerComics = await getNewerComics(this.state.comics)
      this.setState({ newerComics }, cb)
    }
  }

  fetchMoreComics = async (cb = () => {}) => {
    const paginationData = {
      offset: this.state.comics.length
    }

    const qs = queryString.stringify(paginationData)

    const [{ data }, newerComics] = await Promise.all([
      axios.get(`/api/comics?${qs}`),
      getNewerComics(this.state.comics)
    ])

    const clonedComics = Array.from(this.state.comics)
    const newComics = clonedComics.concat(data.comics)

    this.setState({
      comics: newComics,
      hasMore: data.hasMore,
      newerComics
    }, cb)
  }

  setActiveComicId = (comicId) => {
    this.setState({ activeComicId: comicId })
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Head>
          <title>DrawDrawInk</title>
          <link rel="apple-touch-icon" sizes="180x180" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/apple-touch-icon.png`}/>
          <link rel="icon" type="image/png" sizes="32x32" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon-32x32.png`}/>
          <link rel="icon" type="image/png" sizes="16x16" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon-16x16.png`}/>
          <link rel="manifest" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/site.webmanifest`}/>
          <link rel="mask-icon" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/safari-pinned-tab.svg`} color="#5bbad5"/>
          <link rel="shortcut icon" href={`${publicRuntimeConfig.FAVICON_ROOT_URL}/favicon.ico`}/>
          <meta name="msapplication-TileColor" content="#da532c"/>
          <meta name="msapplication-config" content={`${publicRuntimeConfig.FAVICON_ROOT_URL}/browserconfig.xml`}/>
          <meta name="theme-color" content="#ffffff"/>
        </Head>

        <MobileViewportSettings />
        <GrayBackground />

        {this.state.showSpinner && <LoadSpinner/>}

        <ThemeProvider theme={theme}>
          <Component
            activeComicId={this.state.activeComicId}
            comics={this.state.comics}
            fetchComics={this.fetchComics}
            appendLatestComics={this.appendLatestComics}
            fetchMoreComics={this.fetchMoreComics}
            hasMoreComics={this.state.hasMoreComics}
            hideSpinner={this.hideSpinner}
            isShowingSpinner={this.state.showSpinner}
            newerComicsExist={!!this.state.newerComics}
            setActiveComicId={this.setActiveComicId}
            showSpinner={this.showSpinner}
            {...pageProps}
          />
        </ThemeProvider>
      </Container>
    )
  }
}

export default MyApp