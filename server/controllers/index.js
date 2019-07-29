const express = require('express')

const {authenticate: authenticateUser} = require('./user')
const { sign } = require('./sign')
const {
  all: getCells,
  get: getCell,
  getParent,
  update: updateCell
} = require('./cell')
const {
  all: getComics,
  inactivate: deleteComic,
  get: getComic,
  getNewerThan
} = require('./comic')

const router = express.Router()

router.post('/user/login', authenticateUser)

router.post('/sign', sign)

router.get('/cell/:cellId/parent', getParent)
router.get('/cell/:cellId', getCell)
router.put('/cell/:cellId', updateCell)
router.get('/cells', getCells)


router.get('/comic/:comicId', getComic)
router.delete('/comic/:comicId', deleteComic);
router.get('/comics', getComics)
router.get('/comics/latest', getNewerThan)

module.exports = router