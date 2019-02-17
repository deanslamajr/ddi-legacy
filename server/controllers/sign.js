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

    // /:comicId||new/:parentId
    if (parentId) {
      const parentCell = await Cells.findOne({ where: { url_id: parentId }})
      if (!parentCell) {
        falsePositiveResponse(`sign::sign - There is not a Cell with parentId:${parentId}`, res)
      }
      const cell = await parentCell.createCell(newCellConfiguration)
      // /new/:parentId
      if (!comicId) {
        comicId = shortid.generate()
        await cell.createComic({
          creator_user_id: req.session.userId,
          title: '',
          url_id: comicId
        })
      }
      // /:comic/:parentId
      else {
        throw new Error('/:comicId/:parentId unsupported')
      }
    }
    // /new/new
    else if (!parentId && !comicId) {
      comicId = shortid.generate()
      const comic = await Comics.create({
        creator_user_id: req.session.userId,
        title: '',
        url_id: comicId
      })
      await comic.createCell(newCellConfiguration)
    }
    // /:comicId/new
    else {
      // @todo verify user is authorized to add a cell to this comic
      throw new Error('/:comicId/new unsupported')
    }

    if (comicId) {
      signData.comicId = comicId
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