const { Cells } = require('../models')


async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})
  res.write(JSON.stringify({
    image_url: cell.image_url,
    title: cell.title
  }))
  res.end()
}

async function all (req, res) {
  const cells = await Cells.findAll({})
  res.json(cells)
}

module.exports = {
  all,
  get
}