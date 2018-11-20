import React from 'react';
import { Link } from 'react-router';
import cssModules from 'react-css-modules';

import styles from './navbar.css';

class NavBar extends React.Component {
  render() {
    return (
      <div styleName='container'>
        <h1>Draw Draw Ink</h1>
        <span><Link to="/draw">Draw</Link></span>
      </div>
    );
  }
};

export default cssModules(NavBar, styles);