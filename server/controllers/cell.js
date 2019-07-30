const { Cells } = require('../models')
const { falsePositiveResponse, isUserAuthorized } = require('./utils')
const { validateStudioState } = require('../../shared/validators')

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
    return falsePositiveResponse(`cell::get - There is not a Cell with id:${cellId}`, res)
  }

  const parent = await getParentFromChild(cell)
  const parentId = parent ? parent.url_id : null

  res.json({
    schemaVersion: cell.schema_version,
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

async function activateComic (cell) {
  const comic = await cell.getComic();
  return comic.update({is_active: true});
}

async function update (req, res) {
  try {
    const cellId = req.params.cellId

    const studioState = validateStudioState(req.body.studioState)

    const cell = await Cells.findOne({ where: { url_id: cellId }})

    if (!cell) {
      return falsePositiveResponse(`cell::update - There is not a Cell with id:${cellId}`, res)
    }

    if (!isUserAuthorized(req.session, cell.creator_user_id)) {
      // @todo proper log
      // @todo this should probably provide some kind of false positive response
      console.error('Unauthorized user!')
      return res.sendStatus(401)
    }

    const activateComicPromise = req.body.activateComic
      ? activateComic(cell)
      : Promise.resolve();

    const updateCellPromise = cell.update({ studio_state: studioState });

    await Promise.all([
      updateCellPromise,
      activateComicPromise
    ]);
    
    res.sendStatus(200);
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