import axios from 'axios'
import { Component } from 'react'
import styled from 'styled-components'

import { media } from '../helpers/style-utils'

const SUCCESS = 'success'
const FAILURE = 'failure'
const LOGGEDOUT = 'logged out'
const AUTHENTICATED = 'authenticated'
const NOTAUTHENTICATED = 'not authenticated'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 5.5rem;
`

const Input = styled.input`
  width: 20%;
  margin: 0.75rem auto;
  ${media.phoneMax`
    width: 45%;
    margin: 0.75rem auto;
  `}
`

//
// Login
class Login extends Component {
  state = {
    username: '',
    password: '',
    loginResult: '',
    authenticated: ''
  }

  componentDidMount () {
    this.props.hideSpinner()
  }

  handleChange = (type, event) => {
    this.setState({ [type]: event.target.value })
  }

  handleSubmit = async (event) => {
    // prevent page refresh
    event.preventDefault()

    try{
      await axios.post('/api/user/login', {
        username: this.state.username,
        password: this.state.password
      })
  
      this.setState({
        loginResult: SUCCESS,
        authenticated: AUTHENTICATED
      })
    }
    catch(error) {
      console.error(error);
      // @todo log error
      this.setState({ loginResult: FAILURE })
    }
  }

  render () {
    return <div>
      <Form onSubmit={this.handleSubmit}>
        {/* { this.renderAuthenticationCheckDiv() } */}
        <Input
          type='text'
          onChange={e => this.handleChange('username', e)}
          placeholder='username'
        />
        <Input
          type='password'
          onChange={e => this.handleChange('password', e)}
          placeholder='password'
        />
        <Input
          type='submit'
          value='Login'
        />
      </Form>
    </div>
  }
}

export default Login 