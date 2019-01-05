const AWS = require('aws-sdk')
// const s3StreamFactory = require('s3-upload-stream')
// const Duplex = require('stream').Duplex;  
// const zlib = require('zlib')

const { serverEnvironment } = require('../env-config')

// function bufferToStream(buffer) {  
//   let stream = new Duplex();
//   stream.push(buffer);
//   stream.push(null);
//   return stream;
// }

const s3Config = {
  accessKeyId: serverEnvironment.AWS_ACCESS_KEY_ID,
  secretAccessKey: serverEnvironment.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-2' // hardcoded bc s3 doesn't have regions
}

//const s3Stream = s3StreamFactory(new AWS.S3(s3Config))

/**
 * Uploads the given file to S3
 */
// function saveBlobToS3 ({ bucketName, resourceName }, file) {
//   console.log(`{
//     Bucket: bucketName,
//     Key: resourceName
//   }`)
//   console.dir({
//     Bucket: bucketName,
//     Key: resourceName
//   })
//   return new Promise((resolve, reject) => {
//     // Create the streams
//     // var compress = zlib.createGzip();
//     const upload = s3Stream.upload({
//       Bucket: bucketName,
//       Key: resourceName
//     })

//     // Optional configuration
//     upload.maxPartSize(20971520) // 20 MB
//     upload.concurrentParts(5)

//     upload.on('error', (error) => {
//       // @todo metric
//       reject(error)
//     })

//     /* Handle upload completion. Example details object:
//       { Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
//         Bucket: 'bucketName',
//         Key: 'filename.ext',
//         ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"' }
//     */
//     upload.on('uploaded', (details) => {
//       // @todo metric this event and log details
//       console.log('details')
//       console.dir(details)
//     })

//     upload.on('part', (details) => {
//       console.log('details')
//       console.dir(details);
//     });

//     upload.on('finish', () => {
//       console.log('finished!')
//       resolve(resourceName)
//     })

//     const stream = bufferToStream(file.buffer)//fs.createReadStream(file.buffer)

//     // Pipe the incoming filestream through compression, and up to S3.
//     // @todo implment the compression: .pipe(compress).pipe(upload);
//     stream.pipe(upload)
//   })
// }

function sign (filename, filetype) {
  const s3 = new AWS.S3(s3Config)

  const s3Params = {
    Bucket: serverEnvironment.AWS_S3_BUCKET_NAME,
    Key: filename,
    Expires: 60,
    ContentType: filetype,
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
  //saveBlobToS3
}
