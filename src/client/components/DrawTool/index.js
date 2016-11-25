import React from 'react';
import { throttle } from 'throttle-debounce';

export default class DrawTool extends React.Component {
  constructor(props) {
    super(props);

    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);

    this.doMoveAction = throttle(50, this.doMoveAction);

    this.state = {
      active: false,
      x: 0,
      y: 0
    };
  }

  onDown(event) {
    event.preventDefault();

    // handle the first touch event or the mouse click
    const evt = event.changedTouches && event.changedTouches[0] || event;
    
    this.setState({
      active: true,
      x: evt.pageX - this.canvas.offsetLeft,
      y: evt.pageY - this.canvas.offsetTop
    });
  }

  onUp(event) {
    event.preventDefault();

    // handle the first touch event or the mouse click
    const evt = event.changedTouches && event.changedTouches[0] || event;

    this.setState({
      active: false,
      x: evt.pageX - this.canvas.offsetLeft,
      y: evt.pageY - this.canvas.offsetTop
    })
  }

  onMove(event) {
    // needed for the throttling
    event.persist();
    
    event.preventDefault();
    this.doMoveAction(event);
  }

  doMoveAction(event) {
    // handle the first touch event or the mouse click
    const evt = event.changedTouches && event.changedTouches[0] || event;

    if (this.state.active) {
      this.setState({
        x: evt.pageX - this.canvas.offsetLeft,
        y: evt.pageY - this.canvas.offsetTop
      });
    }
  }

  componentDidMount() {
    const { width, height } = this.props;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0,0, width, height);
  }
  
  render() {
    const { width, height } = this.props;

    return (
      <div>
        <canvas 
          ref={canvas => this.canvas = canvas} 
          id='canvas' 
          width={width} 
          height={height}
          onMouseDown={this.onDown}
          onTouchStart={this.onDown}
          onMouseMove={this.onMove}
          onTouchMove={this.onMove}
          onMouseUp={this.onUp}
          onTouchEnd={this.onUp}
          />
        <div>{this.state.x}</div>
        <div>{this.state.y}</div>
      </div>
    );
  }
}

DrawTool.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};