import store from 'store2';
import shortid from 'shortid';
import cloneDeep from 'lodash/cloneDeep';

import theme from '../helpers/theme'

import {
  DRAFT_SUFFIX,
  STORAGEKEY_STUDIO
} from '../config/constants.json'

const getCache = () => {
  return store(STORAGEKEY_STUDIO);
}

const setCache = (newCache) => {
  store(STORAGEKEY_STUDIO, newCache);
}

function generateCellId () {
  let tempId;
  do {
    tempId = `${shortid.generate()}${DRAFT_SUFFIX}`;
  } while (doesCellIdExist(tempId))
  return tempId;
}

function generateComicId () {
  let tempId;
  do {
    tempId = `${shortid.generate()}${DRAFT_SUFFIX}`;
  } while (doesComicIdExist(tempId))
  return tempId;
}

// CACHE SCHEMA
//
// const cache = {
//   cells: {
//     "someCellId": {
//       hasNewImage: true,
//       id: 'someCellId',
//       imageUrl: null,
//       comicId: 'someComicId',
//       previousCellId: null,
//       studioState: {}
//     },
//     "anotherCellId": {
//       hasNewImage: true,
//       id: 'anotherCellId',
//       imageUrl: null,
//       comicId: 'someComicId',
//       previousCellId: 'someCellId,
//       studioState: {}
//     }
//   },
//   comics: {
//     "someComicId": {
//       initialCellId: 'someCellId'
//     }
//   }
// }
const emptyCache = {
  cells: {},
  comics: {}
};

const emptyStudioState = {
  activeEmojiId: null,
  backgroundColor: theme.colors.white,
  caption: '',
  currentEmojiId: 1,
  emojis: {}
};

const emptyComic = {
  initialCellId: null
};

const emptyCell = {
  hasNewImage: true,
  id: null,
  imageUrl: null,
  comicId: null,
  previousCellId: null,
  studioState: null
}

const getInitializedCache = () => {
  return cloneDeep(emptyCache);
}

const getInitializedStudioState = () => {
  return cloneDeep(emptyStudioState);
}

const getInitializedComic = () => {
  return cloneDeep(emptyComic);
}

const getInitializedCell = ({
  comicId, id, previousCellId, studioState = getInitializedStudioState()
}) => {
  const cell = cloneDeep(emptyCell);

  cell.id = id;
  cell.comicId = comicId;
  cell.previousCellId = previousCellId;
  cell.studioState = studioState;
  return cell;
}

export const getComicIdFromCellId = (cellId) => {
  const cache = getCache();

  if (!cache) {
    return null;
  }

  const cell = cache.cells[cellId];

  if (!cell) {
    return null;
  } else {
    return cell.comicId;
  }
}

export const getCellsByComicId = (comicId, cache) => {
  if (!cache) {
    cache = getCache();
  }
  const cells = Object.values(cache.cells);
  const comicsCells = cells.filter(cell => cell.comicId === comicId);
  return comicsCells.reduce((acc, cell) => {
    acc[cell.id] = cell;
    return acc;
  }, {});
}

export const getCellById = (cellId) => {
  const cache = getCache();
  const cells = Object.values(cache.cells);
  return cells[cellId] || null;
}

export const deleteCell = (cellId) => {
  // get the latest cache
  let cache = getCache();
  if (!cache) {
    return;
  }

  // get the comic associated with this cellId
  const comicId = getComicIdFromCellId(cellId);

  // delete this cell from the cache
  delete cache.cells[cellId];

  const comicsCells = Object.values(getCellsByComicId(comicId, cache));

  // if the comic has no more cells associated with it, delete the comic from the cloned cache
  if (cache.comics[comicId] && !comicsCells.length) {
    delete cache.comics[comicId];
  } else if (cellId === cache.comics[comicId].initialCellId) {
    // if the cell to delete is the initial cell, set comic.initialCell
    const secondCell = comicsCells.find(({previousCellId}) => previousCellId === cellId);
    cache.comics[comicId].initialCellId = secondCell.id;
  }

  // save cache
  setCache(cache);
}

export const doesCellIdExist = (cellId) => {
  const cache = getCache();
  if (!cache || !cache.cells) {
    return false;
  }
  return Object.keys(cache.cells).includes(cellId);
}

export const doesComicIdExist = (comicId, cache) => {
  cache = cache || getCache();
  if (!cache || !cache.comics) {
    return false;
  }
  return Object.keys(cache.comics).includes(comicId);
}

export const getComic = (comicId) => {
  const cache = getCache();

  if (!cache || !cache.comics || !cache.comics[comicId]) {
    return null;
  }

  return cache.comics[comicId];
}

export const setCellStudioState = (cellId, newStudioState) => {
  const cache = getCache();

  cache.cells[cellId].studioState = newStudioState;

  setCache(cache);
}

const getComicsSortedCells = (cache, comicId) => {
  const sortedCells = [];

  const comic = cache.comics[comicId];
  if (!comic.initialCellId) {
    return sortedCells;
  }

  const comicsCells = getCellsByComicId(comicId, cache);

  let nextCellId = comic.initialCellId;

  while(comicsCells[nextCellId]) {
    sortedCells.push(comicsCells[nextCellId]);
    const nextCell = Object.values(comicsCells).find(cell => cell.previousCellId === nextCellId);
    nextCellId = nextCell && nextCell.id
  }

  return sortedCells;
}

const getLastCell = (cache, comicId) => {
  const sortedCells = getComicsSortedCells(cache, comicId);

  return sortedCells
    ? sortedCells[sortedCells.length - 1]
    : null;
}

export const createNewCell = (comicId, initialStudioState) => {  
  let cache = getCache();

  if (!cache) {
    cache = getInitializedCache();
  }

  // conditionally: create new comic
  if (!comicId || !doesComicIdExist(comicId, cache)) {
    comicId = generateComicId();
    if (!cache.comics) {
      cache.comics = {};
    }
    cache.comics[comicId] = getInitializedComic();
  }

  const lastCell = getLastCell(cache, comicId);
  const previousCellId = lastCell && lastCell.id;

  // create new cell
  const cellId = generateCellId();
  if (!cache.cells) {
    cache.cells = {};
  }
  cache.cells[cellId] = getInitializedCell({
    comicId,
    id: cellId,
    studioState: initialStudioState,
    previousCellId
  });

  // set new cellId as initialCellId of comic
  if (!previousCellId) {
    cache.comics[comicId].initialCellId = cellId;
  }
  
  setCache(cache);

  return cellId;
}

export const getStudioState = (cellId) => {
  const cache = getCache();
  const cellCache = cache
    ? cache.cells[cellId]
    : null;

  return cellCache
    ? cellCache.studioState
    : null;
}

export const clearStudioState = (cellId, initialStudioState) => {
  const newStudioState = initialStudioState || getInitializedStudioState();
  setCellStudioState(cellId, newStudioState);
}