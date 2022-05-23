const next = require('next')
const { Cells, Comics } = require('../models')
const { falsePositiveResponse } = require('./utils')

async function get(req, res) {
  try {
    const cellId = req.params.cellId
    const cell = await Cells.findOne({
      where: { url_id: cellId },
      include: [Comics],
    })

    if (!cell) {
      return falsePositiveResponse(
        `cell::get - There is not a Cell with id:${cellId}`,
        res
      )
    }

    res.json({
      schemaVersion: cell.schema_version,
      image_url: cell.image_url,
      studioState: cell.studio_state,
      caption: cell.caption,
      comicUrlId: cell.comic.url_id,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  get,
}
