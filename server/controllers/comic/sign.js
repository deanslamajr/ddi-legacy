const newrelic = require('newrelic');
const axios = require('axios');
const queryString = require('query-string');

const { sign: signViaS3 } = require('../../adapters/s3')
const { Cells, Comics } = require('../../models')
const {
  clientEnvironment, serverEnvironment
} = require('../../env-config');
const {isDraftId} = require('../../../shared/isDraftId');
const {
  CAPTCHA_ACTION_CELL_PUBLISH, CAPTCHA_THRESHOLD
} = require('../../../config/constants.json')

function verifyCaptchaToken (token, isV2) {
  const verifyPayload = {
    response: token,
    secret: isV2 ? serverEnvironment.CAPTCHA_V2_SECRET : serverEnvironment.CAPTCHA_V3_SECRET
  };

  return axios.post('https://www.google.com/recaptcha/api/siteverify', queryString.stringify(verifyPayload))
}

async function createCell(draftId, comicId, userId) {
  const {
    filename, urlId
  } = await Cells.createNewCell({comicId, userId});

  return {
    draftId,
    filename,
    id: urlId
  };
}

async function signCell({draftId, filename, id}) {
  const signData = await signViaS3(filename);
  return {
    draftId,
    filename,
    id,
    signData
  }
}

async function sign (req, res) {
  let comicId = req.params.comicId

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
      newCells
    } = req.body;

    /**
     * CAPTCHA
     */
    const isV2Token = !!v2Token && !v3Token;
    if (clientEnvironment.CAPTCHA_V3_SITE_KEY) {
      const { data: captchaVerifyResponse = {} } = await verifyCaptchaToken(v3Token || v2Token, isV2Token);

      newrelic.recordCustomEvent('captcha', {
        ...captchaVerifyResponse,
        isV2Token,
        v2Token: v2Token ? v2Token.substring(8, 13) : 'n/a',
        v3Token: v3Token ? v3Token.substring(8, 13) : 'n/a'
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

    let comic;

    // optionally: create comic in DB
    if(isDraftId(comicId)) {
      comic = await Comics.createNewComic({userId: req.session.userId});
    } else {
      comic = await Comics.findOne({ where: { url_id: comicId }});
    }

    const newlyCreatedCells = await Promise.all(
      newCells.map(draftId => createCell(draftId, comic.id, req.session.userId))
    );
    
    const signedCells = await Promise.all(newlyCreatedCells.map(signCell));

    res.json({
      comicId: comic.url_id,
      cells: signedCells
    });
  }
  catch(e) {
    // @todo log
    console.error(e);
    res.sendStatus(400);
  }
}

module.exports = {
  sign
}