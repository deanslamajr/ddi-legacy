const {post} = require('axios');

const {sign} = require('./');
const {Cells} = require('../../models');
const {clientEnvironment, serverEnvironment} = require('../../env-config');
const {
  CAPTCHA_ACTION_CELL_PUBLISH, CAPTCHA_THRESHOLD
} = require('../../../config/constants.json')

jest.mock('axios');
jest.mock('newrelic');
jest.mock('../../env-config');
jest.mock('../../models');

describe('controllers/comic/sign', () => {
  const comicId = 'comicId';
  const userId = 'userId';
  const v3Token = 'v3Token';
  const v2Token = 'v2Token';
  const newCells = [];
  const body = {
    newCells
  };

  const filename = 'filename';
  const urlId = 'urlId';
  const createCellResponse = {
    filename, urlId
  };

  let req;
  let res;

  const sendStatus = jest.fn();
  const json = jest.fn();

  beforeEach(() => {
    json.mockClear();
    sendStatus.mockClear();
    post.mockClear();

    Cells.createNewCell.mockImplementation(() => Promise.resolve(createCellResponse));

    req = {
      body,
      params: {
        comicId
      },
      session: {userId}
    };

    res = {
      json,
      sendStatus
    };

    clientEnvironment.CAPTCHA_V3_SITE_KEY = undefined;
    serverEnvironment.CAPTCHA_V3_SECRET = 'CAPTCHA_V3_SECRET';
    serverEnvironment.CAPTCHA_V2_SECRET = 'CAPTCHA_V2_SECRET';
  });

  describe('if user session doesn`t exist', () => {
    it('should respond 400', async () => {
      req.session = {};

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
        it('should respond 400', async () => {
          post.mockImplementationOnce(() => {throw new Error('Bad request');});

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
        });
      });

      describe('if verify captcha request returns successs=false', () => {
        it('should respond 400', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            success: false
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
        });
      });

      describe('if verify captcha call returns an action that is not CAPTCHA_ACTION_CELL_PUBLISH', () => {
        it('should respond 400', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            action: 'INCORRECT_ACTION'
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
        });
      });

      describe('if verify captcha call returns a score that is lower than CAPTCHA_THRESHOLD', () => {
        it('should respond 400', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            score: CAPTCHA_THRESHOLD - 0.1
          }}
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
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
        it('should respond 400', async () => {
          const mockResponse = {data: {
            ...captchaResponseSuccess,
            success: false
          }};
          post.mockImplementationOnce(() => Promise.resolve(mockResponse));

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
        });
      });

      describe('if verify captcha request is unsuccessful', () => {
        it('should respond 400', async () => {
          post.mockImplementationOnce(() => {throw new Error('Bad request');});

          await sign(req, res);

          expect(sendStatus).toHaveBeenCalledWith(400);
        });
      });
    });
  });

  describe('if the comicId passed is a draft id', () => {
    it('should create a new comic in DB', () => {
      throw new Error('implement!');
    });

    it('should return the new cellId in the response', () => {
      throw new Error('implement!');
    });
  });

  it('should create a new cell in DB for each passed draft cellId', async () => {
    const lotsOfNewCells = [1,2,3,4,5,6]
    req.body = {
      ...body,
      newCells: lotsOfNewCells
    }
    await sign(req, res);

    expect(Cells.createNewCell).toHaveBeenCalledTimes(lotsOfNewCells.length)
  });

  it('should return a signed payload for each passed draft cellId in the response', () => {
    throw new Error('implement!');
  })
});