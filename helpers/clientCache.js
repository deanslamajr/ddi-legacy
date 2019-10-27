import store from 'store2';
import shortid from 'shortid';
import cloneDeep from 'lodash/cloneDeep';

import {sortByOrder} from '../helpers/sorts'
import theme from '../helpers/theme'
import {getCellImageFilename} from '../helpers'

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

function generateCellUrlId () {
  let tempUrlId;
  do {
    tempUrlId = `${shortid.generate()}${DRAFT_SUFFIX}`;
  } while (doesCellUrlIdExist(tempUrlId))
  return tempUrlId;
}

function generateComicUrlId () {
  let tempUrlId;
  do {
    tempUrlId = `${shortid.generate()}${DRAFT_SUFFIX}`;
  } while (doesComicUrlIdExist(tempUrlId))
  return tempUrlId;
}

// CACHE SCHEMA
//
// const cache = {
//   cells: {
//     "someCellUrlId": {
//       hasNewImage: true,
//       urlId: 'someCellUrlId',
//       imageUrl: null,
//       comicUrlId: 'someComicUrlId',
//       previousCellUrlId: null,
//       studioState: {}
//     },
//     "anotherCellUrlId": {
//       hasNewImage: true,
//       urlId: 'anotherCellUrlId',
//       imageUrl: null,
//       comicUrlId: 'someComicUrlId',
//       previousCellUrlId: 'someCellUrlId,
//       studioState: {}
//     }
//   },
//   comics: {
//     "someComicUrlId": {
//       initialCellUrlId: 'someCellUrlId'
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
  initialCellUrlId: null,
  urlId: null
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

const getInitializedCell = ({
  comicUrlId = null,
  hasNewImage = false,
  imageUrl = null,
  isDirty = false,
  previousCellUrlId,
  studioState = getInitializedStudioState(),
  urlId = null
}) => {
  return {
    comicUrlId,
    hasNewImage,
    imageUrl,
    isDirty,
    previousCellUrlId,
    studioState,
    urlId
  };
};

const getComicsSortedCells = (cache, comicUrlId) => {
  const sortedCells = [];

  const comic = cache.comics[comicUrlId];
  if (!comic.initialCellUrlId) {
    return sortedCells;
  }

  const comicsCells = getCellsByComicUrlId(comicUrlId, cache);

  let nextCellUrlId = comic.initialCellUrlId;

  while(comicsCells[nextCellUrlId]) {
    sortedCells.push(comicsCells[nextCellUrlId]);
    const nextCell = Object.values(comicsCells).find(cell => cell.previousCellUrlId === nextCellUrlId);
    nextCellUrlId = nextCell && nextCell.urlId
  }

  return sortedCells;
}

const getLastCell = (cache, comicUrlId) => {
  const sortedCells = getComicsSortedCells(cache, comicUrlId);

  return sortedCells
    ? sortedCells[sortedCells.length - 1]
    : null;
}

export const getComicUrlIdFromCellUrlId = (cellUrlId) => {
  const cache = getCache();

  if (!cache) {
    return null;
  }

  const cell = cache.cells[cellUrlId];

  if (!cell) {
    return null;
  } else {
    return cell.comicUrlId;
  }
}

export const getCellsByComicUrlId = (comicUrlId, cache) => {
  if (!cache) {
    cache = getCache();
  }
  const cells = Object.values(cache.cells);
  const comicsCells = cells.filter(cell => cell.comicUrlId === comicUrlId);
  return comicsCells.reduce((acc, cell) => {
    acc[cell.urlId] = cell;
    return acc;
  }, {});
}

export const deleteComic = (comicUrlId) => {
  // get the latest cache
  let cache = getCache();
  if (!cache || !cache.comics) {
    return;
  }

  delete cache.comics[comicUrlId];

  const cellsAssociatedWithDeletedComic = Object.keys(getCellsByComicUrlId(comicUrlId, cache));

  // save cache
  setCache(cache);

  cellsAssociatedWithDeletedComic.forEach(cellUrlId => deleteCell(cellUrlId))
}

export const deleteCell = (cellUrlId) => {
  // get the latest cache
  let cache = getCache();
  if (!cache) {
    return;
  }

  // get the comic associated with this cellUrlId
  const comicUrlId = getComicUrlIdFromCellUrlId(cellUrlId);

  // delete this cell from the cache
  delete cache.cells[cellUrlId];

  const comicsCells = Object.values(getCellsByComicUrlId(comicUrlId, cache));

  // if the comic has no more cells associated with it, delete the comic from the cloned cache
  if (cache.comics[comicUrlId] && !comicsCells.length) {
    delete cache.comics[comicUrlId];
  } else if (cache.comics[comicUrlId] && cellUrlId === cache.comics[comicUrlId].initialCellUrlId) {
    // if the cell to delete is the initial cell, set comic.initialCell
    const secondCell = comicsCells.find(
      ({previousCellUrlId}) => previousCellUrlId === cellUrlId
    );
    cache.comics[comicUrlId].initialCellUrlId = secondCell.urlId;
  }

  // save cache
  setCache(cache);
}

export const doesCellUrlIdExist = (cellUrlId) => {
  const cache = getCache();
  if (!cache || !cache.cells) {
    return false;
  }
  return Object.keys(cache.cells).includes(cellUrlId);
}

export const doesComicUrlIdExist = (comicUrlId, cache) => {
  cache = cache || getCache();
  if (!cache || !cache.comics) {
    return false;
  }
  return Object.keys(cache.comics).includes(comicUrlId);
}

