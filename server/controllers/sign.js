const { sign: signViaS3 } = require('../adapters/s3')

async function sign (req, res) {
  console.log('in sign')

  try {
    const filename = req.query['file-name']
    const filetype = req.query['file-type']

    const signData = await signViaS3(filename, filetype)

    console.log('signData')
    console.dir(signData)

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