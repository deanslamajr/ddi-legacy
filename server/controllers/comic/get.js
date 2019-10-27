const {Cells, Comics} = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils');

async function get (req, res) {
  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  let userCanEdit = false;
  let initialCellUrlId;
  
  if (!comic) {
    return falsePositiveResponse(`comic::get - There is not a Comic with id:${comicId}`, res)
  }

  if (isUserAuthorized(req.session, comic.creator_user_id)) {
    userCanEdit = true
  }

  const cellsData = await comic.getCells();

  let cells = cellsData.map(({
    url_id, image_url, order, previous_cell_id, schema_version, studio_state, caption
  }) => ({
    urlId: url_id,
    imageUrl: image_url,
    order,
    previousCellId: previous_cell_id,
    schemaVersion: schema_version,
    studioState: studio_state,
    caption
  }))

  if (cells.length && cells[0].schemaVersion >= 4) {
    // resolve cells[].previousCellUrlId
    cells = cells.map(cell => {
      const previousCell = cellsData.find(({id}) => cell.previousCellId === id);
      return {
        ...cell,
        previousCellId: undefined,
        previousCellUrlId: previousCell ? previousCell.url_id : null
      }
    });

    // resolve comic.initialCellUrlId
    const initialCell = cellsData.find(({id}) => comic.initial_cell_id === id)
    initialCellUrlId = initialCell && initialCell.url_id;
  }

  res.json({
    cells,
    isActive: comic.is_active,
    initialCellUrlId,
    title: comic.title,
    urlId: comic.url_id,
    userCanEdit
  });
}

module.exports = {
  get
}