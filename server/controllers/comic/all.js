const { Op, where, literal } = require('sequelize')

const { sequelize } = require('../../adapters/db')
const { Comics, Cells } = require('../../models')
const { transformComicFromDB } = require('./utils')
const { PAGE_SIZE } = require('../../../config/constants.json')

async function getOlderComics({
  caption,
  emoji,
  offset,
  pageSize = PAGE_SIZE * 2,
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

  const emojiSearchArgs = {
    include: [Cells],
    distinct: true, // count should not include nested rows,
  }

  const args = {
    where: whereQueryFragment,
    order: [['updated_at', 'DESC']],
    limit: pageSize,
    transaction,
    subQuery: false,
    ...(emoji || caption ? emojiSearchArgs : {}),
  }

  return Comics.findAndCountAll(args)
}

async function all(req, res, next) {
  let transaction

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

    transaction = await sequelize.transaction()

    const { rows, count } = await getOlderComics({
      caption: captionSearchFromQueryString,
      emoji: emojiFilterFromQueryString,
      offset: offsetFromQueryString,
      transaction,
    })

    const comicIdsFromFilter = rows.map((comic) => comic.id)

    const result = await Comics.findAll({
      order: [['updated_at', 'DESC']],
      where: {
        id: { [Op.in]: comicIdsFromFilter },
        is_active: true,
      },
      include: [Cells],
      distinct: true, // count should not include nested rows
      transaction,
    })

    transaction.commit()

    const comics = result.map(transformComicFromDB)

    const response = {
      comics,
      cursor:
        rows.length > 0
          ? comics[rows.length - 1].updatedAt
          : isOffsetFromQueryStringValid
          ? offsetFromQueryString
          : '',
      hasMoreOlder: count <= 1 ? false : count > rows.length,
    }

    res.json(response)
  } catch (error) {
    try {
      if (transaction) {
        transaction.rollback()
      }
    } catch (deeperError) {
      return next(deeperError)
    }
    next(error)
  }
}

module.exports = {
  all,
}
