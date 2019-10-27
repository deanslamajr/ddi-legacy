import shortid from 'shortid'
import {generateCellImage as createCellImageFromKonva} from './konvaDrawingUtils'
import theme from './theme';
import {S3_ASSET_FILETYPE} from '../config/constants.json'

const CELL_IMAGE_ID = 'CELL_IMAGE_ID';

function generateFilename () {
  return `${shortid.generate()}.png`
}

export async function generateCellImageFromEmojis({
  emojis, backgroundColor, filename = generateFilename(), htmlElementId
}) {
  const blob = await createCellImageFromKonva(emojis, backgroundColor, htmlElementId);
  const file = new File([blob], filename, {
    type: S3_ASSET_FILETYPE,
  });
  const url = URL.createObjectURL(file);

  return {
    file,
    url
  }
}

export async function generateCellImage(cell, filename) {
  const cellImageElement = document.createElement('div');
  cellImageElement.hidden = true;
  const cellImageElementId = `${CELL_IMAGE_ID}-${cell.urlId}`;
  cellImageElement.id = cellImageElementId;
  document.body.appendChild(cellImageElement);

  const { file, url } = await generateCellImageFromEmojis({
    emojis: cell.studioState.emojis,
    backgroundColor: cell.studioState.backgroundColor || theme.colors.white,
    filename,
    htmlElementId: cellImageElementId
  })

  cell.imageUrl = url;

  return file
}