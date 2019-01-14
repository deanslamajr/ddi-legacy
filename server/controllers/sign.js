const shortid = require('shortid')

const { sign: signViaS3 } = require('../adapters/s3')
const { Cells } = require('../models/index')

async function sign (req, res) {
  try {
    const filename = req.query['file-name']
    const filetype = req.query['file-type']
    const title = req.query['title']

    const signData = await signViaS3(filename, filetype)

    const id = shortid.generate()
    await Cells.create({
      image_url: signData.url,
      title,
      url_id: id
    })

    signData.id = id

    res.write(JSON.stringify(signData))
    res.end()
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

module.exports = {
  sign
}