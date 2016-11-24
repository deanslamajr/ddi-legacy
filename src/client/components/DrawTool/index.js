import React from 'react';

export default class DrawTool extends React.Component {
  componentDidMount() {
    this.updateCanvas();
  }

  updateCanvas() {
    const { width, height } = this.props;

    const ctx = this.refs.canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, width, height);
  }
  
  render() {
    const { width, height } = this.props;

    return (
      <canvas ref="canvas" width={width} height={height}/>
    );
  }
}

DrawTool.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};