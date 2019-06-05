import Konva from 'konva'

import theme from '../../helpers/theme'
import { getApi, sortByOrder } from '../../helpers'

function getLinesOfCaptionText (title) {
  if (title === '') {
    return 0;
  }
  const captionConfig = getCaptionConfig(title);
  const captionKonva = new Konva.Text(captionConfig);
  return captionKonva.textArr.length;
}

/**
 * EXPORTS
 ****
 ***
 **
 */

export const CELL_IMAGE_WITH_CAPTION_ID = 'cell-with-caption-image';
export const CELL_IMAGE_ID = 'cell-image';
export const RGBA = 'RGBA';
const filters = {
  [RGBA]: Konva.Filters.RGBA
}

export const konvaCacheConfig = {
  offset: 30,
  pixelRatio: 1, /// fixes android graphics glitch
  //drawBorder: true /// for debugging
}

export function getCaptionConfig (title) {
  return {
    x: theme.finalImage.padding,
    y: theme.finalImage.height + theme.finalImage.padding,
    width: theme.finalImage.width - (2 * theme.finalImage.padding),
    text: title,
    fontSize: theme.finalImage.fontSize,
    fill: theme.colors.black,
    fontFamily: 'Calibri'
  }
}

export function generateCellImageWithCaption(cellImageObj, title) {
  const linesOfCaptionText = getLinesOfCaptionText(title);
  const captionHeight = linesOfCaptionText
    ? theme.finalImage.lineHeight * linesOfCaptionText + (2 * theme.finalImage.padding)
    : 0;

  const stageHeight = theme.finalImage.height + captionHeight;
  const stageWidth = theme.finalImage.width;

  const stage = new Konva.Stage({
    container: CELL_IMAGE_WITH_CAPTION_ID,
    width: stageWidth,
    height: stageHeight
  });

  const layer = new Konva.Layer();
  // add the layer to the stage
  stage.add(layer);

  const cellImage = new Konva.Image({
    scale: {x:2, y:2},
    x: 0,
    y: 0,
    image: cellImageObj
  });
      
  layer.add(cellImage);

  // Add caption background
  if (linesOfCaptionText) {
    const captionBackground = new Konva.Rect({
      x: 0,
      y: theme.finalImage.height,
      width: theme.finalImage.width,
      height: captionHeight,
      fill: theme.colors.white
    });
    layer.add(captionBackground);
  
    {/* Caption text */}
    const captionText = new Konva.Text({...getCaptionConfig(title)});
    layer.add(captionText);
  }

  return new Promise((resolve, reject) => {
    try {
      stage.toCanvas().toBlob((blob) => resolve(blob));
    }
    catch(err) {
      // @todo log error
      console.error(err);
      reject();
    }
  });
}

export function getEmojiConfigs (emojis) {
  return emojis.sort(sortByOrder).map(emoji => ({
    'data-id': emoji.id,
    filters: emoji.filters && emoji.filters.map(filter => filters[filter]),
    x: emoji.x,
    y: emoji.y,
    scaleX: emoji.scaleX,
    scaleY: emoji.scaleY,
    text: emoji.emoji,
    fontSize: emoji.size,
    rotation: emoji.rotation,
    alpha: emoji.alpha,
    red: emoji.red,
    green: emoji.green,
    blue: emoji.blue,
    opacity: typeof emoji.opacity !== 'undefined' ? emoji.opacity : 1, /* backwards compatibility */
    useCache: true
  }));
}

export function generateCellImage (emojis) {
  const stageHeight = theme.canvas.height;
  const stageWidth = theme.canvas.width;

  const stage = new Konva.Stage({
    container: CELL_IMAGE_ID,
    width: stageWidth,
    height: stageHeight
  });

  const layer = new Konva.Layer();
  // add the layer to the stage
  stage.add(layer);
  
  // Add Canvas
  const canvas = new Konva.Rect({
    x: 0,
    y: 0,
    width: theme.canvas.width,
    height: theme.canvas.height,
    fill: theme.colors.white
  });
  layer.add(canvas);

  // Add emojis
  getEmojiConfigs(Object.values(emojis)).forEach(config => {
    const emoji = new Konva.Text({...config});
    emoji.cache(konvaCacheConfig)
    layer.add(emoji);
  });

  return new Promise((resolve, reject) => {
    try {
      stage.toCanvas().toBlob((blob) => resolve(blob));
    }
    catch(err) {
      // @todo log error
      console.error(err);
      reject();
    }
  });
}

/**
 * @todo step 1 generating emoji items as images
 */
// async function getEmojiImageAsUrl () {  
//   const emojiText = new Konva.Text({
//     text: '🤖',
//     text: '👩‍🏫',
//     fontSize: 100
//   });
//   emojiText.lineHeight(1.1)

//   console.log('emojiText.width()',emojiText.width())
//   console.log('emojiText.height()',emojiText.height())

//   const stage = new Konva.Stage({
//     container: EMOJI_IMAGE_ID,
//     // @TODO round these to integers
//     width: emojiText.width(),
//     height: emojiText.height()
//   });

//   const layer = new Konva.Layer();
//   // add the layer to the stage
//   stage.add(layer);
//   layer.add(emojiText);

//   const blob = await new Promise((resolve, reject) => {
//     try {
//       stage.toCanvas().toBlob((blob) => resolve(blob));
//     }
//     catch(err) {
//       // @todo log error
//       console.error(err);
//       reject();
//     }
//   });

//   const file = new File([blob], generateFilename(), {
//     type: S3_ASSET_FILETYPE,
//   });
  
//   return {
//     url: URL.createObjectURL(file),
//     file
//   };
// }