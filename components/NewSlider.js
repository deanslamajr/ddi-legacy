import React from 'react'
import styled from 'styled-components'

const SlideContainer = styled.div`
  width: 100%;
`

const Slider = styled.input`
  appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;   
  background: ${props => props.theme.colors.gray3};
  opacity: 0.7;
  transition: opacity .2s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  user-select: none;
  margin: 0;
  border: none;

  &:focus{
    outline: none;
  }

  &:hover {
    opacity: 1; /* Fully shown on mouse-over */
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 30px;
    height: 30px;
    border-radius: 50%; 
    background: ${props => props.theme.colors.white};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: ${props => props.theme.colors.white};
    cursor: pointer;
  }
`

class NewSlider extends React.Component {
  onChange = (e) => {
    const newValue = e && e.target && e.target.value

    if (newValue) {
      const newNumber = parseFloat(newValue)
      this.props.onChange(newNumber)
    }
  }

  render () {
    return (<SlideContainer>
      <Slider
        type='range'
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
        value={this.props.value}
        onChange={this.onChange}
      />
    </SlideContainer>)
  }
}

export default NewSlider