const { Cells, Comics } = require('../models')
const { falsePositiveResponse } = require('./utils')

const LIMIT = 20

async function all (req, res) {
  let offset = 0

  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    offset = parseInt(offsetFromQueryString, 10)
  }

  const comics = await Comics.findAll({
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
    where: { updated_at: { $gt: latestUpdatedAt }},
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
  const cells = cellsData.map(({ url_id, image_url, order, schema_version, title }) => ({
    urlId: url_id,
    imageUrl: image_url,
    order,
    schemaVersion: schema_version,
    title
  }))

  res.json({
    cells,
    urlId: comic.url_id,
    title: comic.title,
    userCanEdit
  })
}

module.exports = {
  all,
  get,
  getNewerThan
}