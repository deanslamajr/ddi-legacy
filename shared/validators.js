const shortid = require('shortid')

const {
  MAX_EMOJIS_COUNT,
  MIN_POSITION,
  MAX_POSITION,
  MIN_ROTATION,
  MAX_ROTATION,
  MIN_SIZE,
  MAX_SIZE,
  MIN_SKEW,
  MAX_SKEW,
  MIN_ALPHA,
  MAX_ALPHA,
  MIN_RGB,
  MAX_RGB,
  MIN_OPACITY,
  MAX_OPACITY,
  MAX_CAPTION_LENGTH,
  FILTERS_LIST,
} = require('../config/constants.json')

const STUDIO_STATE_VALIDATION_ERROR = 'STUDIO_STATE_VALIDATION_ERROR:'

const ERR_FILENAME_INVALID = 'the given filename is invalid'
const ERR_CANNOT_BE_NEGATIVE = 'cannot be a negative value'
const ERR_INCORRECT_SCALE_VALUE = 'must be either -1 or 1'
const ERR_MUST_BE_A_NUMBER = 'must be a number type'
const ERR_MUST_BE_A_STRING = 'must be a string type'
const ERR_VALUE_MUST_BE_SET = 'must be set'
const ERR_EXCEED_MAX_EMOJIS = `Emojis datastructure cannot exceed a count of ${MAX_EMOJIS_COUNT} emojis`
const ERR_MUST_BE_A_HEX_COLOR = 'must be a valid hex color string'

function validateCaption(caption) {
  let validatedCaption = caption

  if (validatedCaption && validatedCaption.length > MAX_CAPTION_LENGTH) {
    validatedCaption = validatedCaption.substring(0, MAX_CAPTION_LENGTH)
  }

  return validatedCaption
}

function validateFilename(filename) {
  if (!filename.includes('.png')) {
    throw new Error(ERR_FILENAME_INVALID)
  }

  const filenameWithoutExt = filename.slice(0, -4)

  if (!shortid.isValid(filenameWithoutExt)) {
    throw new Error(ERR_FILENAME_INVALID)
  }

  if (filenameWithoutExt.length > 14) {
    throw new Error(ERR_FILENAME_INVALID)
  }
}

function validateId(id, field) {
  // must be a number
  if (typeof id !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return 0
  }
  // must be >= 0
  if (id < 0) {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_CANNOT_BE_NEGATIVE}`
    )
    return 0
  }
  return id
}

function validateBackgroundColor(hex, field) {
  const hexRegExp = /^#[0-9A-F]{6}$/i
  if (!hexRegExp.test(hex)) {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_HEX_COLOR}`
    )
    return '#FFFAF9' // default white
  }
  return hex
}

function validatePosition(value, field) {
  // must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return MIN_POSITION
  }

  if (value < MIN_POSITION) {
    return MIN_POSITION
  } else if (value > MAX_POSITION) {
    return MAX_POSITION
  } else {
    return value
  }
}

function validateSkew(value) {
  if (typeof value !== 'number') {
    return 0
  } else if (value < MIN_SKEW) {
    return MIN_SKEW
  } else if (value > MAX_SKEW) {
    return MAX_SKEW
  } else {
    return value
  }
}

function validateEmojiField(value) {
  // must be a string type
  if (typeof value !== 'string') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}emoji.emoji ${ERR_MUST_BE_A_STRING}`
    )
    return ''
  }

  if (value.length > 255) {
    return value.substring(0, 8)
  }

  return value
}

function validateScale(value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return 1
  }

  if (value !== -1 && value !== 1) {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_INCORRECT_SCALE_VALUE}`
    )
    return 1
  }

  return value
}

function validateRotation(value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return MIN_ROTATION
  }

  if (value < MIN_ROTATION) {
    return MIN_ROTATION
  } else if (value > MAX_ROTATION) {
    return MAX_ROTATION
  } else {
    return value
  }
}

function validateSize(value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return MAX_SIZE
  }

  if (value < MIN_SIZE) {
    return MIN_SIZE
  } else if (value > MAX_SIZE) {
    return MAX_SIZE
  } else {
    return value
  }
}

