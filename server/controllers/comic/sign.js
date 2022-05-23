const newrelic = require('newrelic')
const axios = require('axios')
const queryString = require('query-string')

const { sign: signViaS3 } = require('../../adapters/s3')
const { sequelize } = require('../../adapters/db')
const { Cells, Comics } = require('../../models')
const { falsePositiveResponse, isUserAuthorized } = require('../utils')
const { clientEnvironment, serverEnvironment } = require('../../env-config')
const { isDraftId } = require('../../../shared/isDraftId')
const {
  CAPTCHA_ACTION_CELL_PUBLISH,
  CAPTCHA_THRESHOLD,
  MAX_DIRTY_CELLS,
} = require('../../../config/constants.json')
const next = require('next')

function verifyCaptchaToken(token, isV2) {
  const verifyPayload = {
    response: token,
    secret: isV2
      ? serverEnvironment.CAPTCHA_V2_SECRET
      : serverEnvironment.CAPTCHA_V3_SECRET,
  }

  return axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    queryString.stringify(verifyPayload)
  )
}

async function createCell(draftUrlId, comicId, userId, transaction) {
  let filename
  let urlId

  if (isDraftId(draftUrlId)) {
    const response = await Cells.createNewCell({ comicId, transaction, userId })
    filename = response.filename
    urlId = response.urlId
  } else {
    filename = await Cells.createNewDraftFilename({
      cellUrlId: draftUrlId,
      transaction,
    })
    urlId = draftUrlId
  }

  return {
    draftUrlId,
    filename,
    urlId,
  }
}

async function signCell({ draftUrlId, filename, urlId }) {
  const signData = await signViaS3(filename)
  return {
    draftUrlId,
    filename,
    signData,
    urlId,
  }
}

async function sign(req, res, next) {
  let transaction
  let comicUrlId = req.params.comicUrlId

  try {
    if (!req.session.userId) {
      throw new Error('User session does not exist!')
    }

    const { v2Token, v3Token, newCells } = req.body

    if (newCells.length > MAX_DIRTY_CELLS) {
      // @TODO log
      console.error(
        `comic::sign - The number of cells to sign, ${newCells.length}, exceeded the system limit of ${MAX_DIRTY_CELLS}.`
      )
      return res.sendStatus(400)
    }

    /**
     * CAPTCHA
     */
    const isV2Token = !!v2Token && !v3Token
    if (clientEnvironment.CAPTCHA_V3_SITE_KEY) {
      try {
        const { data: captchaVerifyResponse = {} } = await verifyCaptchaToken(
          v3Token || v2Token,
          isV2Token
        )

        newrelic.recordCustomEvent('captcha', {
          ...captchaVerifyResponse,
          isV2Token,
          v2Token: v2Token ? v2Token.substring(8, 13) : 'n/a',
          v3Token: v3Token ? v3Token.substring(8, 13) : 'n/a',
        })

        // v2 captcha
        if (isV2Token) {
          if (!captchaVerifyResponse.success) {
            throw new Error(
              'V2 Recaptcha verification returned with non-success status.'
            )
          }
        }
        // v3 captcha
        else if (!captchaVerifyResponse.success) {
          throw new Error(
            'V3 Recaptcha verification returned with non-success status.'
          )
        } else if (
          captchaVerifyResponse.action !== CAPTCHA_ACTION_CELL_PUBLISH
        ) {
          throw new Error(
            `V3 Recaptcha verification returned with the incorrect action. Expected:${CAPTCHA_ACTION_CELL_PUBLISH} Actual:${captchaVerifyResponse.action}`
          )
        } else if (captchaVerifyResponse.score < CAPTCHA_THRESHOLD) {
          throw new Error(
            `V3 Recaptcha verification returned with a score below the acceptable threshold. Threshold:${captchaVerifyResponse.score} Actual: ${CAPTCHA_THRESHOLD}`
          )
        }
      } catch (e) {
        console.error(e)
        return res.sendStatus(400)
      }
    }

    let comic
    let newlyCreatedCells

    transaction = await sequelize.transaction()

    // optionally: create comic in DB
    if (isDraftId(comicUrlId)) {
      comic = await Comics.createNewComic({
        userId: req.session.userId,
        transaction,
      })
    } else {
      comic = await Comics.findOne({ where: { url_id: comicUrlId } })
      if (!comic) {
        return res.sendStatus(404)
      }
      if (!isUserAuthorized(req.session, comic.creator_user_id)) {
        return falsePositiveResponse(
          `comic::sign - User with id:${req.session.userId} is not authorized to sign cells on the comic with id:${comicUrlId}`,
          res
        )
      }
    }

    newlyCreatedCells = await Promise.all(
      newCells.map((draftUrlId) =>
        createCell(draftUrlId, comic.id, req.session.userId, transaction)
      )
    )

    const signedCells = await Promise.all(newlyCreatedCells.map(signCell))

    transaction.commit()

    res.json({
      comicUrlId: comic.url_id,
      cells: signedCells,
    })
  } catch (error) {
    try {
      if (transaction) {
        transaction.rollback()
      }
    } catch (deeperError) {
      return next(deeperError)
    }
    next(error)
  }
}

module.exports = {
  sign,
}
