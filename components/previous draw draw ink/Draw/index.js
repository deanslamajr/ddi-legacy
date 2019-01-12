import React from 'react';
import cssModules from 'react-css-modules';

import DrawTool from '../DrawTool';

import styles from './draw.css';

class About extends React.Component {
  render() {
    return (
      <div styleName='draw-container'>
        <DrawTool width={300} height={300} />
      </div>
    );
  }
}

export default cssModules(About, styles);