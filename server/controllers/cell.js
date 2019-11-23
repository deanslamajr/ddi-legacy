const { Cells } = require('../models')
const { falsePositiveResponse } = require('./utils')

async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})
  
  if (!cell) {
    return falsePositiveResponse(`cell::get - There is not a Cell with id:${cellId}`, res)
  }

  res.json({
    schemaVersion: cell.schema_version,
    image_url: cell.image_url,
    studioState: cell.studio_state,
    caption: cell.caption
  })
}

module.exports = {
  get
}