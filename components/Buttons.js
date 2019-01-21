import styled from 'styled-components'

const MenuButton = styled.input`
  width: 15rem;
  height: 2.75rem;
  margin: .25rem;

  &:hover {
    background-color: black;
    color: white;
  }
`

const RedMenuButton = styled(MenuButton)`
  background-color: saddlebrown;
  color: white;
`

const GreenMenuButton = styled(MenuButton)`
  background-color: limegreen;
`

export {
  MenuButton,
  RedMenuButton,
  GreenMenuButton
}