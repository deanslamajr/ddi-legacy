import axios from 'axios';

import { isDraftId } from '../../../shared/isDraftId';

import {SCHEMA_VERSION} from '../../../config/constants.json';

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

  const caption = getCaption(cellFromState, publishedComic);
  if (typeof caption === 'string') {
    transformedCell.caption = caption;
  }

  const urlId = getUrlId(cellFromState, signedCells);
  if (urlId) {
    transformedCell.urlId = urlId;
  }

  if (!isDraftId(cellFromState.urlId)) {
    const publishedCell = getPublishedCell(cellFromState.urlId, publishedComic.cells)

    // for schemaVersion < 4
    // set order to null
    if (publishedCell.schemaVersion < 4) {
      transformedCell.order = null;
    }

    // set schemaVersion to current schemaVersion
    if (publishedCell.schemaVersion !== SCHEMA_VERSION) {
      transformedCell.schemaVersion = SCHEMA_VERSION;
    }
  }

  const previousCellUrlId = getPreviousCellUrlId(cellFromState, signedCells, publishedComic);
  if (previousCellUrlId === null || previousCellUrlId) {
    transformedCell.previousCellUrlId = previousCellUrlId;
  }

  const studioState = getStudioState(cellFromState, publishedComic);
  if (studioState) {
    transformedCell.studioState = studioState;
  }

  // update the image of a published cell
  if (cellFromState.hasNewImage && !isDraftId(cellFromState.urlId)) {
    transformedCell.updateImageUrl = true;
  }

  return transformedCell
}

function getStudioState (cellFromState, publishedComic) {
  const studioState = cellFromState.studioState;

  if (isDraftId(cellFromState.urlId)) {
    return studioState;
  }

  const publishedStudioState = getPublishedCell(cellFromState.urlId, publishedComic.cells).studioState;

  if (JSON.stringify(studioState) === JSON.stringify(publishedStudioState)) {
    return;
  }

  return studioState;
}

function getPreviousCellUrlId (cellFromState, signedCells, publishedComic) {
  if (isDraftId(cellFromState.urlId) && cellFromState.previousCellUrlId === null) {
    return null;
  } else if (isDraftId(cellFromState.previousCellUrlId)) {
    return getSignedCell(cellFromState.previousCellUrlId, signedCells).urlId;
  } else {
    const previousCellUrlId = cellFromState.previousCellUrlId;

    // for published cell updates
    // don't include this field if update value is same as published value
    if (!isDraftId(cellFromState.urlId)) {
      const publishedPreviousCellUrlId = getPublishedCell(cellFromState.urlId, publishedComic.cells).previousCellUrlId;
  
      if (previousCellUrlId === publishedPreviousCellUrlId) {
        return;
      }
    }

    return previousCellUrlId;
  }
}

function getCaption (cellFromState, publishedComic) {
  const caption = cellFromState.studioState.caption;

  if (isDraftId(cellFromState.urlId)) {
    return caption;
  }

  const publishedCaption = getPublishedCell(cellFromState.urlId, publishedComic.cells).studioState.caption;

  if (caption === publishedCaption) {
    return;
  }

  return caption;
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