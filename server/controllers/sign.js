const shortid = require('shortid')

const { sign: signViaS3 } = require('../adapters/s3')
const { Cells, Comics } = require('../models/index')
const { falsePositiveResponse } = require('./utils')

async function sign (req, res) {
  try {
    if (!req.session.userId) {
      throw new Error('User session does not exist!')
    }

    const filename = req.query['file-name']
    const filetype = req.query['file-type']
    const title = req.query['title']
    const parentId = req.query['parent-id']
    let comicId = req.query['comic-id']

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
        falsePositiveResponse(`sign::sign - There is not a Cell with parentId:${parentId}`, res)
      }
      await parentCell.createCell(newCellConfiguration)
    }
    else if (!parentId && !comicId) {
      comicId = shortid.generate()
      const comic = await Comics.create({
        creator_user_id: req.session.userId,
        title: '',
        url_id: comicId
      })
      await comic.createCell(newCellConfiguration)
      signData.comicId = comicId
    }
    else {
      throw new Error('unsupported use case!!!')
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