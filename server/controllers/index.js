const express = require('express')

const {login, logout} = require('./user')
const {get: getCell} = require('./cell')
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

router.get('/cell/:cellId', getCell)

router.post('/comic/:comicUrlId/sign', signComic);
router.get('/comic/:comicId', getComic);
router.patch('/comic/:comicUrlId', updateComic);
router.delete('/comic/:comicId', deleteComic);
router.get('/comics', getComics)
router.get('/comics/latest', getNewerThan)

router.get('/errortest', () => {
  throw new Error('test error from api!');
});

module.exports = router