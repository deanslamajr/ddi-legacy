// purposeful incorrect response of 'OK' to not allow trolling of ids for validity
function falsePositiveResponse(errorMessage, res) {
  // @todo proper log
  console.error(errorMessage)
  return res.sendStatus(200)
}

function isUserAuthorized(userSession, authorizedUserId) {
  return userSession.isAdmin === true || authorizedUserId === userSession.userId
}

module.exports = {
  falsePositiveResponse,
  isUserAuthorized,
}
