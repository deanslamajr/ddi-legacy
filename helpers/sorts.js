function sortCellsV4 (initialCellUrlId, cells) {
  const sortedCells = [];

  if (!initialCellUrlId) {
    return sortedCells;
  }

  let nextCellUrlId = initialCellUrlId;
  let nextCell = cells.find(({urlId}) => urlId === nextCellUrlId);

  while(nextCell) {
    sortedCells.push(nextCell);
    nextCell = cells.find(({previousCellUrlId}) => previousCellUrlId === nextCellUrlId);
    nextCellUrlId = nextCell && nextCell.urlId
  }

  return sortedCells;
}

function sortByOrder ({ order: orderA }, { order: orderB }) {
  if (orderA === null && orderB === null) {
    return -1
  }
  else if (orderA === null) {
    return -1
  }
  else if (orderB === null) {
    return 1
  }
  return orderA - orderB;
}

module.exports = {
  sortByOrder,
  sortCellsV4
}