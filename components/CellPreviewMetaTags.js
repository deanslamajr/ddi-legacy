import Head from 'next/head'
import getConfig from 'next/config'

import { getCellUrl } from '../helpers/urls'

import { APP_TITLE } from '../config/constants.json'

const { publicRuntimeConfig } = getConfig()

export const CellPreviewMetaTags = ({
  title,
  caption,
  imageUrl,
  schemaVersion,
}) => {
  const imageAbsoluteUrl = getCellUrl(imageUrl, schemaVersion)

  return (
    <Head>
      {/* Twitter https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary.html */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={publicRuntimeConfig.TWITTER_HANDLE} />
      <meta name="twitter:title" content={title || caption} />
      <meta name="twitter:description" content={caption} />
      {/* Images for this Card support an aspect ratio of 1:1 */}
      {/* with minimum dimensions of 144x144 or maximum of 4096x4096 pixels. */}
      {/* Images must be less than 5MB in size. The image will be cropped to a square on all platforms. */}
      {/* JPG, PNG, WEBP and GIF formats are supported. Only the first frame of an animated GIF will be used. */}
      {/* SVG is not supported  */}
      <meta name="twitter:image" content={imageAbsoluteUrl} />

      {/* iOS Message https://scottbartell.com/2019/03/05/implementing-imessage-link-previews/ */}
      {/* iMessage/Messages https://developer.apple.com/library/archive/technotes/tn2444/_index.html */}
      {/*   * Images less than 150px in width will not be used, or may be presented as icons */}
      {/* Android app Messages */}
      {/*   * rectangular preview image. 900*350 seems to work here */}
      {/*   * 23 characters max for caption */}
      <meta property="og:title" content={title || caption} />
      <meta property="og:image" content={imageAbsoluteUrl} />
      <meta property="og:site_name" content={APP_TITLE} />

      {/* Facebook https://developers.facebook.com/docs/sharing/webmasters/ */}
      {/* <meta property="og:url" content="http://www.nytimes.com/2015/02/19/arts/international/when-great-minds-dont-think-alike.html" /> */}
      <meta property="og:type" content="article" />
      <meta property="og:description" content={caption} />
    </Head>
  )
}
