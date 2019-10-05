const {Cells, Comics} = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils');

function updateCell ({studioState, caption, previousCellUrlId}, cells, comicId) {
  let previousCell;
  
  if (previousCellUrlId) {
    previousCell = cells.find(({url_id}) => url_id === previousCellUrlId);
    if (!previousCell) {
      throw new Error(`The passed cell.previousCellUrlId:${previousCellUrlId} does not exist on comicId:${comicId}`);
    }
  }

  return cell.update({
    caption,
    previous_cell_id: previousCell.id,
    studio_state: studioState
  });
}

async function update (req, res) {
  try {
    const comicUrlId = req.params.comicUrlId
    const {
      initialCellUrlId, cells: cellsToUpdate
    } = req.body;
  
    const comic = await Comics.findOne({ where: { url_id: comicUrlId }})
  
    console.log('comic', comic)
    
    if (!comic) {
      return falsePositiveResponse(`comic::update - There is not a Comic with id:${comicUrlId}`, res)
    }
  
    if (!isUserAuthorized(req.session, comic.creator_user_id)) {
      return falsePositiveResponse(`comic::update - User with id:${req.session.userId} is not authorized to delete the comic with id:${comicId}`, res)
    }
  
    const cells = await Cells.findAll({});
  
    console.log('initialCellUrlId', initialCellUrlId)
    if (initialCellUrlId) {
      const initialCell = cells.find(({url_id}) => url_id === initialCellUrlId);
  
      if (!initialCell) {
        throw new Error(`The passed initialCellUrlId:${initialCellUrlId} does not exist on comicId:${comic.id}`);
      }
      await comic.update({
        is_active: true,
        initial_cell_id: initialCell.id
      });
    }
  
    await Promise.all(
      cellsToUpdate.map(cell => updateCell(cell, cells, comic.id))
    );
  
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

module.exports = {
  update
}