import getConfig from 'next/config'
import queryString from 'query-string'

const { publicRuntimeConfig } = getConfig()

export function getCellUrl(imageUrl, schemaVersion) {
  return schemaVersion >= 3
    ? `https://${publicRuntimeConfig.CELL_IMAGES_DOMAIN}/${imageUrl}`
    : imageUrl
}

export const DDI_APP_PAGES = {
  getGalleryPageUrl: ({ comicUpdatedAt, queryString: qs } = {}) => {
    const searchParams = qs
      ? `?${qs}`
      : comicUpdatedAt
      ? `?${queryString.stringify({ oo: comicUpdatedAt })}`
      : ''
    return `${publicRuntimeConfig.DDIV2_URL_WITH_PROTOCOL}/gallery${searchParams}`
  },
}
