const emojiRegexFactory = require('emoji-regex')

const {
  MAX_EMOJIS_COUNT,
  MIN_POSITION,
  MAX_POSITION,
  MIN_ROTATION,
  MAX_ROTATION,
  MIN_SIZE,
  MAX_SIZE,
  MIN_ALPHA,
  MAX_ALPHA,
  MIN_RGB,
  MAX_RGB,
  MIN_OPACITY,
  MAX_OPACITY,
  MAX_CAPTION_LENGTH,
  FILTERS_LIST
} = require('../config/constants.json')

const ERR_CANNOT_BE_NEGATIVE = 'cannot be a negative value'
const ERR_INCORRECT_SCALE_VALUE = 'must be either -1 or 1'
const ERR_MUST_BE_A_NUMBER = 'must be a number type'
const ERR_MUST_BE_A_STRING = 'must be a string type'
const ERR_VALUE_MUST_BE_SET = 'must be set'
const ERR_EXCEED_MAX_EMOJIS = `Emojis datastructure cannot exceed a count of ${MAX_EMOJIS_COUNT} emojis`

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

  const emojiRegex = emojiRegexFactory()
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

function validateRotation (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value < MIN_ROTATION) {
    return MIN_ROTATION
  } else if (value > MAX_ROTATION) {
    return MAX_ROTATION
  } else {
    return value
  }
}

function validateSize (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value < MIN_SIZE) {
    return MIN_SIZE
  } else if (value > MAX_SIZE) {
    return MAX_SIZE
  } else {
    return value
  }
}

function validateAlpha (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value < MIN_ALPHA) {
    return MIN_ALPHA
  } else if (value > MAX_ALPHA) {
    return MAX_ALPHA
  } else {
    return value
  }
}

function validateRGB (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    throw new Error(`${field} ${ERR_MUST_BE_A_NUMBER}`)
  }

  if (value < MIN_RGB) {
    return MIN_RGB
  } else if (value > MAX_RGB) {
    return MAX_RGB
  } else {
    return value
  }
}

function validateOpacity (value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    return MAX_OPACITY
  }

  if (value < MIN_OPACITY) {
    return MIN_OPACITY
  } else if (value > MAX_OPACITY) {
    return MAX_OPACITY
  } else {
    return value
  }
}

function validateFilters (filters, field) {
  if (!filters || !Array.isArray(filters)) {
    return undefined
  }

  const withoutUnrecognized = filters.filter(filter => FILTERS_LIST.includes(filter))

  if (!withoutUnrecognized.length) {
    return undefined
  }

  // remove duplicates
  return Array.from(new Set(withoutUnrecognized))
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
  opacity,
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
    rotation: validateRotation(rotation, 'emoji.rotation'),
    size: validateSize(size, 'emoji.size'),
    alpha: validateAlpha(alpha, 'emoji.alpha'),
    red: validateRGB(red, 'emoji.red'),
    green: validateRGB(green, 'emoji.green'),
    blue: validateRGB(blue, 'emoji.blue'),
    opacity: validateOpacity(opacity, 'emoji.opacity'),
    filters: validateFilters(filters, 'emoji.filters')
  }

  return validatedEmojis
}

function validateEmojis (emojis) {
  const emojisArray = Object.values(emojis)

  if (emojisArray.length > MAX_EMOJIS_COUNT) {
    throw new Error(ERR_EXCEED_MAX_EMOJIS)
  }
  
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
  ERR_EXCEED_MAX_EMOJIS,
  validateEmojis,
  validateId,
  validateStudioState,
  validateTitle
}