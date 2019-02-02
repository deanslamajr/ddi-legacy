const { Cells } = require('../models')


async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})

  const hasStudioState = cell.studio_state ? true : false
  res.json({
    image_url: cell.image_url,
    title: cell.title,
    hasStudioState
  })
}

async function all (req, res) {
  const cells = await Cells.findAll({})
  res.json(cells)
}

async function update (req, res) {
  try {
    const cellId = req.params.cellId
    const { studioState } = req.body

    const cell = await Cells.findOne({ where: { url_id: cellId }})
    await cell.update({ studio_state: studioState })
    res.sendStatus(200)
  }
  catch (e) {
    console.error(e)
  }
  
}

module.exports = {
  all,
  get,
  update
}