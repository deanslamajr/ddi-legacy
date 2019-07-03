const shortid = require('shortid')
const axios = require('axios')
const queryString = require('query-string');
const newrelic = require('newrelic');

const { sign: signViaS3 } = require('../adapters/s3')
const { Cells, Comics } = require('../models/index')
const { falsePositiveResponse } = require('./utils')
const {
  validateFilename,
  validateTitle
} = require('../../shared/validators')

const {
  clientEnvironment,
  serverEnvironment
} = require('../env-config')
const {
  CAPTCHA_ACTION_CELL_PUBLISH,
  CAPTCHA_THRESHOLD
} = require('../../config/constants.json')

function verifyCaptchaToken (token, isV2) {
  const verifyPayload = {
    response: token,
    secret: isV2 ? serverEnvironment.CAPTCHA_V2_SECRET : serverEnvironment.CAPTCHA_V3_SECRET
  };

  return axios.post('https://www.google.com/recaptcha/api/siteverify', queryString.stringify(verifyPayload))
}

async function sign (req, res) {
  const handleFailedCaptcha = () => {
    // @todo generate better logs around this failed captcha
    res.sendStatus(400);
  };

  try {
    if (!req.session.userId) {
      throw new Error('User session does not exist!')
    }

    const {
      v2Token,
      v3Token,
      filename,
      parentId,
      title
    } = req.body;

    const isV2Token = !!v2Token;

    if (clientEnvironment.CAPTCHA_V3_SITE_KEY) {
      const { data: captchaVerifyResponse = {} } = await verifyCaptchaToken(v3Token || v2Token, isV2Token);

      newrelic.recordCustomEvent('captcha', {
        ...captchaVerifyResponse,
        isV2Token,
        v2Token: v2Token ? v2Token.substring(0, 5) : 'n/a',
        v3Token: v3Token ? v3Token.substring(0, 5) : 'n/a'
      });

      // v2 captcha
      if (isV2Token) {
        if (!captchaVerifyResponse.success) {
          return handleFailedCaptcha();
        }
      }
      // v3 captcha
      else if (
        !captchaVerifyResponse.success ||
        captchaVerifyResponse.action !== CAPTCHA_ACTION_CELL_PUBLISH ||
        captchaVerifyResponse.score < CAPTCHA_THRESHOLD
      ) {
        return handleFailedCaptcha();
      }
    }

    // throws on fail
    validateFilename(filename)
    
    const validatedTitle = validateTitle(title)

    let comicId = req.body.comicId;

    const signData = await signViaS3(filename)
    const id = shortid.generate()
    signData.id = id

    const image_url = serverEnvironment.ASSETS_DOMAIN ? `https://${serverEnvironment.ASSETS_DOMAIN}/${filename}` : signData.url;

    const newCellConfiguration = {
      creator_user_id: req.session.userId,
      image_url,
      title: validatedTitle,
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

    res.json(signData);
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

module.exports = {
  sign
}