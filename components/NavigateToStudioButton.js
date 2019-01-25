import styled from 'styled-components'

import { Link } from '../routes'

const NavigateToStudioButton = styled.a`
  margin: 2rem;
  padding: 1rem;
  border-radius: 3px;
  text-decoration: none;
  background-color: white;
  vertical-align: middle;
  box-shadow: none;
  text-shadow: none;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: black;
    color: white;
  }
`

export default function CreateNewButton () {
  return (
    <Link href='/studio'>
      <NavigateToStudioButton>Create New</NavigateToStudioButton>
    </Link>
  )
}