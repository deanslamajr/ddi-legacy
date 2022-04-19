import axios from 'axios'
import { Component } from 'react'
import styled from 'styled-components'

import { Router } from '../routes'
import { media } from '../helpers/style-utils'
import { DDI_APP_PAGES } from '../helpers/urls'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 5.5rem;
`

const Input = styled.input`
  width: 15%;
  margin: 0.75rem auto;
  ${media.phoneMax`
    width: 75%;
    margin: 0.75rem auto;
  `}
`

//
// Login
class Login extends Component {
  state = {
    username: '',
    password: '',
  }

  componentDidMount() {
    this.props.hideSpinner()
  }

  handleChange = (type, event) => {
    this.setState({ [type]: event.target.value })
  }

  handleSubmit = async (event) => {
    // prevent page refresh
    event.preventDefault()

    try {
      await axios.post('/api/user/login', {
        username: this.state.username,
        password: this.state.password,
      })

      window.location = DDI_APP_PAGES.getGalleryPageUrl()
    } catch (error) {
      console.error(error)
      // @todo log error
      this.setState({ error })
    }
  }

  logout = async () => {
    try {
      await axios.post('/api/user/logout')

      window.location = DDI_APP_PAGES.getGalleryPageUrl()
    } catch (error) {
      console.error(error)
      // @todo log error
      this.setState({ error })
    }
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Input
            type="text"
            onChange={(e) => this.handleChange('username', e)}
            placeholder="username"
          />
          <Input
            type="password"
            onChange={(e) => this.handleChange('password', e)}
            placeholder="password"
          />
          <Input type="submit" value="Login" />
          <Input type="button" value="Logout" onClick={() => this.logout()} />
          {this.state.error && (
            <Input as="div">{this.state.error.message}</Input>
          )}
        </Form>
      </div>
    )
  }
}

export default Login
