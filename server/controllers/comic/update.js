const { Comics } = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils')
const { sequelize } = require('../../adapters/db')
const {
  validateCaption,
  validateStudioState,
} = require('../../../shared/validators')

const { MAX_DIRTY_CELLS } = require('../../../config/constants.json')
const next = require('next')

function updateCell(
  {
    studioState,
    caption,
    order,
    previousCellUrlId,
    schemaVersion,
    updateImageUrl,
    urlId,
  },
  cells,
  comicId,
  transaction
) {
  let previousCell
  const updatePayload = {}

  const cell = cells.find((cell) => cell.url_id === urlId)
  if (!cell) {
    throw new Error(
      `The passed cell.url_id:${urlId} does not exist on comicId:${comicId}`
    )
  }

  // UPDATES
  if (previousCellUrlId === null) {
    updatePayload.previous_cell_id = null
  } else if (previousCellUrlId) {
    previousCell = cells.find(({ url_id }) => url_id === previousCellUrlId)
    if (!previousCell) {
      throw new Error(
        `The passed cell.previousCellUrlId:${previousCellUrlId} does not exist on comicId:${comicId}`
      )
    }

    updatePayload.previous_cell_id = previousCell.id
  }
  if (typeof caption === 'string') {
    updatePayload.caption = validateCaption(caption)
  }
  if (studioState) {
    updatePayload.studio_state = validateStudioState(studioState)
  }
  if (updateImageUrl) {
    updatePayload.image_url = cell.draft_image_url
  }
  if (order === null) {
    updatePayload.order = null
  }
  if (schemaVersion) {
    updatePayload.schema_version = schemaVersion
  }

  return cell.update(updatePayload, { transaction })
}

function updateComic(comic, cells, initialCellUrlId, transaction) {
  if (initialCellUrlId) {
    const initialCell = cells.find(({ url_id }) => url_id === initialCellUrlId)

    if (!initialCell) {
      // @todo this should probably respond with a 4xx status code that represents bad payload
      throw new Error(
        `The passed initialCellUrlId:${initialCellUrlId} does not exist on comicId:${comic.id}`
      )
    }

    return comic.update(
      {
        initial_cell_id: initialCell.id,
        // activates comic, only useful for first publish
        is_active: true,
      },
      { transaction }
    )
  } else {
    // bump the comic's updated_at value
    comic.changed('updated_at', true)
    return comic.save({ transaction })
  }
}

async function update(req, res, next) {
  try {
    const comicUrlId = req.params.comicUrlId
    const { initialCellUrlId, cells: cellsToUpdate } = req.body

    const comic = await Comics.findOne({ where: { url_id: comicUrlId } })

    if (!comic) {
      return falsePositiveResponse(
        `comic::update - There is not a Comic with urlId:${comicUrlId}`,
        res
      )
    }

    if (!isUserAuthorized(req.session, comic.creator_user_id)) {
      return falsePositiveResponse(
        `comic::update - User with id:${req.session.userId} is not authorized to update the comic with id:${comic.id}`,
        res
      )
    }

    if (cellsToUpdate.length > MAX_DIRTY_CELLS) {
      // @TODO log
      console.error(
        `comic::update - The number of cells to update, ${cellsToUpdate.length}, exceeded the system limit of ${MAX_DIRTY_CELLS}.`
      )
      return res.sendStatus(400)
    }

    const cells = await comic.getCells()

    await sequelize.transaction(async (transaction) => {
      const comicUpdateAsyncTasks = cellsToUpdate.map((cell) =>
        updateCell(cell, cells, comic.id, transaction)
      )

      comicUpdateAsyncTasks.push(
        updateComic(comic, cells, initialCellUrlId, transaction)
      )

      return Promise.all(comicUpdateAsyncTasks)
    })

    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  update,
}
