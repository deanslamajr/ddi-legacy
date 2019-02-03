const { Cells } = require('../models')

// purposeful incorrect response of 'OK' to not allow trolling of ids for validity
function falsePositiveResponse (cellId, res) {
  // @todo proper log
  console.error(`Cell Update Error: There is not a Cell with id:${cellId}`)
  return res.sendStatus(200)
}

async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})

  if (!cell) {
    return falsePositiveResponse(cellId, res)
  }

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
    const studioState = req.body.studioState || null

    const cell = await Cells.findOne({ where: { url_id: cellId }})

    if (!cell) {
      return falsePositiveResponse(cellId, res)
    }

    if (cell.creator_user_id !== req.session.userId) {
      // @todo proper log
      console.error('Unauthorized user!')
      return res.sendStatus(401)
    }

    await cell.update({ studio_state: studioState })
    res.sendStatus(200)
  }
  catch (e) {
    console.error(e)
    throw e
  }
  
}

module.exports = {
  all,
  get,
  update
}