const axios = require('axios');
const cloneDeep = require('lodash/cloneDeep');

const {createUpdatePayload} = require('./createUpdatePayload');

const {isDraftId} = require('../../../shared/isDraftId');

jest.mock('axios');

describe('createUpdatePayload', () => {
  axios.get = jest.fn(() => Promise.resolve({data: {}}));

  const draftUrlId = 'Va_uPpdZB---draft';
  const anotherDraftUrlId = 'ldxd0itn8---draft';

  describe('unpublished comic', () => {
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
    };
  
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

    describe('if a signed cell does not exist for a given cell', () => {
      const incompleteSignedCells = [
        {
          draftId: "sIYUqmZHlN---draft",
          filename: "k_A5aAD8qK.png",
          id: "ffHbrqSDXx",
          signData: {}
        }
      ];

      it('should throw', async () => {
        await expect(createUpdatePayload({comic, signedCells: incompleteSignedCells})).rejects.toThrow()
      });
    });

    it('should add all cells from the passed comic to the payload', async () => {
      const actual = await createUpdatePayload({comic, signedCells});
      expect(actual.cells).toMatchSnapshot();
    });

    it('should set `initialCellId` to the first cell in the passed comic', async () => {
      const actual = await createUpdatePayload({comic, signedCells});
      expect(actual.initialCellUrlId).toMatchSnapshot();
    });

    it('should replace all cell draft ids with the associated is from the passed signedCells', async () => {
      const actual = await createUpdatePayload({comic, signedCells});

      actual.cells.forEach(({id}) => expect(isDraftId(id)).toBe(false));
    });
  });

  describe('published comic', () => {
    const publishedComicUrlId = 'publishedComicUrlId';
    const publishedCellUrlId = 'publishedCellUrlId';
    const publishedImageUrl = 'someImageUrl.png';
    const publishedStudioState = {
      caption: 'some caption!!!'
    };

    const localComicState = {
      initialCellUrlId: publishedCellUrlId,
      cells: {
        [publishedCellUrlId]: {
          comicUrlId: publishedComicUrlId,
          hasNewImage: false,
          isDirty: false,
          urlId: publishedCellUrlId,
          imageUrl: publishedImageUrl,
          previousCellUrlId: null,
          studioState: publishedStudioState
        }
      }
    };

    const publishedCell = {
      urlId: publishedCellUrlId,
      imageUrl: publishedImageUrl,
      order: null,
      previousCellUrlId: null,
      schemaVersion: 4,
      studioState: publishedStudioState,
      caption: 'some caption!!!'
    };

    const publishedComicGetResponse = {
      cells: [publishedCell],
      isActive: true,
      initialCellUrlId: publishedCellUrlId,
      title: '',
      urlId: publishedComicUrlId,
      userCanEdit: true
    };

    describe('adding new cells', () => {
      it('should include an item in payload.cells that represents the new cell', async () => {
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));

        const comicFromComponentState = cloneDeep(localComicState);
        comicFromComponentState.cells[anotherDraftUrlId] = {
          comicUrlId: publishedComicUrlId,
          hasNewImage: true,
          isDirty: true,
          urlId: anotherDraftUrlId,
          imageUrl: "blob:http://localhost:3000/f0065615-a3e5-4816-acb1-b85226f2ee7c",
          previousCellUrlId: publishedCellUrlId,
          studioState: {
            caption: 'another caption!!!'
          }
        };

        const signedUrlId = 'abCDefGHi';
        const signedCells = [
          {
            draftUrlId: anotherDraftUrlId,
            filename: "AD8qKk_A5a.png",
            urlId: signedUrlId,
            signData: {}
          }
        ];

        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells});
        const newCellFromPayload = actual.cells.find(({urlId}) => urlId === signedUrlId)
        expect(newCellFromPayload).toMatchSnapshot();
      });
    });

    describe('update existing cell with new image', () => {
      it('should include an item in payload.cells that represents the new cell that includes a `updateImageUrl=true`', async () => {
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));

        const comicFromComponentState = cloneDeep(localComicState);
        comicFromComponentState.cells[publishedCellUrlId].hasNewImage = true;
        comicFromComponentState.cells[publishedCellUrlId].isDirty = true;

        const signedCells = [
          {
            draftUrlId: publishedCellUrlId,
            filename: "AD8qKk_A5a.png",
            urlId: publishedCellUrlId,
            signData: {}
          }
        ];
        
        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells});
        const publishedCellToUpdate = actual.cells.find(({urlId}) => urlId === publishedCellUrlId);
        expect(publishedCellToUpdate).toHaveProperty('updateImageUrl', true);
      });
    });

    describe('update existing cell without new image', () => {
      it('should include an item in payload.cells that represents the new cell', async () => {
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));

        const comicFromComponentState = cloneDeep(localComicState);
        comicFromComponentState.cells[publishedCellUrlId].isDirty = true;
        comicFromComponentState.cells[publishedCellUrlId].studioState = {
          caption: 'this caption has been updated!'
        };

        const signedCells = [];
        
        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells});
        const publishedCellToUpdate = actual.cells.find(({urlId}) => urlId === publishedCellUrlId);
        expect(publishedCellToUpdate).toMatchSnapshot();
        expect(publishedCellToUpdate).not.toHaveProperty('updateImageUrl');
      });
    });

    describe('if published comic`s cells are all from schemaVersion <4', () => {
      it('should convert all cells to the latest schemaVersion', () => {
        // schemaVersion and order need to be updated
        throw new Error('implement test!')
      });
    });

    describe('if `initialCellUrlId` has not changed', () => {
      it('payload should not include `initialCellUrlId`', async () => {
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));
  
        const comicFromComponentState = cloneDeep(localComicState);
        comicFromComponentState.cells[publishedCellUrlId].isDirty = true;
  
        const signedCells = [];
        
        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells});
        
        expect(actual).not.toHaveProperty('initialCellUrlId');
      });
    });

    describe('if `initialCellUrlId` has changed', () => {
      it('payload should include `initialCellUrlId`', async () => {
        const publishedCellThatIsNowInitialCellUrlId = 'publishedCellThatIsNowInitialCellUrlId';
        const publishedCellThatIsNowInitialCellImageUrl = 'publishedCellThatIsNowInitialCellUrlId.png';
        const caption = 'hahah caption.';

        const publishedComics = cloneDeep(publishedComicGetResponse);
        publishedComics.cells.push(
          {
            urlId: publishedCellThatIsNowInitialCellUrlId,
            imageUrl: publishedCellThatIsNowInitialCellImageUrl,
            previousCellUrlId: publishedCellUrlId,
            schemaVersion: 4,
            studioState: {
              caption
            },
            caption
          }
        )
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComics}));

        const publishedCellThatIsNowInitialCell = {
          comicUrlId: publishedComicUrlId,
          hasNewImage: false,
          isDirty: false,
          urlId: publishedCellThatIsNowInitialCellUrlId,
          imageUrl: publishedCellThatIsNowInitialCellImageUrl,
          previousCellUrlId: null,
          studioState: {
            caption
          }
        }
  
        const comicFromComponentState = cloneDeep(localComicState);
        comicFromComponentState.cells[publishedCellUrlId].isDirty = true;
        comicFromComponentState.cells[publishedCellUrlId].previousCellUrlId = publishedCellThatIsNowInitialCellUrlId;

        comicFromComponentState.cells[publishedCellThatIsNowInitialCellUrlId] = publishedCellThatIsNowInitialCell;

        comicFromComponentState.initialCellUrlId = publishedCellThatIsNowInitialCellUrlId;
  
        const signedCells = [];
        
        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells});
        
        expect(actual).toHaveProperty('initialCellUrlId', publishedCellThatIsNowInitialCellUrlId);
      });
    });

    it('should only include changes to a cell in the payload', async () => {
      axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));

      const comicFromComponentState = cloneDeep(localComicState);
      comicFromComponentState.cells[publishedCellUrlId].isDirty = true;

      const actual = await createUpdatePayload({isPublishedComic: true, comic: comicFromComponentState, signedCells: []});

      const publishedCellToUpdate = actual.cells.find(({urlId}) => urlId === publishedCellUrlId);
      
      expect(publishedCellToUpdate).not.toHaveProperty('previousCellUrlId');
      expect(publishedCellToUpdate).not.toHaveProperty('caption');
      expect(publishedCellToUpdate).not.toHaveProperty('studioState');
    });
  });
});