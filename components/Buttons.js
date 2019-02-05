import styled from 'styled-components'

const MenuButton = styled.span`
  width: 250px;
  height: 2.75rem;
  margin: .25rem;
  cursor: pointer;
  background-color: #F7FFF7;
  color: #131B23;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &:hover {
    background-color: #131B23;
    color: white;
  }
`

const RedMenuButton = styled(MenuButton)`
  background-color: #FE4A49;
  color: #F7FFF7;
`

const GreenMenuButton = styled(MenuButton)`
  background-color: #679436;
  color: #F7FFF7;
`

export {
  MenuButton,
  RedMenuButton,
  GreenMenuButton
}