const { DRAFT_SUFFIX } = require('../config/constants.json')

function removeDraftSuffix(comicId = '') {
  if (comicId === null) {
    return null
  }

  if (comicId.includes(DRAFT_SUFFIX)) {
    return comicId.replace(DRAFT_SUFFIX, '')
  }

  return comicId
}

module.exports = {
  removeDraftSuffix,
}
