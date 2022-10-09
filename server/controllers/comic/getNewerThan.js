const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

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
  getNewerThan,
}
