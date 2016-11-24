import path from 'path';

import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';

import routes from '../../client/components/routes'

const router = express.Router();

router.get('*', (request, response) => {
  match({ routes, location: request.originalUrl }, (error, redirectLocation, renderProps) => {
    if (error) {
      response
        .status(500)
        .send(error.message);
    } 
    else if (redirectLocation) {
      response.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } 
    else if (renderProps) {
      const markup = renderToString(<RouterContext {...renderProps} />);
      response
        .status(200)
        .render('index', { markup });
    } 
    else {
      response
        .status(404)
        .send('Not found');
    }
  });
});

export default router;