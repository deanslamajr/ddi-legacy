import styled from 'styled-components'

const MenuButton = styled.span`
  width: 15rem;
  height: 2.75rem;
  margin: .25rem;
  cursor: pointer;
  background-color: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;

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
  color: black;
`

export {
  MenuButton,
  RedMenuButton,
  GreenMenuButton
}