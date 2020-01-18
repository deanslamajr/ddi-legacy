import React from 'react'

const ErrorTest2Route = () => <h1>ErrorTest2Route</h1>

ErrorTest2Route.getInitialProps = () => {
  throw new Error('ErrorTest2Route')
}

export default ErrorTest2Route