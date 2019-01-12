import React from 'react';

import NavBar from './navbar';

export default class Layout extends React.Component {
  render() {
    return (
      <div>
        <NavBar></NavBar>
        {this.props.children}
      </div>
    );
  }
}