import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ResizeObserver from 'resize-observer-polyfill'
import styled from 'styled-components'

/**
 * Capitalize first letter of string
 * @private
 * @param  {string} - String
 * @return {string} - String with first letter capitalized
 */
function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.substr(1)
}

/**
 * Clamp position between a range
 * @param  {number} - Value to be clamped
 * @param  {number} - Minimum value in range
 * @param  {number} - Maximum value in range
 * @return {number} - Clamped value
 */
function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const ifVertical = (props, ifValue = 'inherit', elseValue = 'inherit') => props.orientation === 'vertical' ? ifValue : elseValue

/**
 * Styled components
 */

const LabelItem = styled.li`
  position: ${props => ifVertical(props, 'absolute')};
  transform: ${props => ifVertical(props, 'translate3d(0, -50%, 0)', 'translate3d(-50%, 0, 0)')};
  font-size: 14px;
  cursor: pointer;
  display: inline-block;
  top: 10px;
  user-select: none;

  &::before {
    content: ${props => ifVertical(props, '')};
    width: ${props => ifVertical(props, '10px')};
    height: ${props => ifVertical(props, '2px')};
    background: ${props => ifVertical(props, 'black')};
    position: ${props => ifVertical(props, 'absolute')};
    left: ${props => ifVertical(props, '-14px')};
    top: ${props => ifVertical(props, '50%')};
    transform: ${props => ifVertical(props, 'translateY(-50%)')};
    z-index: ${props => ifVertical(props, '-1')};
  }
`

const RangeSlider = styled.div`
  display: block;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  margin: 20px 0;
  position: relative;
  background: #e6e6e6;
  -ms-touch-action: none;
  touch-action: none;
  user-select: none;

  height: ${props => ifVertical(props, '150px', '12px')};
  border-radius: ${props => ifVertical(props, undefined, '10px')};

  margin: ${props => ifVertical(props, '20px auto')};
  max-width: ${props => ifVertical(props, '10px')};
  background-color: ${props => ifVertical(props, 'transparent')};
`

const Fill = styled.div`
  position: ${props => ifVertical(props, 'absolute')};
  display: block;
  box-shadow: ${props => ifVertical(props, 'none', 'inset 0 1px 3px rgba(0, 0, 0, 0.4)')};
  background-color: ${props => props.theme.colors.backgroundGreen};
  filter: brightness(0.95);
  width: ${props => ifVertical(props, '100%')};
  bottom: ${props => ifVertical(props, (props.isReverse ? 'inherit' : '0'))};
  height: ${props => ifVertical(props, undefined, '100%')};
  border-radius: ${props => ifVertical(props, undefined, '10px')};
  top: ${props => ifVertical(props, (props.isReverse && '0'), '0')};

  right: ${props => props.isReverse ? ifVertical(props, undefined, '0') : 'inherit'};
  user-select: none;
`

const Handle = styled.div`
  background: ${props => props.theme.colors.white};
  /* border: 1px solid ${props => props.theme.colors.white}; */
  cursor: pointer;
  display: inline-block;
  position: absolute;

  opacity: ${props => props.isActive ? '1' : 'inherit'};

  width: 30px;
  height: ${props => ifVertical(props, '10px', '30px')};
  left: ${props => ifVertical(props, '-10px')};
  box-shadow: ${props => ifVertical(props, 'none', 'rgba(0, 0, 0, 0.15) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px')};

  border-radius: ${props => ifVertical(props, undefined, '30px')};
  top: ${props => ifVertical(props, undefined, '50%')};
  transform: ${props => ifVertical(props, undefined, 'translate3d(-50%, -50%, 0)')};
  padding: 0.3rem; /* I added this ?*/
  user-select: none;

  &:hover {
    /* background: ${props => props.color || props.theme.colors.green}; */
    filter: brightness(0.95);
  }

  &:active {
    filter: brightness(0.85);
  }

  &:focus{
    outline: none;
  }
`

const Tooltip = styled.div`
  width: 40px;
  height: 40px;
  text-align: center;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  font-weight: normal;
  font-size: 14px;
  transition: all 100ms ease-in;
  border-radius: 4px;
  display: inline-block;
  color: white;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  span {
    margin-top: 12px;
    display: inline-block;
    line-height: 100%;
  }
  &:after {
    content: ' ';
    position: absolute;
    width: 0;
    height: 0;
  }

  top: ${props => ifVertical(props, '50%', '-55px')};
  left: ${props => ifVertical(props, '-100%')};
  transform: ${props => ifVertical(props, 'translate3d(-50%, -50%, 0)')};

  &:after {
    border-top: 8px solid transparent;
    border-bottom: ${props => ifVertical(props, '8px solid transparent')};
    border-left: ${props => ifVertical(props, '8px solid rgba(0, 0, 0, 0.8)', '8px solid transparent')};
    left: ${props => ifVertical(props, '100%', '50%')};
    top: ${props => ifVertical(props, '12px')};

    border-right: ${props => ifVertical(props, undefined, '8px solid transparent')};
    bottom: ${props => ifVertical(props, undefined, '-8px')};
    transform: ${props => ifVertical(props, undefined, 'translate3d(-50%, 0, 0)')};
  }
`

