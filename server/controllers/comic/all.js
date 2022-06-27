const { Op } = require('sequelize')

const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getOlderComics({ offset, pageSize = PAGE_SIZE, transaction }) {
  const where = {
    is_active: true,
  }

  if (offset) {
    where.updated_at = {
      [Op.lte]: offset,
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

async function getNewerComics({ offset, pageSize = PAGE_SIZE }) {
  return Comics.findAndCountAll({
    order: [['updated_at', 'ASC']],
    where: {
      updated_at: { $gt: offset },
      is_active: true,
    },
    limit: pageSize,
    include: [Cells],
    distinct: true, // count should not include nested rows
  })
}

async function all(req, res, next) {
  try {
    let isOffsetFromQueryStringValid = false
    const offsetFromQueryString = req.query['offset']
    if (offsetFromQueryString) {
      const parsedDate = Date.parse(offsetFromQueryString)
      isOffsetFromQueryStringValid = !Number.isNaN(parsedDate)
      if (!isOffsetFromQueryStringValid) {
        offsetFromQueryString = null
      }
    }

    const result = await getOlderComics({
      offset: offsetFromQueryString,
    })

    const comics = result.rows.map(transformComicFromDB)

    const response = {
      comics,
      cursor:
        result.rows.length > 0
          ? comics[result.rows.length - 1].updatedAt
          : isOffsetFromQueryStringValid
          ? offsetFromQueryString
          : '',
      hasMoreOlder:
        result.count < 1 ? false : result.count > result.rows.length,
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
}

async function getNewerThan(req, res, next) {
  try {
    let latestUpdatedAt = req.query['latestUpdatedAt']
    if (!latestUpdatedAt) {
      throw new Error(
        'Invalid request, must include queryString latestUpdatedAt'
      )
    }

    try {
      if (Number.isNaN(Date.parse(latestUpdatedAt))) {
        const dateAsMilliseconds = Number.parseInt(latestUpdatedAt)
        if (!Number.isNaN(dateAsMilliseconds)) {
          latestUpdatedAt = dateAsMilliseconds
        }
      }
    } catch (error) {
      console.error(error)
    }

    const result = await getNewerComics({
      offset: latestUpdatedAt,
    })
    const comics = result.rows.map(transformComicFromDB)

    res.json({
      comics,
      hasMoreNewer:
        result.count < 1 ? false : result.count > result.rows.length,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  all,
  getNewerThan,
}
