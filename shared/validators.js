const cloneDeep = require('lodash/cloneDeep')

const { emojiRegex } = require('../pages/studio/EmojiPicker')

const {
  MIN_POSITION,
  MAX_POSITION,
  MAX_CAPTION_LENGTH
} = require('../config/constants.json')

const ERR_CANNOT_BE_NEGATIVE = 'cannot be a negative value'
const ERR_INCORRECT_SCALE_VALUE = 'must be either -1 or 1'
const ERR_MUST_BE_A_NUMBER = 'must be a number type'
const ERR_MUST_BE_A_STRING = 'must be a string type'
const ERR_VALUE_MUST_BE_SET = 'must be set'

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

function validateEmojiField (value) {
  // must be a string type
  if (typeof value !== 'string') {
    throw new Error(`emoji.emoji ${ERR_MUST_BE_A_STRING}`)
  }

  // value must be set
  if (!value) {
    throw new Error(`emoji.emoji ${ERR_VALUE_MUST_BE_SET}`)
  }

  const emojiMatch = emojiRegex.exec(value)
  if (emojiMatch) {
    return emojiMatch[0]
  }

  if (value.length > 1) {
    return value.substring(0, 1)
  }

  return value
}

function validateScale (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value !== -1 && value !== 1) {
    throw new Error(`${field} ${ERR_INCORRECT_SCALE_VALUE}`)
  }

  return value
}

function validateEmojiDatastructure (validatedEmojis, {
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
    emoji: validateEmojiField(emoji),
    id: validateId(id, 'emoji.id'),
    order: validateId(order, 'emoji.order'),
    x: validatePosition(x, 'emoji.x'),
    y: validatePosition(y, 'emoji.y'),
    scaleX: validateScale(scaleX, 'emoji.scaleX'),
    scaleY: validateScale(scaleY, 'emoji.scaleY'),
    rotation,
    size,
    alpha,
    red,
    green,
    blue
    // don't forget to add validations for filters (line 128)
  }

  if (filters) {
    validatedEmojis[id].filters = filters
  }

  return validatedEmojis
}

function validateEmojis (emojis) {
  const emojisArray = Object.keys(emojis).map(key => emojis[key])

  return emojisArray.reduce(validateEmojiDatastructure, {})
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
  ERR_CANNOT_BE_NEGATIVE,
  ERR_INCORRECT_SCALE_VALUE,
  ERR_MUST_BE_A_NUMBER,
  ERR_MUST_BE_A_STRING,
  ERR_VALUE_MUST_BE_SET,
  validateEmojis,
  validateId,
  validateStudioState,
  validateTitle
}