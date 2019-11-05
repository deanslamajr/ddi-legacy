const {createNewCell, createNewDraftFilename} = require('./Cells');
const {sequelize, __setFindOne} = require('../adapters/db');
const { ERROR_TYPES } = require('./constants');

const {create, findOne, update} = sequelize.define();


jest.mock('shortid');
jest.mock('../adapters/db');

describe('models/Cells', () => {
  const comicId = 'comicId';
  const userId = 'userId';

  beforeEach(() => {
    create.mockClear();
    findOne.mockClear();
  })

  describe('createNewCell', () => {
    it('should create a new Cell with a unique filename, url_id', async () => {
      const urlIdAlreadyExistsError = {
        errors: [
          {type: ERROR_TYPES.UNIQUE_VIOLATION}
        ]
      };
      create.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      create.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      create.mockImplementationOnce(() => Promise.resolve({}));

      await createNewCell({});

      expect(create).toHaveBeenCalledTimes(3);
    });

    it('should create the new Cell with the given comicId, userId', async () => {
      await createNewCell({comicId, userId});
      expect(create.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should return the filename and urlId', async () => {
      const response = await createNewCell({comicId, userId});
      expect(response).toMatchSnapshot();
    });
  });

  describe('createNewDraftFilename', () => {
    it('should set a cell`s draft_filename to a new unique value', async () => {
      const urlIdAlreadyExistsError = {
        errors: [
          {type: ERROR_TYPES.UNIQUE_VIOLATION}
        ]
      };
      const updateMock = jest.fn();
      const cellMock = {update: updateMock};
      findOne.mockImplementation(() => Promise.resolve(cellMock));
      updateMock.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      updateMock.mockImplementationOnce(() => Promise.reject(urlIdAlreadyExistsError));
      updateMock.mockImplementationOnce(() => Promise.resolve({}));

      await createNewDraftFilename({});

      expect(updateMock).toHaveBeenCalledTimes(3);
    });

    it('should return the new draft_filename', async () => {
      const updateMock = jest.fn(() => Promise.resolve({}));
      const cellMock = {update: updateMock};
      findOne.mockImplementation(() => Promise.resolve(cellMock));

      const response = await createNewDraftFilename({});
      expect(response).toMatchSnapshot();
    });
  });
});