const Labels = styled.ul`
  position: relative;
  
  list-style-type: ${props => ifVertical(props, 'none')};
  margin: ${props => ifVertical(props, '0 0 0 24px')};
  padding: ${props => ifVertical(props, '0')};
  text-align: ${props => ifVertical(props, 'left')};
  width: ${props => ifVertical(props, '250px')};
  height: ${props => ifVertical(props, '100%')};
  left: ${props => ifVertical(props, '10px')};
`

/**
 * Predefined constants
 * @type {Object}
 */
const constants = {
  orientation: {
    horizontal: {
      dimension: 'width',
      direction: 'left',
      reverseDirection: 'right',
      coordinate: 'x'
    },
    vertical: {
      dimension: 'height',
      direction: 'top',
      reverseDirection: 'bottom',
      coordinate: 'y'
    }
  }
}

class Slider extends Component {
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    value: PropTypes.number,
    orientation: PropTypes.string,
    tooltip: PropTypes.bool,
    reverse: PropTypes.bool,
    labels: PropTypes.object,
    handleLabel: PropTypes.string,
    format: PropTypes.func,
    onChangeStart: PropTypes.func,
    onChange: PropTypes.func,
    onChangeComplete: PropTypes.func
  }

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    value: 0,
    orientation: 'horizontal',
    tooltip: true,
    reverse: false,
    labels: {},
    handleLabel: ''
  }

  constructor (props, context) {
    super(props, context)

    this.state = {
      active: false,
      limit: 0,
      grab: 0
    }
  }

  componentDidMount () {
    this.handleUpdate()
    const resizeObserver = new ResizeObserver(this.handleUpdate)
    resizeObserver.observe(this.slider)
  }

  /**
   * Format label/tooltip value
   * @param  {Number} - value
   * @return {Formatted Number}
   */
  handleFormat = value => {
    const { format } = this.props
    return format ? format(value) : value
  }

  /**
   * Update slider state on change
   * @return {void}
   */
  handleUpdate = () => {
    if (!this.slider) {
      // for shallow rendering
      return
    }
    const { orientation } = this.props
    const dimension = capitalize(constants.orientation[orientation].dimension)
    const sliderPos = this.slider[`offset${dimension}`]
    const handlePos = this.handle[`offset${dimension}`]

    this.setState({
      limit: sliderPos - handlePos,
      grab: handlePos / 2
    })
  }

  /**
   * Attach event listeners to mousemove/mouseup events
   * @return {void}
   */
  handleStart = e => {
    const { onChangeStart } = this.props
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup', this.handleEnd)
    this.setState(
      {
        active: true
      },
      () => {
        onChangeStart && onChangeStart(e)
      }
    )
  }

  /**
   * Handle drag/mousemove event
   * @param  {Object} e - Event object
   * @return {void}
   */
  handleDrag = e => {
    e.stopPropagation()
    const { onChange } = this.props
    const { target: { className, classList, dataset } } = e
    
    // @todo figure out what this does and reimplement
    if (!onChange || className === 'rangeslider__labels') return

    let value = this.position(e)

    // @todo figure out what this does and reimplement
    if (
      classList &&
      classList.contains('rangeslider__label-item') &&
      dataset.value
    ) {
      value = parseFloat(dataset.value)
    }

    onChange && onChange(value, e)
  };

  /**
   * Detach event listeners to mousemove/mouseup events
   * @return {void}
   */
  handleEnd = e => {
    const { onChangeComplete } = this.props
    this.setState(
      {
        active: false
      },
      () => {
        onChangeComplete && onChangeComplete(e)
      }
    )
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.handleEnd)
  };

  /**
   * Support for key events on the slider handle
   * @param  {Object} e - Event object
   * @return {void}
   */
  handleKeyDown = e => {
    e.preventDefault()
    const { keyCode } = e
    const { value, min, max, step, onChange } = this.props
    let sliderValue

    switch (keyCode) {
      case 38:
      case 39:
        sliderValue = value + step > max ? max : value + step
        onChange && onChange(sliderValue, e)
        break
      case 37:
      case 40:
        sliderValue = value - step < min ? min : value - step
        onChange && onChange(sliderValue, e)
        break
    }
  };

  /**
   * Calculate position of slider based on its value
   * @param  {number} value - Current value of slider
   * @return {position} pos - Calculated position of slider based on value
   */
  getPositionFromValue = value => {
    const { limit } = this.state
    const { min, max } = this.props
    const diffMaxMin = max - min
    const diffValMin = value - min
    const percentage = diffValMin / diffMaxMin
    const pos = Math.round(percentage * limit)

    return pos
  };

  /**
   * Translate position of slider to slider value
   * @param  {number} pos - Current position/coordinates of slider
   * @return {number} value - Slider value
   */
  getValueFromPosition = pos => {
    const { limit } = this.state
    const { orientation, min, max, step } = this.props
    const percentage = clamp(pos, 0, limit) / (limit || 1)
    const baseVal = step * Math.round(percentage * (max - min) / step)
    const value = orientation === 'horizontal' ? baseVal + min : max - baseVal

    return clamp(value, min, max)
  };

  /**
   * Calculate position of slider based on value
   * @param  {Object} e - Event object
   * @return {number} value - Slider value
   */
  position = e => {
    const { grab } = this.state
    const { orientation, reverse } = this.props

    const node = this.slider
    const coordinateStyle = constants.orientation[orientation].coordinate
    const directionStyle = reverse
      ? constants.orientation[orientation].reverseDirection
      : constants.orientation[orientation].direction
    const clientCoordinateStyle = `client${capitalize(coordinateStyle)}`
    const coordinate = !e.touches
      ? e[clientCoordinateStyle]
      : e.touches[0][clientCoordinateStyle]
    const direction = node.getBoundingClientRect()[directionStyle]
    const pos = reverse
      ? direction - coordinate - grab
      : coordinate - direction - grab
    const value = this.getValueFromPosition(pos)

    return value
  };

  /**
   * Grab coordinates of slider
   * @param  {Object} pos - Position object
   * @return {Object} - Slider fill/handle coordinates
   */
  coordinates = pos => {
    const { limit, grab } = this.state
    const { orientation } = this.props
    const value = this.getValueFromPosition(pos)
    const position = this.getPositionFromValue(value)
    const handlePos = orientation === 'horizontal' ? position + grab : position
    const fillPos = orientation === 'horizontal'
      ? handlePos
      : limit - handlePos

    return {
      fill: fillPos,
      handle: handlePos,
      label: handlePos
    }
  };

  renderLabels = (labels, orientation) => {
    return (<Labels
      ref={sl => {
        this.labels = sl
      }}
      orientation={orientation}
      // className={cx('rangeslider__labels')}
    >
      {labels}
    </Labels>)
  };

  render () {
    const {
      value,
      orientation,
      className,
      color,
      tooltip,
      reverse,
      labels,
      min,
      max,
      handleLabel
    } = this.props
    const { active } = this.state
    const dimension = constants.orientation[orientation].dimension
    const direction = reverse
      ? constants.orientation[orientation].reverseDirection
      : constants.orientation[orientation].direction
    const position = this.getPositionFromValue(value)
    const coords = this.coordinates(position)
    const fillStyle = { [dimension]: `${coords.fill}px` }
    const handleStyle = { [direction]: `${coords.handle}px` }
    let showTooltip = tooltip && active

    let labelItems = []
    let labelKeys = Object.keys(labels)

    if (labelKeys.length > 0) {
      labelKeys = labelKeys.sort((a, b) => (reverse ? a - b : b - a))

      for (let key of labelKeys) {
        const labelPosition = this.getPositionFromValue(key)
        const labelCoords = this.coordinates(labelPosition)
        const labelStyle = { [direction]: `${labelCoords.label}px` }

        labelItems.push(
          <LabelItem
            key={key}
            // className={cx('rangeslider__label-item')}
            data-value={key}
            onMouseDown={this.handleDrag}
            onTouchStart={this.handleStart}
            onTouchEnd={this.handleEnd}
            style={labelStyle}
            orientation={orientation}
          >
            {this.props.labels[key]}
          </LabelItem>
        )
      }
    }

    return (
      <RangeSlider
        ref={s => {
          this.slider = s
        }}
        className={//cx(
          // 'rangeslider',
          // `rangeslider-${orientation}`,
          // @todo implement reverse
          // { 'rangeslider-reverse': reverse },
          className
        /*)*/}
        onMouseDown={this.handleDrag}
        onMouseUp={this.handleEnd}
        onTouchStart={this.handleStart}
        onTouchEnd={this.handleEnd}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation={orientation}
        orientation={orientation}      
      >
        <Fill
          // className='rangeslider__fill'
          style={fillStyle}
          orientation={orientation}
          isReverse={reverse}
          color={color}
        />
        <Handle
          ref={sh => {
            this.handle = sh
          }}
          // className='rangeslider__handle'
          onMouseDown={this.handleStart}
          onTouchMove={this.handleDrag}
          onTouchEnd={this.handleEnd}
          onKeyDown={this.handleKeyDown}
          style={handleStyle}
          tabIndex={0}
          isActive={active}
          orientation={orientation}
          color={color}
        />
        {/* {labels ? this.renderLabels(labelItems, orientation) : null} */}
      </RangeSlider>
    )
  }
}

export default Slider