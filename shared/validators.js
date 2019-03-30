const { MAX_CAPTION_LENGTH } = require('../config/constants.json')

function validateTitle (title) {
  let validatedTitle = title

  if (validatedTitle && validatedTitle.length > MAX_CAPTION_LENGTH) {
    validatedTitle = validatedTitle.substring(0, MAX_CAPTION_LENGTH)
  }

  return validatedTitle
}

module.exports = {
  validateTitle
}