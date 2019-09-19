const {Comics} = require('../../models');
const { falsePositiveResponse, isUserAuthorized } = require('../utils');

async function inactivate (req, res) {
  if (!req.session.userId) {
    throw new Error('User session does not exist!')
  }

  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  
  if (!comic) {
    return falsePositiveResponse(`comic::delete - There is not a Comic with id:${comicId}`, res)
  }

  if (!isUserAuthorized(req.session, comic.creator_user_id)) {
    return falsePositiveResponse(`comic::delete - User with id:${req.session.userId} is not authorized to delete the comic with id:${comicId}`, res)
  }

  await comic.update({
    'is_active': false
  }, {
    // don't alter Comic.updated_at
    // http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update
    silent: true
  });

  return res.sendStatus(200)
}

module.exports = {
  inactivate
}