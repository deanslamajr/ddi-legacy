// oldCell = {
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
function transformCell (oldCell, signedCells) {
  const signedCell = getSignedCell(oldCell.urlId, signedCells);
  const previousCellUrlId = oldCell.previousCellUrlId
    && getSignedCell(oldCell.previousCellUrlId, signedCells).urlId;

  return {
    caption: oldCell.studioState.caption,
    urlId: signedCell.urlId,
    previousCellUrlId,
    studioState: oldCell.studioState
  }
}

function getSignedCell (cellUrlId, signedCells) {
  const signedCell = signedCells.find(({draftUrlId}) => cellUrlId === draftUrlId);
  if (!signedCell) {
    throw new Error(`Signed cell does not exist for unpublished cell ${cellUrlId}`);
  }
  return signedCell;
}

export function createUpdatePayload({comic, publishedComic, signedCells}) {
  const updatePayload = {
    cells: [],
    initialCellUrlId: null
  };

  if (!publishedComic) {
    const initialCell = getSignedCell(comic.initialCellUrlId, signedCells);
    updatePayload.initialCellUrlId = initialCell.urlId;

    const transformedCells = Object.values(comic.cells).map(cell => (
      transformCell(cell, signedCells)
    ));

    updatePayload.cells = transformedCells;
  } else {
    //TODO compare published comic to comic
  }

  return updatePayload;
}