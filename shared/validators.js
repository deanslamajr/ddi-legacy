const cloneDeep = require('lodash/cloneDeep')

const { MAX_CAPTION_LENGTH } = require('../config/constants.json')

const ERR_MUST_BE_A_NUMBER = 'must be a number type'
const ERR_CANNOT_BE_NEGATIVE = 'cannot be a negative value'

function validateTitle (title) {
  let validatedTitle = title

  if (validatedTitle && validatedTitle.length > MAX_CAPTION_LENGTH) {
    validatedTitle = validatedTitle.substring(0, MAX_CAPTION_LENGTH)
  }

  return validatedTitle
}

function validateId (id, field) {
  // must be a number
  if (typeof id !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }
  // must be >= 0
  if (id < 0) {
    throw new Error(`${field} ${ERR_CANNOT_BE_NEGATIVE}`)
  }
  return id
}

function coerceBoolean (value) {
  return Boolean(value)
}

// { activeEmojiId: 1,
//   currentEmojiId: 2,
//   emojis: 
//    { '1': 
//       { emoji: '🈵',
//         id: 1,
//         order: 1,
//         x: 100,
//         y: 100,
//         scaleX: 1,
//         scaleY: 1,
//         rotation: 0,
//         size: 100,
//         alpha: 0.5,
//         red: 126,
//         green: 0,
//         blue: 0 } },
//   showEmojiPicker: false,
//   title: '' }


function validateStudioState (studioState) {
  if (!studioState) {
    return null
  }

  const validatedStudioState = {
    activeEmojiId: validateId(studioState.activeEmojiId, 'activeEmojiId'),
    currentEmojiId: validateId(studioState.currentEmojiId, 'currentEmojiId'),
    showEmojiPicker: coerceBoolean(studioState.showEmojiPicker),
    title: validateTitle(studioState.title)
  }

  // const validatedStudioState = cloneDeep(strippedStudioState)

  return validatedStudioState
}

module.exports = {
  ERR_MUST_BE_A_NUMBER,
  ERR_CANNOT_BE_NEGATIVE,
  validateId,
  validateStudioState,
  validateTitle
}