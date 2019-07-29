const bcrypt = require('bcrypt');
const { Users } = require('../models')

async function authenticate (req, res) {
  const {
    username,
    password: passwordFromInput
  } = req.body;

  if(!username || !passwordFromInput) {
    return res.sendStatus(401);
  }

  try{
    const user = await Users.findOne({where: {username}})
    if (!user) {
      // @todo log
      res.sendStatus(404);
    }
    // this doesn't seem to fail with a bad password
    const match = await bcrypt.compare(passwordFromInput, user.password)
    if (match) {
      // spread whitelisted user fields into user session
      console.log('user', user)
      return res.sendStatus(200)
    } else {
      // @todo log
      res.sendStatus(404);
    }
  }
  catch(error) {
    console.error(error);
    // @todo log
    res.sendStatus(500);
  }
}

// async function logout

module.exports = {
  authenticate
}