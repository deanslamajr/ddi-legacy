const cloneDeep = require('lodash/cloneDeep')

const {
  MIN_POSITION,
  MAX_POSITION,
  MAX_CAPTION_LENGTH
} = require('../config/constants.json')

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

function validatePosition (value, field) {
  // must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value < MIN_POSITION) {
    return MIN_POSITION
  } else if (value > MAX_POSITION) {
    return MAX_POSITION
  } else {
    return value
  }
}

function validateEmoji (validatedEmojis, {
  emoji,
  id,
  order,
  x,
  y,
  scaleX,
  scaleY,
  rotation,
  size,
  alpha,
  red,
  green,
  blue,
  filters
}) {
  validatedEmojis[id] = {
    emoji,
    id: validateId(id, 'emoji.id'),
    order: validateId(order, 'emoji.order'),
    x: validatePosition(x, 'emoji.x'),
    y: validatePosition(y, 'emoji.y'),
    scaleX,
    scaleY,
    rotation,
    size,
    alpha,
    red,
    green,
    blue
  }

  if (filters) {
    validatedEmojis[id].filters = filters
  }

  return validatedEmojis
}

function validateEmojis (emojis) {
  const emojisArray = Object.keys(emojis).map(key => emojis[key])

  return emojisArray.reduce(validateEmoji, {})
}

function validateStudioState (studioState) {
  if (!studioState) {
    return null
  }

  const validatedStudioState = {
    activeEmojiId: validateId(studioState.activeEmojiId, 'activeEmojiId'),
    currentEmojiId: validateId(studioState.currentEmojiId, 'currentEmojiId'),
    showEmojiPicker: coerceBoolean(studioState.showEmojiPicker),
    title: validateTitle(studioState.title),
    emojis: validateEmojis(studioState.emojis)
  }

  // const validatedStudioState = cloneDeep(strippedStudioState)

  return validatedStudioState
}

module.exports = {
  ERR_MUST_BE_A_NUMBER,
  ERR_CANNOT_BE_NEGATIVE,
  validateEmojis,
  validateId,
  validateStudioState,
  validateTitle
}