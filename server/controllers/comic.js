const { Cells, Comics } = require('../models')
const { falsePositiveResponse } = require('./utils')

const LIMIT = 20;

async function all (req, res) {
  let offset = 0

  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    offset = parseInt(offsetFromQueryString, 10)
  }

  const comics = await Comics.findAll({
    where: {'is_active': true},
    order: [['updated_at', 'DESC']],
    offset,
    limit: LIMIT,
    include: [Cells]
  })
  const count = await Comics.count()

  res.json({
    comics,
    hasMore: count > (offset + LIMIT)
  })
}

async function getNewerThan (req, res) {
  const latestUpdatedAt = req.query['latestUpdatedAt']
  if (!latestUpdatedAt) {
    throw new Error('Invalid request, must include queryString latestUpdatedAt')
  }

  const comics = await Comics.findAll({
    order: [['updated_at', 'ASC']],
    where: {
      updated_at: { $gt: latestUpdatedAt },
      'is_active': true
    },
    limit: LIMIT,
    include: [Cells]
  })

  res.json({
    comics,
    possiblyHasMore: comics.length === LIMIT
  })
}

async function get (req, res) {
  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  let userCanEdit = false
  
  if (!comic) {
    return falsePositiveResponse(`comic::get - There is not a Comic with id:${comicId}`, res)
  }

  if (comic.creator_user_id === req.session.userId) {
    userCanEdit = true
  }

  const cellsData = await comic.getCells()
  const cells = cellsData.map(({
    url_id, image_url, order, schema_version, studio_state, title
  }) => ({
    urlId: url_id,
    imageUrl: image_url,
    order,
    schemaVersion: schema_version,
    studioState: studio_state,
    title
  }))

  res.json({
    cells,
    urlId: comic.url_id,
    title: comic.title,
    userCanEdit
  })
}

async function inactivate (req, res) {
  if (!req.session.userId) {
    throw new Error('User session does not exist!')
  }

  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  
  if (!comic) {
    return falsePositiveResponse(`comic::delete - There is not a Comic with id:${comicId}`, res)
  }

  if (comic.creator_user_id !== req.session.userId) {
    return falsePositiveResponse(`comic::delete - User with id:${req.session.userId} is not authorized to delete the comic with id:${comicId}`, res)
  }

  await comic.update({
    'is_active': false
  }, {
    // don't alter Comic.updated_at
    // http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update
    silent: true
  });

  return res.sendStatus(200)
}

module.exports = {
  all,
  inactivate,
  get,
  getNewerThan
}