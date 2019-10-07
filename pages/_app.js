import App, { Container } from 'next/app'
import Head from 'next/head'
import getConfig from 'next/config'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import axios from 'axios'
import queryString from 'query-string'
import ReactGA from 'react-ga';
import { load } from 'recaptcha-v3'

import { Router } from '../routes'

import theme from '../helpers/theme'

import { GrayBackground, MobileViewportSettings } from '../components/Layouts'
import {LoadSpinner} from '../components/Loading'

const { publicRuntimeConfig } = getConfig()

// relax same-origin checks against subdomain
// this allows browser downloads of assets.drawdraw.ink
// if (typeof document !== 'undefined' && publicRuntimeConfig.APP_URL_DOMAIN) {
//   document.domain = publicRuntimeConfig.APP_URL_DOMAIN 
// }

async function getNewerComics (currentComics) {
  const latestUpdatedAt = currentComics[0].updatedAt
  const { data } = await axios.get(`/api/comics/latest?latestUpdatedAt=${latestUpdatedAt}`)
  return data.comics.length
    ? {
        comics: data.comics.reverse(),
        possiblyHasMore: data.possiblyHasMore
      }
    : null
}

/**
 * GOOGLE ANALYTICS - PAGE VIEWS
 */
const handleRouteChange = url => {
  if (publicRuntimeConfig.GA_ID) {
    ReactGA.pageview(url);
  }
}

Router.events.on('routeChangeStart', handleRouteChange)

/**
 * COMPONENT
 */
class MyApp extends App {
  state = {
    activeComicUrlId: null,
    comics: [],
    hasMoreComics: false,
    newerComics: null,
    recaptcha: undefined,
    showSpinner: true,
    totalNumberOfJobs: null,
    finishedJobsCount: null
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
    }
    
    // only on server side rendering
    if (ctx.req) {
      pageProps.userId = ctx.req.session.userId;
    }

    return { pageProps };
  }

  hideSpinner = (cb = () => {}) => {
    this.setState({
      totalNumberOfJobs: null,
      finishedJobsCount: null,
      showSpinner: false
    }, cb)
  }

  showSpinner = (totalNumberOfJobs) => {
    this.setState({
      totalNumberOfJobs,
      finishedJobsCount: totalNumberOfJobs ? 0 : null,
      showSpinner: true
    });
  }

  markJobAsFinished = (numberOfNewlyFinishedJobs = 1) => {
    this.setState(({finishedJobsCount}) => {
      const newFinishedJobsCount = finishedJobsCount + numberOfNewlyFinishedJobs;
      return {finishedJobsCount: newFinishedJobsCount}
    });
  }

  appendLatestComics = async (cb = () => {}) => {
    const clonedComics = Array.from(this.state.comics)

    // if any comics that exist in old list are also in new list, remove from old list
    // e.g. a comic was recently updated
    this.state.newerComics.comics.forEach(newComic => {
      const duplicateIndex = clonedComics.findIndex(({ urlId }) => urlId === newComic.urlId)

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

  setActiveComicUrlId = (comicUrlId) => {
    this.setState({ activeComicUrlId: comicUrlId })
  }

  deleteComicFromCache = (comicUrlId, cb) => {
    const clonedComics = Array.from(this.state.comics);

    const indexToDelete = clonedComics.findIndex(comic => comic.urlId === comicUrlId);

    if (indexToDelete >= 0) {
      clonedComics.splice(indexToDelete, 1);

      const newActiveComicUrlId = this.state.comics.length > indexToDelete
        ? this.state.comics[indexToDelete].urlId
        : this.state.comics[0].urlId;

      this.setState({
        activeComicUrlId: newActiveComicUrlId,
        comics: clonedComics
      }, cb);
    }
    else {
      cb();
    }
  }

  componentDidMount () {
    if (publicRuntimeConfig.CAPTCHA_V3_SITE_KEY) {
      load(publicRuntimeConfig.CAPTCHA_V3_SITE_KEY, {
        autoHideBadge: true
      }).then((recaptcha) => {
        this.setState({
          recaptcha
        });
      });
    }

    if (publicRuntimeConfig.GA_ID) {
      ReactGA.initialize(publicRuntimeConfig.GA_ID, {
        gaOptions: {
          userId: this.props.userId
        }
      });
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }

  render () {
    const { Component, pageProps } = this.props

    const percentCompleted = this.state.totalNumberOfJobs
      && Math.round((this.state.finishedJobsCount / this.state.totalNumberOfJobs) * 100);

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

        {this.state.showSpinner && <LoadSpinner percentCompleted={percentCompleted} />}

        <ThemeProvider theme={theme}>
          <Component
            activeComicUrlId={this.state.activeComicUrlId}
            comics={this.state.comics}
            deleteComicFromCache={this.deleteComicFromCache}
            fetchComics={this.fetchComics}
            appendLatestComics={this.appendLatestComics}
            fetchMoreComics={this.fetchMoreComics}
            hasMoreComics={this.state.hasMoreComics}
            hideSpinner={this.hideSpinner}
            isShowingSpinner={this.state.showSpinner}
            newerComicsExist={!!this.state.newerComics}
            recaptcha={this.state.recaptcha}
            setActiveComicUrlId={this.setActiveComicUrlId}
            showSpinner={this.showSpinner}
            markJobAsFinished={this.markJobAsFinished}
            {...pageProps}
          />
        </ThemeProvider>
      </Container>
    )
  }
}

export default MyApp