const express = require('express')

const { sign } = require('./sign')
const {
  all: getCells,
  get: getCell,
  getParent,
  update: updateCell
} = require('./cell')
const { get: getComic } = require('./comic')

const router = express.Router()

router.get('/sign', sign)

router.get('/cell/:cellId/parent', getParent)
router.get('/cell/:cellId', getCell)
router.put('/cell/:cellId', updateCell)
router.get('/cells', getCells)

router.get('/comic/:comicId', getComic)

module.exports = router