const {createNewCell} = require('./Cells');
const {sequelize, __setFindOne} = require('../adapters/db');

const {create, findOne} = sequelize.define();


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
      const mockedExistingCells = [
        'some', 'existing', 'cells'
      ];

      // set cell.create mock
      mockedExistingCells.forEach(mockCell => __setFindOne(mockCell));


      // invoke createNewCell
      await createNewCell({});

      // 3 calls against existing cells, either
      //   * Cells.findOne({ where: { url_id: urlId }})
      //   * Cells.findOne({ where: { image_url: filename }})
      // 2 calls against non existing cells
      // = 5 calls total
      expect(findOne).toHaveBeenCalledTimes(5);
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
});