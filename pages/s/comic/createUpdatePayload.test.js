const {createUpdatePayload} = require('./createUpdatePayload');

const {isDraftId} = require('../../../shared/isDraftId');

describe('createUpdatePayload', () => {
  const draftUrlId = 'Va_uPpdZB---draft';
  const anotherDraftUrlId = 'ldxd0itn8---draft';
  const comic = {
    initialCellUrlId: draftUrlId,
    cells: {
      [draftUrlId]: {
        comicUrlId: "CL1fWeSIe---draft",
        hasNewImage: true,
        urlId: draftUrlId,
        imageUrl: "blob:http://localhost:3000/f0065615-a3e5-4816-acb1-b85226f2ee7c",
        previousCellUrlId: null,
        studioState: {
          caption: 'some caption!!!'
        }
      },
      [anotherDraftUrlId]: {
        comicUrlId: "CL1fWeSIe---draft",
        hasNewImage: true,
        urlId: anotherDraftUrlId,
        imageUrl: "blob:http://localhost:3000/f0065615-a3e5-4816-acb1-b85226f2ee7c",
        previousCellUrlId: draftUrlId,
        studioState: {
          caption: 'some caption!!!'
        }
      }
    }
  }

  const signedCells = [
    {
      draftUrlId,
      filename: "k_A5aAD8qK.png",
      urlId: "ffHbrqSDXx",
      signData: {}
    },
    {
      draftUrlId: anotherDraftUrlId,
      filename: "AD8qKk_A5a.png",
      urlId: "abCDefGHi",
      signData: {}
    }
  ];

  describe('if publishedComic does not exist i.e. initial publish of this comic', () => {
    const publishedComic = undefined;

    describe('if a signed cell does not exist for a given cell', () => {
      const incompleteSignedCells = [
        {
          draftId: "sIYUqmZHlN---draft",
          filename: "k_A5aAD8qK.png",
          id: "ffHbrqSDXx",
          signData: {}
        }
      ];

      it('should throw', () => {
        expect(() => {
          createUpdatePayload({comic, publishedComic, signedCells: incompleteSignedCells});
        }).toThrow();
      });
    });

    it('should add all cells from the passed comic to the payload', () => {
      const actual = createUpdatePayload({comic, publishedComic, signedCells});
      expect(actual.cells).toMatchSnapshot();
    });

    it('should set `initialCellId` to the first cell in the passed comic', () => {
      const actual = createUpdatePayload({comic, publishedComic, signedCells});
      expect(actual.initialCellUrlId).toMatchSnapshot();
    });

    it('should replace all cell draft ids with the associated is from the passed signedCells', () => {
      const actual = createUpdatePayload({comic, publishedComic, signedCells});

      actual.cells.forEach(({id}) => expect(isDraftId(id)).toBe(false));
    });
  });
});