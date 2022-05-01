const { Op } = require('sequelize')
const { sequelize } = require('../../adapters/db')

const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getOlderComics({
  offset,
  pageSize = PAGE_SIZE,
  includeComicAtOffset = false,
  transaction,
}) {
  const where = {
    is_active: true,
  }

  if (offset) {
    where.updated_at = {
      [includeComicAtOffset ? Op.lte : Op.lt]: offset,
    }
  }

  return Comics.findAndCountAll({
    where,
    order: [['updated_at', 'DESC']],
    limit: pageSize,
    include: [Cells],
    distinct: true, // count should not include nested rows,
    transaction,
  })
}

async function getNewerComics({ offset, pageSize = PAGE_SIZE, transaction }) {
  return Comics.findAndCountAll({
    order: [['updated_at', 'ASC']],
    where: {
      updated_at: { $gt: offset },
      is_active: true,
    },
    limit: pageSize,
    include: [Cells],
    distinct: true, // count should not include nested rows
    transaction,
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

  const includeComicAtOffset = req.query['includeComicAtOffset']

  let response = {}
  await sequelize.transaction(async (transaction) => {
    const result = await getOlderComics({
      offset: offsetFromQueryString,
      includeComicAtOffset,
      transaction,
    })

    const comics = result.rows.map(transformComicFromDB)

    const isPageLoadRequest = req.query['isPageLoadRequest']

    let hasMoreNewer = null
    if (isPageLoadRequest) {
      hasMoreNewer = false
      const earliestUpdatedAt =
        comics[0] !== undefined ? comics[0].updatedAt : null

      if (earliestUpdatedAt) {
        const newerThanResult = await getNewerComics({
          offset: earliestUpdatedAt,
          pageSize: 1,
          transaction,
        })
        hasMoreNewer = newerThanResult.count > 0
      }
    }

    response = {
      comics,
      cursor:
        result.rows.length > 0
          ? comics[result.rows.length - 1].updatedAt
          : isOffsetFromQueryStringValid
          ? offsetFromQueryString
          : '',
      hasMoreOlder: result.count > result.rows.length,
      hasMoreNewer,
    }
  })

  res.json(response)
}

async function getNewerThan(req, res) {
  const latestUpdatedAt = req.query['latestUpdatedAt']
  if (!latestUpdatedAt) {
    throw new Error('Invalid request, must include queryString latestUpdatedAt')
  }

  let response = {}
  await sequelize.transaction(async (transaction) => {
    const result = await getNewerComics({
      offset: latestUpdatedAt,
      transaction,
    })
    const comics = result.rows.map(transformComicFromDB)

    const isPageLoadRequest = req.query['isPageLoadRequest']

    let hasMoreOlder = null
    if (isPageLoadRequest) {
      hasMoreOlder = false
      const latestUpdatedAt =
        comics.length > 0 ? comics[comics.length - 1].updatedAt : null

      if (latestUpdatedAt) {
        const olderThanResult = await getOlderComics({
          offset: latestUpdatedAt,
          pageSize: 1,
          transaction,
        })
        hasMoreOlder = olderThanResult.count > 0
      }
    }

    response = {
      comics,
      hasMoreNewer: result.count > result.rows.length,
      hasMoreOlder,
    }
  })

  res.json(response)
}

module.exports = {
  all,
  getNewerThan,
}
