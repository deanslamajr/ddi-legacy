const shortid = require('shortid')

const { sign: signViaS3 } = require('../adapters/s3')
const { Cells } = require('../models/index')

// purposeful incorrect response of 'OK' to not allow trolling of ids for validity
function falsePositiveResponse (cellId, res) {
  // @todo proper log
  console.error(`Sign Error: There is not a Cell with id:${cellId}`)
  return res.json({})
}

async function sign (req, res) {
  try {
    console.log('req.query', req.query)
    if (!req.session.userId) {
      throw new Error('User session does not exist!')
    }

    const filename = req.query['file-name']
    const filetype = req.query['file-type']
    const title = req.query['title']
    const parentId = req.query['parent-id']

    const signData = await signViaS3(filename, filetype)
    const id = shortid.generate()
    signData.id = id

    const newCellConfiguration = {
      creator_user_id: req.session.userId,
      image_url: signData.url,
      title,
      url_id: id
    }

    if (parentId) {
      const parentCell = await Cells.findOne({ where: { url_id: parentId }})
      if (!parentCell) {
        falsePositiveResponse(parentCell, res)
      }
      await parentCell.createCell(newCellConfiguration)
    }
    else {
      await Cells.create(newCellConfiguration)
    }

    res.json(signData)
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

module.exports = {
  sign
}