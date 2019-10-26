import axios from 'axios';

import { isDraftId } from '../../../shared/isDraftId';

// cellFromState = {
//   comicUrlId: "CL1fWeSIe---draft",
//   hasNewImage: true,
//   urlId: "Va_uPpdZB---draft",
//   imageUrl: "blob:http://localhost:3000/f0065615-a3e5-4816-acb1-b85226f2ee7c",
//   previousCellUrlId: "ldxd0itn8---draft",
//   studioState: {/** */}
// }

// signedCells = [{
//   draftUrlId: "sIYUqmZHlN---draft",
//   filename: "k_A5aAD8qK.png",
//   urlId: "ffHbrqSDXx",
//   signData: {}
// }]
function transformCell (cellFromState, signedCells, publishedComic) {
  const transformedCell = {};

  const caption = getCaption(cellFromState);
  if (typeof caption === 'string') {
    transformedCell.caption = caption;
  }

  const urlId = getUrlId(cellFromState, signedCells);
  if (urlId) {
    transformedCell.urlId = urlId;
  }

  const previousCellUrlId = getPreviousCellUrlId(cellFromState, signedCells, publishedComic);
  if (previousCellUrlId === null || previousCellUrlId) {
    transformedCell.previousCellUrlId = previousCellUrlId;
  }

  const studioState = getStudioState(cellFromState);
  if (studioState) {
    transformedCell.studioState = studioState;
  }

  // update the image of a published cell
  if (cellFromState.hasNewImage && !isDraftId(cellFromState.urlId)) {
    transformedCell.updateImageUrl = true;
  }

  return transformedCell
}

function getStudioState (cellFromState) {
  return cellFromState.studioState;
}

function getPreviousCellUrlId (cellFromState, signedCells, publishedComic) {
  if (!cellFromState.previousCellUrlId) {
    return null;
  }

  let previousCellUrlId;

  if (isDraftId(cellFromState.previousCellUrlId)) {
    previousCellUrlId = getSignedCell(cellFromState.previousCellUrlId, signedCells).urlId;
  } else {
    previousCellUrlId = getPublishedCell(cellFromState.previousCellUrlId, publishedComic.cells).urlId;
  }

  return previousCellUrlId;
}

function getCaption (cellFromState) {
  return cellFromState.studioState.caption;
}

function getUrlId (cellFromState, signedCells) {
  let cellUrlId;

  if (isDraftId(cellFromState.urlId)) {
    cellUrlId = getSignedCell(cellFromState.urlId, signedCells).urlId;
  } else {
    cellUrlId = cellFromState.urlId;
  }

  return cellUrlId;
}

function getPublishedCell (cellUrlId, publishedCells) {
  const publishedCell = publishedCells.find(({urlId}) => cellUrlId === urlId);
  if (!publishedCell) {
    throw new Error(`Published cell does not exist for cellUrlId ${cellUrlId}`);
  }
  return publishedCell;
}

function getSignedCell (cellUrlId, signedCells) {
  const signedCell = signedCells.find(({draftUrlId}) => cellUrlId === draftUrlId);
  if (!signedCell) {
    throw new Error(`Signed cell does not exist for unpublished cell ${cellUrlId}`);
  }
  return signedCell;
}

export async function createUpdatePayload({comic, comicUrlIdToUpdate, isPublishedComic, signedCells}) {
  const updatePayload = {
    cells: []
  };

  if (!isPublishedComic) {
    const initialCell = getSignedCell(comic.initialCellUrlId, signedCells);
    updatePayload.initialCellUrlId = initialCell.urlId;

    const transformedCells = Object.values(comic.cells).map(cell => (
      transformCell(cell, signedCells)
    ));

    updatePayload.cells = transformedCells;
  } else {
    // @todo fetch published comic to compare against local state and only publish changes
    const {data: publishedComic} = await axios.get(`/api/comic/${comicUrlIdToUpdate}`);

    const transformedCells = Object.values(comic.cells)
      .filter(({isDirty}) => isDirty)
      .map(cell => (
        transformCell(cell, signedCells, publishedComic)
      ));

    updatePayload.cells = transformedCells;

    if (comic.initialCellUrlId !== publishedComic.initialCellUrlId) {
      updatePayload.initialCellUrlId = comic.initialCellUrlId;
    }
  }

  return updatePayload;
}