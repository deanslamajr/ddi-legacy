const { sortByOrder, sortCellsV4 } = require('../../../helpers/sorts')

function transformCellsFromDB(cell, cells) {
  const previousCell = cells.find(({ id }) => id === cell.previous_cell_id)
  return {
    caption: cell.caption,
    imageUrl: cell.image_url,
    order: cell.order,
    previousCellUrlId: previousCell && previousCell.url_id,
    schemaVersion: cell.schema_version,
    urlId: cell.url_id,
  }
}

function transformComicFromDB(comic) {
  let sortedCells

  const cleanedCells = comic.cells.map((cell) =>
    transformCellsFromDB(cell, comic.cells)
  )

  if (cleanedCells.length && cleanedCells[0].schemaVersion >= 4) {
    const initialCell = comic.cells.find(
      ({ id }) => id === comic.initial_cell_id
    )

    if (!initialCell) {
      const newrelic = require('newrelic')
      newrelic.noticeError(new Error('InitialCell does not seem to exist!'), {
        comicCells: JSON.stringify(comic.cells),
        cleanedCells: JSON.stringify(cleanedCells),
        initialCellId: comic.initial_cell_id || 'value-was-falsey!',
      })
      sortedCells = cleanedCells.sort(sortByOrder)
    } else {
      sortedCells = sortCellsV4(initialCell.url_id, cleanedCells)
    }
  } else {
    sortedCells = cleanedCells.sort(sortByOrder)
  }

  return {
    cellsCount: sortedCells.length,
    initialCell: sortedCells.length ? sortedCells[0] : null,
    updatedAt: comic.updated_at,
    urlId: comic.url_id,
  }
}

module.exports = {
  transformComicFromDB,
}