function validateAlpha(value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return MAX_ALPHA
  }

  if (value < MIN_ALPHA) {
    return MIN_ALPHA
  } else if (value > MAX_ALPHA) {
    return MAX_ALPHA
  } else {
    return value
  }
}

function validateRGB(value, field) {
  // Must be a number
  if (typeof value !== 'number') {
    console.warn(
      `${STUDIO_STATE_VALIDATION_ERROR}${field} ${ERR_MUST_BE_A_NUMBER}`
    )
    return MIN_RGB
  }

  if (value < MIN_RGB) {
    return MIN_RGB
  } else if (value > MAX_RGB) {
    return MAX_RGB
  } else {
    return value
  }
}

function validateOpacity(value, field) {
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

function validateFilters(filters, field) {
  if (!filters || !Array.isArray(filters)) {
    return undefined
  }

  const withoutUnrecognized = filters.filter((filter) =>
    FILTERS_LIST.includes(filter)
  )

  if (!withoutUnrecognized.length) {
    return undefined
  }

  // remove duplicates
  return Array.from(new Set(withoutUnrecognized))
}

function validateEmojiDatastructure(
  validatedEmojis,
  {
    emoji,
    id,
    order,
    x,
    y,
    scaleX,
    scaleY,
    skewX,
    skewY,
    rotation,
    size,
    alpha,
    red,
    green,
    blue,
    opacity,
    filters,
  }
) {
  validatedEmojis[id] = {
    emoji: validateEmojiField(emoji),
    id: validateId(id, 'emoji.id'),
    order: validateId(order, 'emoji.order'),
    x: validatePosition(x, 'emoji.x'),
    y: validatePosition(y, 'emoji.y'),
    scaleX: validateScale(scaleX, 'emoji.scaleX'),
    scaleY: validateScale(scaleY, 'emoji.scaleY'),
    skewX: validateSkew(skewX),
    skewY: validateSkew(skewY),
    rotation: validateRotation(rotation, 'emoji.rotation'),
    size: validateSize(size, 'emoji.size'),
    alpha: validateAlpha(alpha, 'emoji.alpha'),
    red: validateRGB(red, 'emoji.red'),
    green: validateRGB(green, 'emoji.green'),
    blue: validateRGB(blue, 'emoji.blue'),
    opacity: validateOpacity(opacity, 'emoji.opacity'),
    filters: validateFilters(filters, 'emoji.filters'),
  }

  return validatedEmojis
}

function validateEmojis(emojis) {
  const emojisArray = Object.values(emojis)

  if (emojisArray.length > MAX_EMOJIS_COUNT) {
    console.warn(`${STUDIO_STATE_VALIDATION_ERROR}${ERR_EXCEED_MAX_EMOJIS}`)
    emojisArray.length = MAX_EMOJIS_COUNT // this actually works!
  }

  return emojisArray.reduce(validateEmojiDatastructure, {})
}

function validateStudioState(studioState) {
  if (!studioState) {
    return null
  }

  const validatedStudioState = {
    activeEmojiId: validateId(studioState.activeEmojiId, 'activeEmojiId'),
    backgroundColor: validateBackgroundColor(
      studioState.backgroundColor,
      'backgroundColor'
    ),
    currentEmojiId: validateId(studioState.currentEmojiId, 'currentEmojiId'),
    caption: validateCaption(studioState.caption),
    emojis: validateEmojis(studioState.emojis),
  }

  return validatedStudioState
}

module.exports = {
  ERR_MUST_BE_A_HEX_COLOR,
  ERR_FILENAME_INVALID,
  ERR_CANNOT_BE_NEGATIVE,
  ERR_INCORRECT_SCALE_VALUE,
  ERR_MUST_BE_A_NUMBER,
  ERR_MUST_BE_A_STRING,
  ERR_VALUE_MUST_BE_SET,
  ERR_EXCEED_MAX_EMOJIS,
  validateBackgroundColor,
  validateEmojiField,
  validateEmojis,
  validateFilename,
  validateId,
  validateSkew,
  validateStudioState,
  validateCaption,
}
