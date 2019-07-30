const shortid = require('shortid')

/**
 * If user doesn't have a userId in the cookie, create a new one
 */
function handleUserSession (req, res, next) {
  if (!req.session.userId) {
    req.session.userId = shortid.generate();
    req.session.isAdmin = false;
  }

  next();
}

module.exports = handleUserSession