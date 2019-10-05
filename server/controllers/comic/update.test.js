const {update} = require('./update');
const {Comics} = require('../../models')

jest.mock('../../models');

describe('controllers/comic/update', () => {
  const comicId = 'comicId';
  const userId = 'userId';
  const initialCellUrlId = 'initialCellUrlId';
  const initialCellId = 'initialCellId';
  const someExistingId = 'someExistingId';
  const someExistingUrlId = 'someExistingUrlId';

  const sendStatus = jest.fn();
  const updateComic = jest.fn();
  const updateCell = jest.fn();

  const cellsOnComic = [
    {
      id: initialCellId,
      url_id: initialCellUrlId,
      update: updateCell
    },
    {
      id: someExistingId,
      url_id: someExistingUrlId,
      update: updateCell
    }
  ];

  const studioState = {};
  const cellsToUpdate = [
    {
      studioState,
      caption: "some caption",
      previousCellUrlId: undefined,
      urlId: initialCellUrlId
    },
    {
      studioState,
      "caption": "some caption",
      previousCellUrlId: initialCellUrlId,
      urlId: someExistingUrlId
    }
  ];

  const getCells = async () => cellsOnComic;

  const mockComic = {
    creator_user_id: userId,
    getCells,
    update: updateComic
  }

  const session = {
    isAdmin: false,
    userId
  };

  const body = {
    initialCellUrlId,
    cells: cellsToUpdate
  }

  const req = {
    body,
    params: {
      comicId
    },
    session
  };
  const res = {
    sendStatus
  };

  Comics.findOne.mockImplementation(() => Promise.resolve(mockComic));

  beforeEach(() => {
    sendStatus.mockClear();
    updateComic.mockClear();
    updateCell.mockClear();
  });

  describe(`if given comic doesn't exist`, () => {
    it('should respond with 200 status', async () => {
      Comics.findOne.mockImplementationOnce(() => Promise.resolve());
      
      await update(req, res);

      expect(sendStatus.mock.calls[0][0]).toBe(200);
    });
  });

  describe(`if user doesn't have permission to update the given comic`, () => {
    it('should respond with 200 status', async () => {
      const mockedReq = {
        ...req,
        session: {
          ...session,
          userId: 'someOtherUser'
        }
      }
      
      await update(mockedReq, res);

      expect(sendStatus.mock.calls[0][0]).toBe(200);
    });
  });

  describe('if initialCellUrlId is included in the payload', () => {
    it('should make an update to the passed comic, including setting is_active to true', async () => {
      await update(req, res);

      expect(updateComic).toHaveBeenCalledWith({is_active: true, initial_cell_id: initialCellId});
    });

    describe('if the initialCellUrlId does NOT exist on the given comic', () => {
      it('should return 500 status code', async () => {
        const reqWithBadInitialCellUrlId = {
          ...req,
          body: {
            ...body,
            initialCellUrlId: 'notAValidUrlId'
          }
        };

        await update(reqWithBadInitialCellUrlId, res);

        expect(sendStatus.mock.calls[0][0]).toBe(500);
      });
    });
  });

  it('should make an update to each cell that is included in the `cell` field of the payload', async () => {
    await update(req, res);

    expect(updateCell).toHaveBeenCalledTimes(cellsToUpdate.length);
  })

  describe('if any of the cells included in the payload do not exist on the comic', () => {
    it('should return 500 status code', async () => {
      const mockedReq = {
        ...req,
        body: {
          ...body,
          cells: [
            ...cellsToUpdate,
            {
              urlId: 'anIdthatDoesntExistOnComic'
            }
          ]
        }
      };

      await update(mockedReq, res);

      expect(sendStatus).toHaveBeenCalledWith(500);
    });
  });
});