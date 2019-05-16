import styled, { css } from 'styled-components'

export const media = {
  desktopMin: (...args) => css`
    @media (min-width: 600px) {
      ${ css(...args) }
    }
  `,
  phoneMax: (...args) => css`
    @media (max-width: 599px) {
      ${ css(...args) }
    }
  `
}

export function shadow () {
  return css`
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16);
  `
}

export function buttonShadow () {
  return css`
    box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  `
}