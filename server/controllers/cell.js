const { Cells } = require('../models')

// purposeful incorrect response of 'OK' to not allow trolling of ids for validity
function falsePositiveResponse (cellId, res) {
  // @todo proper log
  console.error(`Cell Update Error: There is not a Cell with id:${cellId}`)
  return res.sendStatus(200)
}

async function getParentFromChild (cell) {
  const parent = await Cells.findOne({ where: { id: cell.parent_id }}) // get parent
  return parent
}

/**
 * /api/cell/:id/parent
 * e.g.
 * http://localhost:3000/api/cell/ZaYoy3LEW/parent
 */
async function getParent (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})
  const parent = await getParentFromChild(cell)
  res.json(parent)
}

async function get (req, res) {
  const cellId = req.params.cellId
  const cell = await Cells.findOne({ where: { url_id: cellId }})
  
  if (!cell) {
    return falsePositiveResponse(cellId, res)
  }

  const parent = await getParentFromChild(cell)
  const parentId = parent ? parent.url_id : null

  res.json({
    image_url: cell.image_url,
    parentId,
    studioState: cell.studio_state,
    title: cell.title
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
  getParent,
  update
}