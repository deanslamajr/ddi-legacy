import shortid from 'shortid'
import {generateCellImage} from './konvaDrawingUtils'
import {S3_ASSET_FILETYPE} from '../config/constants.json'

function generateFilename () {
  return `${shortid.generate()}.png`
}

export async function generateCellImageFromEmojis({ emojis, backgroundColor, htmlElementId }) {
  const blob = await generateCellImage(emojis, backgroundColor, htmlElementId);
  const file = new File([blob], generateFilename(), {
    type: S3_ASSET_FILETYPE,
  });
  const url = URL.createObjectURL(file);

  return {
    file,
    url
  }
}