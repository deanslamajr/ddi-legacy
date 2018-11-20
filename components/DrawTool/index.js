import React from 'react';
import cssModules from 'react-css-modules';
import { throttle } from 'throttle-debounce';

import styles from './draw-tool.css';

class DrawTool extends React.Component {
  constructor(props) {
    super(props);

    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);

    this.doMoveAction = throttle(30, this.doMoveAction);

    this.state = {
      active: false,
      x: 0,
      y: 0,
      svgObjects: [],
      current: ''
    };
  }

  onDown(event) {
    event.preventDefault();

    // handle the first touch event or the mouse click
    const evt = event.changedTouches && event.changedTouches[0] || event;

    const x = Math.round(evt.pageX - this.canvas.getBoundingClientRect().left);
    const y = Math.round(evt.pageY - this.canvas.getBoundingClientRect().top);

    let svgSnippet = `M ${x} ${y}`;
    
    this.setState({
      active: true,
      current: svgSnippet,
      x,
      y
    });
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

    const x = Math.round(evt.pageX - this.canvas.getBoundingClientRect().left);
    const y = Math.round(evt.pageY - this.canvas.getBoundingClientRect().top);

    let svgSnippet = this.state.current;
    svgSnippet += ` L ${x} ${y}`;

    if (this.state.active) {
      this.setState({
        current: svgSnippet,
        x,
        y
      });
    }
  }

  onUp(event) {
    event.preventDefault();

    // handle the first touch event or the mouse click
    const evt = event.changedTouches && event.changedTouches[0] || event;

    const x = Math.round(evt.pageX - this.canvas.getBoundingClientRect().left);
    const y = Math.round(evt.pageY - this.canvas.getBoundingClientRect().top);

    let svgSnippet = this.state.current;
    svgSnippet += ` L ${x} ${y}`;

    const svgObjects = Array.from(this.state.svgObjects);
    svgObjects.push(svgSnippet);

    this.setState({
      current: '',
      active: false,
      svgObjects,
      x,
      y
    })
  }
  
  render() {
    const { width, height } = this.props;

    return (
      <div>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          ref={canvas => this.canvas = canvas} 
          styleName='canvas-space'
          width={width} 
          height={height}
          onMouseDown={this.onDown}
          onTouchStart={this.onDown}
          onMouseMove={this.onMove}
          onTouchMove={this.onMove}
          onMouseUp={this.onUp}
          onTouchEnd={this.onUp}
          >
          <path d={this.state.current} stroke='black' strokeWidth='3' fillOpacity='0' />
          { this.state.svgObjects.map(path => (
              <path d={path} stroke='black' strokeWidth='3' fillOpacity='0' />
            ))}
        </svg>
        <div>{this.state.x}</div>
        <div>{this.state.y}</div>
        <div>{this.state.current}</div>
      </div>
    );
  }
}

DrawTool.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};

export default cssModules(DrawTool, styles);