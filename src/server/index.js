import path from 'path';

import express from 'express';

import bodyParser from 'body-parser';

import router from './routes';

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname);

app.set('port', (process.env.PORT || 1717))

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({ extended: false }));

// define routes
app.use(router);

// start the server
app.listen(app.get('port'), function (){
  console.log('ready on port ' + app.get('port'));
});