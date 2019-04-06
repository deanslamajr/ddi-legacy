import styled from 'styled-components'

const MenuButton = styled.span`
  flex-grow: 1;
  max-width: 250px;
  height: 2.75rem;
  margin: 1px auto;
  cursor: pointer;
  background-color: ${props => props.theme.colors.lightGreen};
  color: ${props => props.theme.colors.black};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  user-select: none;

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

const BlueMenuButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.blue};
  color: ${props => props.theme.colors.black};
`

export {
  MenuButton,
  BlueMenuButton,
  RedMenuButton,
  GreenMenuButton
}