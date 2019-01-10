const { Cells } = require('../models')


async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})
  res.write(JSON.stringify({ image_url: cell.image_url }))
  res.end()
}

module.exports = {
  get
}