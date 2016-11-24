import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './Layout';
import Draw from './Draw';

export default (
  <Route path='/' component={Layout}>
    <IndexRoute component={Draw} />
    <Route path='draw' component={Draw} />
  </Route>
);