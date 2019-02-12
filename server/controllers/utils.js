// purposeful incorrect response of 'OK' to not allow trolling of ids for validity
function falsePositiveResponse (errorMessage, res) {
  // @todo proper log
  console.error(errorMessage)
  return res.sendStatus(200)
}

module.exports = {
  falsePositiveResponse
}