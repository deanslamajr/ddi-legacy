const { Cells, Comics } = require('../models')
const { falsePositiveResponse } = require('./utils')

async function all (req, res) {
  let offset = 0
  let limit = 10

  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    offset = parseInt(offsetFromQueryString, 10)
  }

  const comics = await Comics.findAll({
    order: [['updated_at', 'DESC']],
    offset,
    limit,
    include: [Cells]
  })
  const comicsCount = await Comics.count()

  res.json({
    comics,
    hasMore: comicsCount > (offset + limit)
  })
}

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
  all,
  get
}