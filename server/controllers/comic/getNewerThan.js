const {Cells, Comics} = require('../../models')
const {PAGE_SIZE} = require('../../../config/constants.json')

async function getNewerThan (req, res) {
  const latestUpdatedAt = req.query['latestUpdatedAt']
  if (!latestUpdatedAt) {
    throw new Error('Invalid request, must include queryString latestUpdatedAt')
  }

  const comics = await Comics.findAll({
    order: [['updated_at', 'ASC']],
    where: {
      updated_at: { $gt: latestUpdatedAt },
      'is_active': true
    },
    limit: PAGE_SIZE,
    include: [Cells]
  })

  res.json({
    comics,
    possiblyHasMore: comics.length === PAGE_SIZE
  })
}

module.exports = {
  getNewerThan
}