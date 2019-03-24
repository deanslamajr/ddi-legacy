const shortid = require('shortid')

const { sign: signViaS3 } = require('../adapters/s3')
const { Cells, Comics } = require('../models/index')
const { falsePositiveResponse } = require('./utils')

const { S3_ASSET_FILETYPE } = require('../../config/constants.json')

async function sign (req, res) {
  try {
    if (!req.session.userId) {
      throw new Error('User session does not exist!')
    }

    const filename = req.query['file-name']
    const title = req.query['title']
    const parentId = req.query['parent-id']
    let comicId = req.query['comic-id']

    const signData = await signViaS3(filename, S3_ASSET_FILETYPE)
    const id = shortid.generate()
    signData.id = id

    const newCellConfiguration = {
      creator_user_id: req.session.userId,
      image_url: signData.url,
      title,
      order: 0,
      url_id: id
    }

    // /:comicId||new/:parentId
    if (parentId) {
      const parentCell = await Cells.findOne({ where: { url_id: parentId }})
      if (!parentCell) {
        falsePositiveResponse(`sign::sign - There is not a Cell with parentId:${parentId}`, res)
      }
      // /new/:parentId
      if (!comicId) {
        const cell = await parentCell.createCell(newCellConfiguration)
        comicId = shortid.generate()
        await cell.createComic({
          creator_user_id: req.session.userId,
          title: '',
          url_id: comicId
        })
      }
      // /:comic/:parentId
      else {
        const comic = await Comics.findOne({ where: { url_id: comicId }, include: [Cells]})
        if (!comic) {
          falsePositiveResponse(`sign::sign - There is not a Comic with url_id:${comicId}`, res)
        }

        if (comic.creator_user_id !== req.session.userId) {
          // @todo proper log
          // @todo this should probably provide some kind of false positive response
          console.error('Unauthorized user!')
          return res.sendStatus(401)
        }

        newCellConfiguration.order = comic.cells
          ? comic.cells.length + 1
          : 0

        newCellConfiguration.comic_id = comic.id

        await parentCell.createCell(newCellConfiguration)
        // bump the comic's updated_at value
        comic.changed('updated_at', true)
        await comic.save()
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
      const comic = await Comics.findOne({ where: { url_id: comicId }, include: [Cells]})
      if (!comic) {
        falsePositiveResponse(`sign::sign - There is not a Comic with url_id:${comicId}`, res)
      }

      // @todo verify user is authorized to add a cell to this comic
      if (comic.creator_user_id !== req.session.userId) {
        // @todo proper log
        // @todo this should probably provide some kind of false positive response
        console.error('Unauthorized user!')
        return res.sendStatus(401)
      }

      newCellConfiguration.order = comic.cells
        ? comic.cells.length + 1
        : 0

      await comic.createCell(newCellConfiguration)
      // bump the comic's updated_at value
      comic.changed('updated_at', true)
      await comic.save()
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