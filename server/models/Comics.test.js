const {createNewComic} = require('./Comics');
const {sequelize} = require('../adapters/db');
const { ERROR_TYPES } = require('./constants');

const {create, findOne} = sequelize.define();

jest.mock('shortid');
jest.mock('../adapters/db');

describe('models/Comics', () => {
  const userId = 'userId';

  beforeEach(() => {
    create.mockClear();
    findOne.mockClear();
  })

  describe('createNewComic', () => {
    it('should create a new Comic with a unique url_id', async () => {
      const urlIdAlreadyExistsError = {
        errors: [
          {type: ERROR_TYPES.UNIQUE_VIOLATION}
        ]
      };
      create.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      create.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      create.mockImplementationOnce(() => Promise.resolve({}));

      await createNewComic({});

      expect(create).toHaveBeenCalledTimes(3);
    });

    it('should create the new Comic with the given userId', async () => {
      await createNewComic({userId});
      expect(create.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should return the comic', async () => {
      const response = await createNewComic({userId});
      expect(response).toMatchSnapshot();
    });
  });
});