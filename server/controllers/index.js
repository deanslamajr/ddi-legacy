const express = require('express')

const {login, logout} = require('./user')
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
  getNewerThan,
  sign: signComic,
  update: updateComic
} = require('./comic')

const router = express.Router()

router.post('/user/login', login);
router.post('/user/logout', logout);

router.post('/sign', sign)

router.get('/cell/:cellId/parent', getParent)
router.get('/cell/:cellId', getCell)
router.put('/cell/:cellId', updateCell)
router.get('/cells', getCells)

router.post('/comic/:comicUrlId/sign', signComic);
router.get('/comic/:comicId', getComic);
router.patch('/comic/:comicUrlId', updateComic);
router.delete('/comic/:comicId', deleteComic);
router.get('/comics', getComics)
router.get('/comics/latest', getNewerThan)

module.exports = router