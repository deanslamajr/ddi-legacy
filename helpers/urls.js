import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export function getCellUrl(imageUrl, schemaVersion) {
  return schemaVersion >= 3
    ? `https://${publicRuntimeConfig.CELL_IMAGES_DOMAIN}/${imageUrl}`
    : imageUrl
}

export const DDI_APP_PAGES = {
  getGalleryPageUrl: () => {
    return `${publicRuntimeConfig.DDIV2_URL_WITH_PROTOCOL}`
  },
}
