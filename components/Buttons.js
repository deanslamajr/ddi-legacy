import styled from 'styled-components'

const MenuButton = styled.span`
  flex-grow: 1;
  max-width: 250px;
  height: 2.75rem;
  margin: 2px auto;
  cursor: pointer;
  background-color: ${props => props.theme.colors.white};
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

const PinkMenuButton = styled(MenuButton)`
  background-color: ${props => props.theme.colors.pink};
  color: ${props => props.theme.colors.black};
`

const DisabledButton = styled(PinkMenuButton)`
  cursor: not-allowed;
  pointer-events: none;
`

export {
  MenuButton,
  PinkMenuButton,
  DisabledButton
}