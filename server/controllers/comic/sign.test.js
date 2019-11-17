const {post} = require('axios');
const cloneDeep = require('lodash/cloneDeep');

const {sign} = require('./');
const {Cells, Comics} = require('../../models');
const {clientEnvironment, serverEnvironment} = require('../../env-config');
const {
  CAPTCHA_ACTION_CELL_PUBLISH, CAPTCHA_THRESHOLD, DRAFT_SUFFIX
} = require('../../../config/constants.json')

jest.mock('axios');
jest.mock('newrelic');
jest.mock('../../env-config');
jest.mock('../../models');
jest.mock('../../adapters/s3');
jest.mock('../../adapters/db');

const userId = 'userId';

Comics.findOne.mockImplementation(() => ({
  id: 'someExistingComicId',
  creator_user_id: userId,
  url_id: 'comicUrlId'
}))

describe('controllers/comic/sign', () => {
  const comicUrlId = 'comicUrlId';
  const v3Token = 'v3Token';
  const v2Token = 'v2Token';
  const newCells = [
    `some${DRAFT_SUFFIX}`,
    `new${DRAFT_SUFFIX}`,
    `cells${DRAFT_SUFFIX}`
  ];
  const body = {
    newCells
  };

  const filename = 'filename';
  const urlId = 'urlId';
  const createCellResponse = {
    filename, urlId
  };

  const defaultReq = {
    body,
    params: {
      comicUrlId
    },
    session: {userId}
  };

  let req;
  let res;

  const sendStatus = jest.fn();
  const json = jest.fn();

  beforeEach(() => {
    json.mockClear();
    sendStatus.mockClear();
    post.mockClear();
    Comics.createNewComic.mockClear();
    Cells.createNewCell.mockClear();
    Cells.createNewDraftFilename.mockClear();

    Cells.createNewCell.mockImplementation(() => Promise.resolve(createCellResponse));

    req = cloneDeep(defaultReq);

    res = {
      json,
      sendStatus
    };

    clientEnvironment.CAPTCHA_V3_SITE_KEY = undefined;
    serverEnvironment.CAPTCHA_V3_SECRET = 'CAPTCHA_V3_SECRET';
    serverEnvironment.CAPTCHA_V2_SECRET = 'CAPTCHA_V2_SECRET';
  });

  describe('if user session doesn`t exist', () => {
    it('should respond 500', async () => {
      req.session = {};

      await sign(req, res);

      expect(sendStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('if the number of cells to sign exceeds the system maximum', () => {
    it('should respond 400', async () => {
      req.body.newCells = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

      await sign(req, res);

      expect(sendStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('if CAPTCHA_V3_SITE_KEY env var exists', () => {
    const captchaResponseSuccess = {
      action: CAPTCHA_ACTION_CELL_PUBLISH,
      score: CAPTCHA_THRESHOLD,
      success: true
    }

    beforeEach(() => {
      clientEnvironment.CAPTCHA_V3_SITE_KEY = 'captchaV3SiteKey';

      req.body = {
        ...body,
        v3Token
      };
    });

    describe('if v3Captcha is passed', () => {
      it('should make the correct captcha request', async () => {
        await sign(req, res);

        expect(post.mock.calls[0]).toMatchSnapshot();
        expect(post).toHaveBeenCalled();
      });

      describe('if verify captcha request is unsuccessful', () => {
        it('should respond 200', async () => {
          post.mockImplementationOnce(() => {throw new Error('Bad request');});

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('if verify captcha request returns successs=false', () => {
        it('should respond 200', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            success: false
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('if verify captcha call returns an action that is not CAPTCHA_ACTION_CELL_PUBLISH', () => {
        it('should respond 200', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            action: 'INCORRECT_ACTION'
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('if verify captcha call returns a score that is lower than CAPTCHA_THRESHOLD', () => {
        it('should respond 200', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            score: CAPTCHA_THRESHOLD - 0.1
          }}
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });
    });

    describe('if v2Captcha is passed but v3Captcha is NOT passed', () => {
      beforeEach(() => {
        req.body = {
          ...body,
          v2Token
        };
      });

      it('should make the correct captcha request', async () => {
        await sign(req, res);

        expect(post.mock.calls[0]).toMatchSnapshot();
        expect(post).toHaveBeenCalled();
      });

      describe('if verify captcha request returns successs=false', () => {
        it('should respond 200', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            success: false
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });

      describe('if verify captcha request is unsuccessful', () => {
        it('should respond 200', async () => {
          post.mockImplementationOnce(() => {throw new Error('Bad request');});

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(200);
        });
      });
    });
  });

  describe('if the comicUrlId passed is a draft urlId', () => {
    const draftUrlId = `comicUrlId${DRAFT_SUFFIX}`;

    beforeEach(() => {
      req.params =  {
        comicUrlId: draftUrlId
      };
    });

    it('should create a new comic in DB', async () => {
      await sign(req, res);

      expect(Comics.createNewComic).toHaveBeenCalled();
    });

    it('should return the new comicUrlId in the response', async () => {
      await sign(req, res);

      // if a new comic is NOT created, we would expect the response
      // to include the passed comicUrlId
      expect(res.json.mock.calls[0][0].comicUrlId).not.toBe(draftUrlId);
    });
  });

  describe('if the comicUrlId passed is NOT a draft id', () => {
    it('should NOT create a new comic in the DB', async () => {
      req.params =  {
        comicUrlId
      };

      await sign(req, res);

      expect(Comics.createNewComic).not.toHaveBeenCalled();
    });
  });

  it('should create a new cell in DB for each passed draft cellId', async () => {
    const lotsOfNewCells = [
      `1${DRAFT_SUFFIX}`,
      `2${DRAFT_SUFFIX}`,
      `3${DRAFT_SUFFIX}`,
      `4${DRAFT_SUFFIX}`,
      `5${DRAFT_SUFFIX}`,
      `6${DRAFT_SUFFIX}`
    ];

    req.body = {
      ...body,
      newCells: lotsOfNewCells
    }

    await sign(req, res);

    expect(Cells.createNewCell).toHaveBeenCalledTimes(lotsOfNewCells.length)
  });

  it('should create a new filename for each passed NON-draft cellId', async () => {
    const lotsOfNewCells = ['1', '2', '3', '4', '5', '6'];
    
    req.body = {
      ...body,
      newCells: lotsOfNewCells
    };

    await sign(req, res);

    expect(Cells.createNewDraftFilename).toHaveBeenCalledTimes(lotsOfNewCells.length);
  });

  it('should return a signed payload for each passed draft cellId in the response', async () => {
    await sign(req, res);

    expect(json.mock.calls[0]).toMatchSnapshot();
    expect(json.mock.calls[0][0].cells.length).toBe(req.body.newCells.length);
  })
});