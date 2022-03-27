const { Op } = require('sequelize')

const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function all(req, res) {
  const where = {
    is_active: true,
  }

  let isOffsetFromQueryStringValid = false

  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    const parsedDate = Date.parse(offsetFromQueryString)
    isOffsetFromQueryStringValid = !Number.isNaN(parsedDate)
    if (isOffsetFromQueryStringValid) {
      where.updated_at = {
        [Op.lt]: offsetFromQueryString,
      }
    }
  }

  const result = await Comics.findAndCountAll({
    where,
    order: [['updated_at', 'DESC']],
    limit: PAGE_SIZE,
    include: [Cells],
    distinct: true, // count should not include nested rows
  })

  const comics = result.rows.map(transformComicFromDB)

  res.json({
    comics,
    cursor:
      result.rows.length > 0
        ? comics[result.rows.length - 1].updatedAt
        : isOffsetFromQueryStringValid
        ? offsetFromQueryString
        : '',
    hasMore: result.count > result.rows.length,
  })
}

module.exports = {
  all,
}
