const {Comics, Cells} = require('../../models')
const {transformComicFromDB} = require('./utils');
const {PAGE_SIZE} = require('../../../config/constants.json')

async function all (req, res) {
  let offset = 0

  const offsetFromQueryString = req.query['offset']
  if (offsetFromQueryString) {
    offset = parseInt(offsetFromQueryString, 10)
  }

  const comics = await Comics.findAll({
    where: {'is_active': true},
    order: [['updated_at', 'DESC']],
    offset,
    limit: PAGE_SIZE,
    include: [Cells]
  }).map(transformComicFromDB);

  const count = await Comics.count()

  res.json({
    comics,
    hasMore: count > (offset + PAGE_SIZE)
  })
}

module.exports = {
  all
}