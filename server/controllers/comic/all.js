const { Op, where, literal } = require('sequelize')

const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getOlderComics({
  caption,
  emoji,
  offset,
  pageSize = PAGE_SIZE,
  transaction,
}) {
  const whereQueryFragment = {
    is_active: true,
  }

  if (offset) {
    whereQueryFragment.updated_at = {
      [Op.lte]: offset,
    }
  }

  if (caption) {
    whereQueryFragment['$cells.caption$'] = { [Op.iLike]: `%${caption}%` }
  }

  if (emoji) {
    whereQueryFragment.$and = [
      where(literal("cells.studio_state->>'emojis'"), {
        [Op.iLike]: `%"emoji":"${emoji}"%`,
      }),
    ]
  }

  return Comics.findAndCountAll({
    where: whereQueryFragment,
    order: [['updated_at', 'DESC']],
    limit: pageSize,
    include: [Cells],
    distinct: true, // count should not include nested rows,
    transaction,
    subQuery: false,
  })
}

async function all(req, res, next) {
  try {
    let isOffsetFromQueryStringValid = false
    const captionSearchFromQueryString = req.query['caption']
    const emojiFilterFromQueryString = req.query['emoji']
    const offsetFromQueryString = req.query['offset']

    if (offsetFromQueryString) {
      const parsedDate = Date.parse(offsetFromQueryString)
      isOffsetFromQueryStringValid = !Number.isNaN(parsedDate)
      if (!isOffsetFromQueryStringValid) {
        offsetFromQueryString = null
      }
    }

    const resultFromFilter = await getOlderComics({
      caption: captionSearchFromQueryString,
      emoji: emojiFilterFromQueryString,
      offset: offsetFromQueryString,
    })

    const comicIdsFromFilter = resultFromFilter.rows.map((comic) => comic.id)

    const result = await Comics.findAll({
      order: [['updated_at', 'DESC']],
      where: {
        id: { [Op.in]: comicIdsFromFilter },
        // is_active: true,
      },
      include: [Cells],
      distinct: true, // count should not include nested rows
    })

    const comics = result.map(transformComicFromDB)

    const response = {
      comics,
      cursor:
        resultFromFilter.rows.length > 0
          ? comics[resultFromFilter.rows.length - 1].updatedAt
          : isOffsetFromQueryStringValid
          ? offsetFromQueryString
          : '',
      hasMoreOlder:
        resultFromFilter.count < 1
          ? false
          : resultFromFilter.count > resultFromFilter.rows.length,
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  all,
}
