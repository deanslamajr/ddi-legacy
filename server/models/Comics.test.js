const {createNewComic} = require('./Comics');
const {sequelize, __setFindOne} = require('../adapters/db');

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
      const mockedExistingComics = [
        'some', 'existing', 'cells'
      ];

      // set Comics.create mock
      mockedExistingComics.forEach(mockComic => __setFindOne(mockComic));

      await createNewComic({});

      // 3 calls against existing cells, either
      //   * Comics.findOne({ where: { url_id: urlId }})
      // 1 call against non existing cells
      // = 4 calls total
      expect(findOne).toHaveBeenCalledTimes(mockedExistingComics.length + 1);
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