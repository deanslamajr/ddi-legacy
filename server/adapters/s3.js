const AWS = require('aws-sdk')

const { serverEnvironment } = require('../env-config')
const {
  S3_ASSET_FILETYPE
} = require('../../config/constants.json')

const s3Config = {
  accessKeyId: serverEnvironment.AWS_ACCESS_KEY_ID,
  secretAccessKey: serverEnvironment.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2' // hardcoded bc s3 doesn't have regions
}

function sign (filename) {
  const s3 = new AWS.S3(s3Config)

  const s3Params = {
    Bucket: serverEnvironment.AWS_S3_BUCKET_NAME,
    Key: filename,
    Expires: 60,
    ContentType: S3_ASSET_FILETYPE,
    ACL: 'public-read'
  }

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
        reject(err)
      }

      const returnData = {
        signedRequest: data,
        url: `https://${serverEnvironment.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`
      }

      resolve(returnData)
    })
  })
}

module.exports = { 
  sign
}
