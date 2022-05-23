const bcrypt = require('bcrypt')
const { Users } = require('../models')

function hydrateSession(user, req) {
  req.session.userId = user.id
  req.session.isAdmin = user.is_admin
}

async function logout(req, res) {
  req.session = null
  res.sendStatus(200)
}

async function login(req, res, next) {
  const { username, password: passwordFromInput } = req.body

  if (!username || !passwordFromInput) {
    return res.sendStatus(401)
  }

  try {
    const user = await Users.findOne({ where: { username } })
    if (!user) {
      // @todo log
      res.sendStatus(404)
    }

    const match = await bcrypt.compare(passwordFromInput, user.password)
    if (match) {
      hydrateSession(user, req)
      return res.sendStatus(200)
    } else {
      // @todo log
      res.sendStatus(404)
    }
  } catch (error) {
    next(error)
  }
}

// async function logout

module.exports = {
  login,
  logout,
}
