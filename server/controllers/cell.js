const uuidV4 = require('uuid/v4')

const { saveBlobToS3 } = require('../adapters/s3')
const { serverEnvironment } = require('../env-config')

async function save (req, res) {
  try {
    const uuid = uuidV4()

    console.log('req.file.buffer')
    console.dir(req.file.buffer)

    const s3Config = {
      bucketName: serverEnvironment.AWS_S3_BUCKET_NAME,
      resourceName: `${uuid}.png`
    }
  
    const s3ResourceName = await saveBlobToS3(s3Config, req.file)
    return res.status(200).json({ uuid, s3ResourceName })
  }
  catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }
}

module.exports = {
  save
}