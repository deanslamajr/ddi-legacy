const { Comics } = require('../models')
const { falsePositiveResponse } = require('./utils')

async function get (req, res) {
  const comicId = req.params.comicId
  const comic = await Comics.findOne({ where: { url_id: comicId }})
  
  if (!comic) {
    return falsePositiveResponse(`comic::get - There is not a Comic with id:${comicId}`, res)
  }

  const cellsData = await comic.getCells()
  const cells = cellsData.map(({ url_id, image_url, title }) => ({
    urlId: url_id,
    imageUrl: image_url,
    title
  }))

  res.json({
    cells,
    urlId: comic.url_id,
    title: comic.title
  })
}

module.exports = {
  get
}