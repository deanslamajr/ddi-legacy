import Konva from 'konva'

import theme from './theme'
import {sortByOrder} from '.'

/**
 * EXPORTS
 ****
 ***
 **
 */

export const CELL_IMAGE_ID = 'cell-image';
export const RGBA = 'RGBA';
const filters = {
  [RGBA]: Konva.Filters.RGBA
}

export const EMOJI_MASK_REF_ID = 'EMOJI_MASK_REF_ID';

export const konvaCacheConfig = {
  offset: 30,
  pixelRatio: 1, /// fixes android graphics glitch
  //drawBorder: true /// for debugging
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
