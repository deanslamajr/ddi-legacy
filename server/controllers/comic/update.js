const {Comics} = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils');
const {sequelize} = require('../../adapters/db')

function updateCell ({studioState, caption, previousCellUrlId, urlId}, cells, comicId, transaction) {
  let previousCell;
  const updatePayload = {};

  const cell = cells.find(cell => cell.url_id === urlId);
  if (!cell) {
    throw new Error(`The passed cell.url_id:${urlId} does not exist on comicId:${comicId}`);
  }
  
  // UPDATES
  if (previousCellUrlId) {
    previousCell = cells.find(({url_id}) => url_id === previousCellUrlId);
    if (!previousCell) {
      throw new Error(`The passed cell.previousCellUrlId:${previousCellUrlId} does not exist on comicId:${comicId}`);
    }

    updatePayload.previous_cell_id = previousCell.id;
  }
  if (typeof caption === 'string') {
    updatePayload.caption = caption;
  }
  if (studioState) {
    updatePayload.studio_state = studioState;
  }
  if (updateImageUrl) {
    updatePayload.image_url = cell.draft_image_url;
  }

  return cell.update(updatePayload, {transaction});
}

async function update (req, res) {
  try {
    const comicUrlId = req.params.comicUrlId
    const {
      initialCellUrlId, cells: cellsToUpdate
    } = req.body;
  
    const comic = await Comics.findOne({ where: { url_id: comicUrlId }})
    
    if (!comic) {
      return falsePositiveResponse(`comic::update - There is not a Comic with urlId:${comicUrlId}`, res)
    }
  
    if (!isUserAuthorized(req.session, comic.creator_user_id)) {
      return falsePositiveResponse(`comic::update - User with id:${req.session.userId} is not authorized to update the comic with id:${comic.id}`, res)
    }
  
    const cells = await comic.getCells();

    await sequelize.transaction(async transaction => {
      // has side effect of activating comic
      if (initialCellUrlId) {
        const initialCell = cells.find(({url_id}) => url_id === initialCellUrlId);
    
        if (!initialCell) {
          throw new Error(`The passed initialCellUrlId:${initialCellUrlId} does not exist on comicId:${comic.id}`);
        }
        await comic.update({
          is_active: true, // activates comic
          initial_cell_id: initialCell.id
        }, {transaction});
      }
    
      await Promise.all(
        cellsToUpdate.map(cell => updateCell(cell, cells, comic.id, transaction))
      );
    });

  
    res.sendStatus(200);
  } catch (e) {
    //@TODO log
    //console.error(e);
    res.sendStatus(500);
  }
}

module.exports = {
  update
}