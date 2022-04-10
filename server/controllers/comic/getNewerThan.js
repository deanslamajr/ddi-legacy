const { transformComicFromDB } = require('./utils')
const { Cells, Comics } = require('../../models')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getNewerComics(offset) {
  return Comics.findAndCountAll({
    order: [['updated_at', 'DESC']],
    where: {
      updated_at: { $gt: offset },
      is_active: true,
    },
    limit: PAGE_SIZE,
    include: [Cells],
    distinct: true, // count should not include nested rows
  })
}

async function getNewerThan(req, res) {
  const latestUpdatedAt = req.query['latestUpdatedAt']
  if (!latestUpdatedAt) {
    throw new Error('Invalid request, must include queryString latestUpdatedAt')
  }

  const result = await getNewerComics(latestUpdatedAt)
  const comics = result.rows.map(transformComicFromDB)

  res.json({
    comics,
    possiblyHasMore: comics.length === PAGE_SIZE, // deprecated, use the more accurate hasMore
    hasMore: result.count > result.rows.length,
  })
}

module.exports = {
  getNewerComics,
  getNewerThan,
}
