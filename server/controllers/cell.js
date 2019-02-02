const { Cells } = require('../models')


async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})

  res.json({
    image_url: cell.image_url,
    title: cell.title,
    studioState: cell.studio_state
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

    if (cell.creator_user_id !== req.session.userId) {
      throw new Error('Unauthorized user!')
    }

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