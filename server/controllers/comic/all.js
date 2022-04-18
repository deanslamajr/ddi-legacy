const { Op } = require('sequelize')

const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getOlderComics(offset) {
  const where = {
    is_active: true,
  }

  if (offset) {
    where.updated_at = {
      [Op.lt]: offset,
    }
  }

  return Comics.findAndCountAll({
    where,
    order: [['updated_at', 'DESC']],
    limit: PAGE_SIZE,
    include: [Cells],
    distinct: true, // count should not include nested rows
  })
}

async function getNewerComics(offset) {
  return Comics.findAndCountAll({
    order: [['updated_at', 'ASC']],
    where: {
      updated_at: { $gt: offset },
      is_active: true,
    },
    limit: PAGE_SIZE,
    include: [Cells],
    distinct: true, // count should not include nested rows
  })
}

async function all(req, res) {
  let isOffsetFromQueryStringValid = false
  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    const parsedDate = Date.parse(offsetFromQueryString)
    isOffsetFromQueryStringValid = !Number.isNaN(parsedDate)
    if (!isOffsetFromQueryStringValid) {
      offsetFromQueryString = null
    }
  }

  const result = await getOlderComics(offsetFromQueryString)

  const comics = result.rows.map(transformComicFromDB)

  const isPageLoadRequest = req.query['isPageLoadRequest']

  let hasMoreNewer = null
  if (isPageLoadRequest) {
    hasMoreNewer = false
    const earliestUpdatedAt =
      comics[0] !== undefined ? comics[0].updatedAt : null

    if (earliestUpdatedAt) {
      const newerThanResult = await getNewerComics(earliestUpdatedAt)
      hasMoreNewer = newerThanResult.count > 0
    }
  }

  res.json({
    comics,
    cursor:
      result.rows.length > 0
        ? comics[result.rows.length - 1].updatedAt
        : isOffsetFromQueryStringValid
        ? offsetFromQueryString
        : '',
    hasMoreOlder: result.count > result.rows.length,
    hasMoreNewer,
  })
}

async function getNewerThan(req, res) {
  const latestUpdatedAt = req.query['latestUpdatedAt']
  if (!latestUpdatedAt) {
    throw new Error('Invalid request, must include queryString latestUpdatedAt')
  }

  const result = await getNewerComics(latestUpdatedAt)
  const comics = result.rows.map(transformComicFromDB)

  const isPageLoadRequest = req.query['isPageLoadRequest']
  console.log('isPageLoadRequest', isPageLoadRequest)
  let hasMoreOlder = null
  if (isPageLoadRequest) {
    hasMoreOlder = false
    const latestUpdatedAt =
      comics.length > 0 ? comics[comics.length - 1].updatedAt : null

    if (latestUpdatedAt) {
      const olderThanResult = await getOlderComics(latestUpdatedAt)
      hasMoreOlder = olderThanResult.count > 0
    }
  }

  res.json({
    comics,
    hasMoreNewer: result.count > result.rows.length,
    hasMoreOlder,
  })
}

module.exports = {
  all,
  getNewerThan,
}
