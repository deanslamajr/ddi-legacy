const axios = require('axios');

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

    const publishedCell = {
      urlId: publishedCellUrlId,
      imageUrl: 'someImageUrl.png',
      order: undefined,
      previousCellId: undefined,
      schemaVersion: 4,
      studioState: {
        caption: 'some caption!!!'
      },
      caption: 'some caption!!!'
    };

    const publishedComicGetResponse = {
      cells: [publishedCell],
      isActive: true,
      initialCellUrlId: draftUrlId,
      title: '',
      urlId: publishedComicUrlId,
      userCanEdit: true
    };

    const localComicState = {
      initialCellUrlId: publishedCellUrlId,
      cells: {
        [publishedCellUrlId]: {
          comicUrlId: publishedComicUrlId,
          hasNewImage: false,
          isDirty: false,
          urlId: publishedCellUrlId,
          imageUrl: 'someImageUrl.png',
          previousCellUrlId: null,
          studioState: {
            caption: 'some caption!!!'
          }
        },
        [anotherDraftUrlId]: {
          comicUrlId: publishedComicUrlId,
          hasNewImage: true,
          isDirty: true,
          urlId: anotherDraftUrlId,
          imageUrl: "blob:http://localhost:3000/f0065615-a3e5-4816-acb1-b85226f2ee7c",
          previousCellUrlId: publishedCellUrlId,
          studioState: {
            caption: 'another caption!!!'
          }
        }
      }
    };

    const signedCells = [
      {
        draftUrlId: anotherDraftUrlId,
        filename: "AD8qKk_A5a.png",
        urlId: "abCDefGHi",
        signData: {}
      }
    ];

    describe('adding new cells', () => {
      it('should include an item in payload.cells that represents the new cell', async () => {
        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));

        const actual = await createUpdatePayload({isPublishedComic: true, comic: localComicState, signedCells});
        expect(actual.cells).toMatchSnapshot();
      });
    });

    describe('update existing cell with new image', () => {
      it('should include an item in payload.cells that represents the new cell that includes a `updateImageUrl=true`', async () => {
        const somePublishedCellUrlId = 'somePublishedCellUrlId';
        const anotherPublishedCellUrlId = 'anotherPublishedCellUrlId';

        const comicStateWithUpdateToPublishedCell = {
          initialCellUrlId: publishedCellUrlId,
          cells: {
            [publishedCellUrlId]: {
              comicUrlId: publishedComicUrlId,
              hasNewImage: false,
              isDirty: false,
              urlId: publishedCellUrlId,
              imageUrl: 'someImageUrl.png',
              previousCellUrlId: null,
              studioState: {
                caption: 'some caption!!!'
              }
            },
            [anotherPublishedCellUrlId]: {
              comicUrlId: publishedComicUrlId,
              hasNewImage: false,
              isDirty: false,
              urlId: anotherPublishedCellUrlId,
              imageUrl: "anotherImageUrl.png",
              previousCellUrlId: publishedCellUrlId,
              studioState: {
                caption: 'another caption!!!'
              }
            },
            [somePublishedCellUrlId]: {
              comicUrlId: publishedComicUrlId,
              hasNewImage: true,
              isDirty: true,
              urlId: somePublishedCellUrlId,
              imageUrl: 'somePublishedImageUrl.png',
              previousCellUrlId: anotherPublishedCellUrlId,
              studioState: {
                caption: 'blah blah blah'
              }
            }
          }
        }

        const signedCells = [
          {
            draftUrlId: somePublishedCellUrlId,
            filename: "AD8qKk_A5a.png",
            urlId: somePublishedCellUrlId,
            signData: {}
          }
        ];

        const publishedCells = [{
          urlId: anotherPublishedCellUrlId,
          imageUrl: 'someImageUrl.png',
          order: undefined,
          previousCellId: undefined,
          schemaVersion: 4,
          studioState: {
            caption: 'some caption!!!'
          },
          caption: 'some caption!!!'
        }];
    
        const publishedComicGetResponse = {
          cells: publishedCells,
          isActive: true,
          initialCellUrlId: publishedCellUrlId,
          title: '',
          urlId: publishedComicUrlId,
          userCanEdit: true
        };

        axios.get.mockImplementationOnce(() => Promise.resolve({data: publishedComicGetResponse}));
        
        const actual = await createUpdatePayload({isPublishedComic: true, comic: comicStateWithUpdateToPublishedCell, signedCells});
        const publishedCellToUpdate = actual.cells.find(({urlId}) => urlId === somePublishedCellUrlId);
        expect(publishedCellToUpdate).toHaveProperty('updateImageUrl', true);
      });
    });

    describe('update existing cell without new image', () => {
      it('should include an item in payload.cells that represents the new cell', async () => {
        throw new Error('implement test')
      });
    });

    describe('if published comic`s cells are all from schemaVersion <4', () => {
      it('should convert all cells to the latest schemaVersion', () => {
        throw new Error('implement test!')
      });
    });

    it('should only include `initialCellUrlId` if it has changed', () => {
      throw new Error('implement test')
    });

    it('should only include changes in the payload', () => {
      throw new Error('implement test')
    });
  });
});