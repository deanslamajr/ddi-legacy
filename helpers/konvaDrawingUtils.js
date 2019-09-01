import Konva from 'konva'

import theme from './theme'
import {sortByOrder} from '.'

/**
 * EXPORTS
 ****
 ***
 **
 */

export const RGBA = 'RGBA';
const filters = {
  [RGBA]: Konva.Filters.RGBA
}

export const EMOJI_MASK_REF_ID = 'EMOJI_MASK_REF_ID';
export const EMOJI_MASK_OUTLINE_REF_ID = 'EMOJI_MASK_OUTLINE_REF_ID';

export const konvaCacheConfig = {
  offset: 30,
  pixelRatio: 1, /// fixes android graphics glitch
  //drawBorder: true /// set 'true' for debugging image drawing
}

export function createNewEmojiComponentState (emoji, currentEmojiId) {
  return {
    emoji,
    id: currentEmojiId,
    order: currentEmojiId,
    filters: undefined,
    selectedEmoji: undefined,
    x: 100,
    y: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    size: 100,
    alpha: .5,
    red: 125,
    green: 0,
    blue: 0,
    opacity: 1
  }
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

export function generateCellImage (emojis, backgroundColor, htmlElementId) {
  const stageHeight = theme.canvas.height;
  const stageWidth = theme.canvas.width;

  const stage = new Konva.Stage({
    container: htmlElementId,
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
    fill: backgroundColor
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
