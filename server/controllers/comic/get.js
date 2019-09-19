const {Comics} = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils');

async function get (req, res) {
  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  let userCanEdit = false
  
  if (!comic) {
    return falsePositiveResponse(`comic::get - There is not a Comic with id:${comicId}`, res)
  }

  if (isUserAuthorized(req.session, comic.creator_user_id)) {
    userCanEdit = true
  }

  const cellsData = await comic.getCells()
  const cells = cellsData.map(({
    url_id, image_url, order, schema_version, studio_state, title
  }) => ({
    urlId: url_id,
    imageUrl: image_url,
    order,
    schemaVersion: schema_version,
    studioState: studio_state,
    title
  }))

  res.json({
    cells,
    isActive: comic.is_active,
    title: comic.title,
    urlId: comic.url_id,
    userCanEdit
  })
}

module.exports = {
  get
}