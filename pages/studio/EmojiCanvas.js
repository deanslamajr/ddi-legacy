import { Component } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Text, Image } from 'react-konva';

import theme from '../../helpers/theme';

import {getEmojiConfigs} from './konvaDrawingUtils'

//
// Styled Components
//
const FixedCanvasContainer = styled.div`
  position: fixed;
  top: 0;
  z-index: 999;
`

class EmojiCanvas extends Component {
  render () {
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

              {getEmojiConfigs(Object.values(this.props.emojis)).map(config => <Text
                draggable={config['data-id'] === this.props.activeEmojiId}
                useCache
                key={`${config['data-id']}${config.emoji}`}
                ref={ref => this.props.emojiRefs[config['data-id']] = ref}
                onDragEnd={this.props.handleDragEnd}
                {...config}
              />)}
            </Layer>
          </Stage>
        </FixedCanvasContainer>

        
    )
  }
}

export default EmojiCanvas;