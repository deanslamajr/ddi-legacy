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
//
//     },
//     "anotherCellId": {
//
//     }
//   },
//   comics: {
//     "someComicId": {
//       cells: []
//     },
//     "anotherComicId": {
//       cells: []
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
  cells: []
};

const getInitializedCache = () => {
  return cloneDeep(emptyCache);
}

const getInitializedStudioState = () => {
  return cloneDeep(emptyStudioState);
}

const getInitializedComic = () => {
  return cloneDeep(emptyComic);
}

// note: does not delete cell
const removeCellFromComic = (cache, cellId, comicId) => {
  if (!cache.comics[comicId]) {
    return;
  }
  const cellReferences = cache.comics[comicId].cells;

  const indexOfRef = cellReferences.findIndex(id => id === cellId)

  if (indexOfRef !== -1) {
    cellReferences.splice(indexOfRef, 1);
  }
}

export const getComicIdFromCellId = (cellId) => {
  const cache = getCache();

  if (!cache) {
    return null;
  }

  const [comicId] = Object.entries(cache.comics)
    .find(([comicId, comic]) => comic.cells.includes(cellId));

  return comicId;
}

export const deleteCell = (cellId) => {
  // get the latest cache
  let cache = getCache();
  if (!cache) {
    cache = getInitializedCache();
  }

  // get the comic associated with this cellId
  const comicId = getComicIdFromCellId(cellId);

  // delete this cell from the cloned cache
  if (comicId) {
    delete cache.cells[cellId];
  }

  // delete this cell from the comic
  removeCellFromComic(cache, cellId, comicId);

  // if the comic has no more cells associated with it, delete the comic from the cloned cache
  // save cache
  if (cache.comics[comicId] && !cache.comics[comicId].cells.length) {
    delete cache.comics[comicId];
  }

  setCache(cache);
}

export const doesCellIdExist = (cellId) => {
  const cache = getCache();
  if (!cache || !cache.cells) {
    return false;
  }
  return Object.keys(cache.cells).includes(cellId);
}

export const doesComicIdExist = (comicId) => {
  const cache = getCache();
  if (!cache || !cache.comics) {
    return false;
  }
  return Object.keys(cache.comics).includes(comicId);
}

export const setCellStudioState = (cellId, newStudioState) => {
  const cache = getCache();

  cache.cells[cellId] = newStudioState;

  setCache(cache);
}

export const createNewCell = (comicId, initialStudioState) => {  
  let cache = getCache();

  if (!cache) {
    cache = getInitializedCache();
  }

  // create new cell
  const cellId = generateCellId();
  if (!cache.cells) {
    cache.cells = {};
  }
  cache.cells[cellId] = initialStudioState || getInitializedStudioState();

  // create new comic
  if (!comicId && !doesComicIdExist(comicId)) {
    comicId = generateComicId();
    if (!cache.comics) {
      cache.comics = {};
    }
    cache.comics[comicId] = getInitializedComic();
  }

  // add new cellId to comic
  cache.comics[comicId].cells.push(cellId);
  
  setCache(cache);

  return cellId;
}

export const getStudioState = (cellId) => {
  const cache = getCache();
  return cache
    ? cache.cells[cellId]
    : null;
}

export const clearStudioState = (cellId, initialStudioState) => {
  const newStudioState = initialStudioState || getInitializedStudioState();
  setCellStudioState(cellId, newStudioState);
}