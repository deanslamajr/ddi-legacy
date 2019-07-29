require('dotenv').config({ path: '../.env' })

const {Users} = require('../server/models')

const username = 'replaceWithSomeUsername';
const password = 'replaceWithStrongPassword';

Users.createNewUser({username, password, options: {is_admin: true}})
  .then(() => {
    console.log('Success!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });