import styled from 'styled-components'

const MenuButton = styled.span`
  width: 250px;
  height: 2.75rem;
  margin: .25rem;
  cursor: pointer;
  background-color: ${props => props.theme.colors.lightGreen};
  color: ${props => props.theme.colors.black};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &:hover {
    background-color: ${props => props.theme.colors.black};
    color: ${props => props.theme.colors.white};
  }
`

const RedMenuButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.red};
  color: ${props => props.theme.colors.lightGreen};
`

const GreenMenuButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.green};
  color: ${props => props.theme.colors.lightGreen};
`

export {
  MenuButton,
  RedMenuButton,
  GreenMenuButton
}