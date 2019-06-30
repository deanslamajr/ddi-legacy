import { Component } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

import theme from '../../helpers/theme';

import {getEmojiConfigs, EMOJI_MASK_REF_ID} from '../../helpers/konvaDrawingUtils'

//
// Styled Components
//
const FixedCanvasContainer = styled.div`
  position: fixed;
  top: 0;
  z-index: 999;
`

class EmojiCanvas extends Component {
  state = {
    prevX: 0,
    prevY: 0
  }

  onDragEnd = (e) => {
    const { x, y } = e.target.attrs;
    const {prevX, prevY} = this.state;

    const xDiff = x - prevX;
    const yDiff = y - prevY;

    this.props.handleDragEnd({xDiff, yDiff});

    // we need a change to force a rerender of Group (to reset the position of draggable group)
    const groupXChange = xDiff > 0 ? .01 : -.01;
    const groupYChange = yDiff > 0 ? .01 : -.01;

    this.setState({
      prevX: this.state.prevX + groupXChange,
      prevY: this.state.prevY + groupYChange
    });
  }

  render () {
    const emojiConfigs = getEmojiConfigs(Object.values(this.props.emojis));
    const activeEmojiConfig = emojiConfigs.find(config => config['data-id'] === this.props.activeEmojiId)

    return (
        <FixedCanvasContainer>
          <Stage
            width={theme.canvas.width}
            height={theme.canvas.height}
          >
            <Layer>
              {/* Canvas */}
              <Rect
                x={0}
                y={0}
                width={theme.canvas.width}
                height={theme.canvas.height}
                fill={theme.colors.white}
              />

              {/* /**
                * @todo step 3 generating emoji items as images
                * alternatively, try this approach https://github.com/konvajs/konva/issues/101#issuecomment-149646411
              */}
              {/* {this.state.emojiImageObj && <Image
                draggable
                rotation={0}
                width={1000}
                height={1000}
                x={0}
                y={0}
                image={this.state.emojiImageObj}
              />} */}

              {emojiConfigs.map(config => <Text
                useCache
                ref={ref => this.props.emojiRefs[config['data-id']] = ref}
                key={`${config['data-id']}${config.emoji}`}
                {...config}
              />)}

              {/* Draggable layer */}
              <Group
                draggable
                onDragEnd={this.onDragEnd}
                x={this.state.prevX}
                y={this.state.prevX}
              >
                <Rect
                  width={theme.canvas.width}
                  height={theme.canvas.height}
                  x={this.state.prevX}
                  y={this.state.prevX}
                />
                <Text
                  {...activeEmojiConfig}
                  useCache
                  ref={ref => this.props.emojiRefs[EMOJI_MASK_REF_ID] = ref}
                  opacity={0.3}
                  filters={[Konva.Filters.RGBA]}
                  alpha={0.75}
                  red={255}
                  green={76}
                  blue={127}
                />
              </Group>
            </Layer>
          </Stage>
        </FixedCanvasContainer>
    )
  }
}

export default EmojiCanvas;