export const getComic = (comicUrlId) => {
  const cache = getCache();

  if (!cache || !cache.comics || !cache.comics[comicUrlId]) {
    return null;
  }

  return cache.comics[comicUrlId];
}

export const setCellStudioState = (cellUrlId, newStudioState, {setHasNewImage = true}) => {
  const cache = getCache();

  const cellToUpdate = cache.cells[cellUrlId];

  cellToUpdate.studioState = newStudioState;
  cellToUpdate.isDirty = true;

  if(setHasNewImage) {
    cellToUpdate.hasNewImage = true;
  }

  setCache(cache);
}

export const createNewCell = (comicUrlId, initialStudioState) => {  
  let cache = getCache();

  if (!cache) {
    cache = getInitializedCache();
  }

  // conditionally: create new comic
  if (!comicUrlId || !doesComicUrlIdExist(comicUrlId, cache)) {
    comicUrlId = generateComicUrlId();
    if (!cache.comics) {
      cache.comics = {};
    }
    cache.comics[comicUrlId] = getInitializedComic();
    cache.comics[comicUrlId].urlId = comicUrlId;
  }

  const lastCell = getLastCell(cache, comicUrlId);
  const previousCellUrlId = lastCell && lastCell.urlId;

  // create new cell
  const cellUrlId = generateCellUrlId();
  if (!cache.cells) {
    cache.cells = {};
  }
  cache.cells[cellUrlId] = getInitializedCell({
    comicUrlId,
    hasNewImage: true,
    isDirty: true,
    urlId: cellUrlId,
    studioState: initialStudioState,
    previousCellUrlId
  });

  // set new cellId as initialCellUrlId of comic
  if (!previousCellUrlId) {
    cache.comics[comicUrlId].initialCellUrlId = cellUrlId;
  }
  
  setCache(cache);

  return cellUrlId;
}

export const getStudioState = (cellUrlId) => {
  const cache = getCache();
  const cellCache = cache && cache.cells
    ? cache.cells[cellUrlId]
    : null;

  return cellCache
    ? cellCache.studioState
    : null;
}

export const clearStudioState = (cellUrlId, initialStudioState) => {
  const newStudioState = initialStudioState || getInitializedStudioState();
  setCellStudioState(cellUrlId, newStudioState);
}

export const getComics = () => {
  const cache = getCache();

  if (!cache || !cache.comics) {
    return null;
  }

  return cache.comics;
}

// comicFromApi (v4) = {
//   cells: [
//     {
//       urlId: "Q4stQsMvHu",
//       imageUrl: "Z7OV_dklyB.png",
//       caption: "",
//       order: null,
//       previousCellUrlId: null
//       schemaVersion: 4,
//       studioState: {}
//     }
//   ],
//   initialCellUrlId: "Q4stQsMvHu",
//   isActive: true,
//   title: "",
//   urlId: "knwg8fySZ",
//   userCanEdit: true
// }
export const createComicFromPublishedComic = ({
  cells: cellsToCopy, initialCellUrlId, title, urlId: comicUrlId
}) => {
  let cache = getCache();

  if (!cache) {
    cache = getInitializedCache();
  }
  if (!cache.cells) {
    cache.cells = {};
  }
  if (!cache.comics) {
    cache.comics = {};
  }

  if (cellsToCopy[0].schemaVersion >= 4) {
    // create cells
    cellsToCopy.forEach(cell => {
      cache.cells[cell.urlId] = getInitializedCell({
        comicUrlId,
        urlId: cell.urlId,
        studioState: cell.studioState,
        previousCellUrlId: cell.previousCellUrlId,
        imageUrl: cell.imageUrl
      });
    })

    const comic = getInitializedComic();
    comic.urlId = comicUrlId;
    comic.initialCellUrlId = initialCellUrlId;
    cache.comics[comicUrlId] = comic;
  } else {
    const sortedCells = cellsToCopy.sort(sortByOrder);
    // cell (v3): {
    //   caption: ""
    //   imageUrl: "iSe-T7oDa.png"
    //   order: 2
    //   previousCellId: null
    //   schemaVersion: 3
    //   studioState: {activeEmojiId: 3, backgroundColor: "#19194d", currentEmojiId: 6, showEmojiPicker: false, title: "", …}
    //   urlId: "4vR8TtVLb"
    // }

    function transformStudioStateToV4 (studioStatePreV4) {
      return {
        ...studioStatePreV4,
        caption: studioStatePreV4.title
      }
    }

    // create cells
    for (let cur = 0; cur < sortedCells.length; cur++) {
      const currentCell = sortedCells[cur];
      const previousCell = cur > 0
        ? sortedCells[cur -1]
        : null;
      
      cache.cells[currentCell.urlId] = getInitializedCell({
        comicUrlId,
        urlId: currentCell.urlId,
        studioState: transformStudioStateToV4(currentCell.studioState),
        previousCellUrlId: previousCell ? previousCell.urlId : null,
        imageUrl: currentCell.imageUrl,
        // need to create a new image to get the imageUrl to correspond to 
        // the latest schemaVersion pattern
        // e.g. schemaVersion < 3 is in a different s3 bucket and if an update bumps
        // schemaVersion to the latest, components won't know to treat imageUrl as
        // an absolute URL
        hasNewImage: true,
        isDirty: true // set as dirty so that the next publish action will update the schema
      });
    }

    const comic = getInitializedComic();
    comic.urlId = comicUrlId;
    comic.initialCellUrlId = sortedCells[0].urlId;
    cache.comics[comicUrlId] = comic;
  }

  setCache(cache);

  const comic = getComic(comicUrlId);
  const cells = getCellsByComicUrlId(comicUrlId);

  return {
    ...comic,
    cells
  };
}