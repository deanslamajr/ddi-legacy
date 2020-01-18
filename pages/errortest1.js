import React from 'react'

import { Link } from '../routes'

const ErrorTest1Route = (props) => {
    if (props.isShowingSpinner) {
        props.hideSpinner()
    }
    
    return <Link href="/errortest2">
        <a>Perform client side navigation</a>
    </Link>
}

export default ErrorTest1Route