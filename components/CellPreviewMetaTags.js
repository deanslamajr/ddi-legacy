import Head from 'next/head';
import getConfig from 'next/config';

import {getCellUrl} from '../helpers'

const { publicRuntimeConfig } = getConfig();

export const CellPreviewMetaTags = ({
  title,
  caption,
  imageUrl,
  schemaVersion
}) => (<Head>
  {/* Twitter https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary.html */}
  <meta name="twitter:card" content='summary' />
  <meta name="twitter:site" content={publicRuntimeConfig.TWITTER_HANDLE} />
  <meta name="twitter:title" content={title || caption} />
  <meta name="twitter:description" content={caption} />
  {/* Images for this Card support an aspect ratio of 1:1 */ }
  {/* with minimum dimensions of 144x144 or maximum of 4096x4096 pixels. */ }
  {/* Images must be less than 5MB in size. The image will be cropped to a square on all platforms. */ }
  {/* JPG, PNG, WEBP and GIF formats are supported. Only the first frame of an animated GIF will be used. */ }
  {/* SVG is not supported  */}
  <meta name="twitter:image" content={getCellUrl(imageUrl, schemaVersion)} />
</Head>);