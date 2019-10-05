import store from 'store2';
import cloneDeep from 'lodash/cloneDeep';
import {
  createNewCell,
  deleteCell,
  doesCellUrlIdExist,
  doesComicUrlIdExist,
  getComic,
  getComicUrlIdFromCellUrlId,
  setCellStudioState
} from './clientCache';

jest.mock('store2');

describe('clientCache', () => {
  const mockComicUrlId = 'mockComicUrlId';
  const mockCellUrlId = 'mockCellUrlId';

  const mockCell = {
    comicUrlId: mockComicUrlId,
    urlId: mockCellUrlId,
    studioState: {}
  };

  const mockComic = {
    initialCellUrlId: mockCellUrlId
  };

  const mockCache = {
    comics: {
      [mockComicUrlId]: mockComic
    },
    cells: {
      [mockCellUrlId]: mockCell
    }
  };

  beforeEach(() => {
    store('', cloneDeep(mockCache));
  });

  describe('doesCellUrlIdExist', () => {
    it('should return false if cellUrlId doesnt exist in cache', () => {
      expect(doesCellUrlIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellUrlId exists in cache', () => {
      expect(doesCellUrlIdExist(mockCellUrlId)).toBe(true);
    });

    describe('if cache does not exist', () => {
      it('should return false', () => {
        store('', null);
        expect(doesCellUrlIdExist('shouldNotExist')).toBe(false);
      })
    });

    describe('if cache does not have `cells` field', () => {
      it('should return false', () => {
        store('', {});
        expect(doesCellUrlIdExist('shouldNotExist')).toBe(false);
      });
    });
  });

  describe('doesComicUrlIdExist', () => {
    it('should return false if cellUrlId doesnt exist in cache', () => {
      expect(doesComicUrlIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellUrlId exists in cache', () => {
      expect(doesComicUrlIdExist(mockComicUrlId)).toBe(true);
    });

    describe('if cache does not exist', () => {
      it('should return false', () => {
        store('', null);
        expect(doesComicUrlIdExist('shouldNotExist')).toBe(false);
      })
    });

    describe('if cache does not have `cells` field', () => {
      it('should return false', () => {
        store('', {});
        expect(doesComicUrlIdExist('shouldNotExist')).toBe(false);
      });
    });
  });

  describe('setCellStudioState', () => {
    const newStudioState = {
      backgroundColor: '#fff',
      caption: '',
      currentEmojiId: 2,
      emojis: {"1": {
        "emoji": "👨‍🔬",
        "id": 1,
        "order": 1,
        "x": 100,
        "y": 100,
        "scaleX": 1,
        "scaleY": 1,
        "rotation": 0,
        "size": 100,
        "alpha": 0.5,
        "red": 125,
        "green": 0,
        "blue": 0,
        "opacity": 1
      }}
    };

    it('should set the given cell`s studio state with the given studio state', () => {
      setCellStudioState(mockCellUrlId, newStudioState);

      const updatedCache = store('');

      expect(updatedCache.cells[mockCellUrlId].studioState).toBe(newStudioState);
    });
  });

  describe('createNewCell', () => {
    it('creates a new cell in the cache', () => {
      const originalCellsCount = Object.keys(store('').cells).length;
      createNewCell('someThrowawayComicId');
      const newCellsCount = Object.keys(store('').cells).length;
      expect(newCellsCount).toBe(originalCellsCount + 1);
    });

    it('returns the new cell`s cellUrlId', () => {
      const newCellUrlId = createNewCell();
      const cache = store('');

      expect(Object.keys(cache.cells).includes(newCellUrlId)).toBe(true);
    });

    it('sets the new cell`s previousCellUrlId field properly', () => {
      const newCellUrlId = createNewCell(mockComicUrlId);
      const cache = store('');
      expect(cache.cells[newCellUrlId].previousCellUrlId).toBe(mockCellUrlId);
    })

    describe('if this is a new cell for a new comic', () => {
      it('sets the associated comic`s initialCellUrlId field to this cellUrlId', () => {
        store('', null);
  
        const newCellUrlId = createNewCell();
  
        const cache = store('');

        expect(Object.values(cache.comics)[0].initialCellUrlId).toBe(newCellUrlId);
      });
    })

    describe('if no comicUrlId is passed', () => {
      it('creates a new comic', () => {
        const originalCellsCount = Object.keys(store('').cells).length;
        createNewCell('someNewCellUrlId');
        const newCellsCount = Object.keys(store('').cells).length;
        expect(newCellsCount).toBe(originalCellsCount + 1);
      });
    });

    describe('if cache does not exist', () => {
      it('should create a cache object', () => {
        store('', null);
        createNewCell();
        const cache = store('');
        expect(cache).not.toBeNull();
      })
    });

    describe('if cache does not have `cells` field', () => {
      it('should create a `cells` field', () => {
        store('', {});
        createNewCell();
        const cache = store('');
        expect(cache.cells).toBeDefined();
      });
    });

    describe('if cache does not have `comics` field', () => {
      it('should create a `comics` field', () => {
        store('', {});
        createNewCell();
        const cache = store('');
        expect(cache.comics).toBeDefined();
      });
    });
  });

  describe('getComicUrlIdFromCellUrlId', () => {
    it('should return the comicUrlId of the comic that the given cellUrlId is associated with', () => {
      expect(getComicUrlIdFromCellUrlId(mockCellUrlId)).toBe(mockComicUrlId);
    });

    describe('if cellUrlId does not exist in client cache', () => {
      it('should return null', () => {
        expect(getComicUrlIdFromCellUrlId('someNonExistentCellUrlId')).toBeNull();
      });
    })
  });

  describe('deleteCell', () => {
    it('should remove the cell from the cache', () => {
      const newCellUrlId = createNewCell(mockComicUrlId);
      deleteCell(newCellUrlId);

      const cache = store('');
      expect(cache.cells[newCellUrlId]).toBeUndefined();
    });

    describe('if the associated comic has 0 cells after this removal', () => {
      it('should delete the comic', () => {
        const newCellUrlId = createNewCell(mockComicUrlId);
        deleteCell(mockCellUrlId);

        expect(store('').comics[mockComicUrlId]).toBeDefined();

        deleteCell(newCellUrlId);

        expect(store('').comics[mockComicUrlId]).toBeUndefined();
      });
    });

    describe('if the comic has more than a single cell and this cell was the first cell of the comic', () => {
      it('should set comic.initialCellUrlId correctly', () => {
        const newCellUrlId = createNewCell(mockComicUrlId);
        deleteCell(mockCellUrlId);

        const comic = store('').comics[mockComicUrlId];

        expect(comic.initialCellUrlId).toBe(newCellUrlId);
      });
    })
  });

  describe('getComic', () => {
    const comicUrlIdThatDoesNotExist = 'comicUrlIdThatDoesNotExist';

    it('should return the comic datastructure', () => {
      const comic = getComic(mockComicUrlId);
      expect(comic).toEqual(mockComic);
    });

    describe('if comicUrlId does not exist in cache', () => {
      it('should return null', () => {
        const comic = getComic(comicUrlIdThatDoesNotExist);
        expect(comic).toEqual(null);
      });
    });

    describe('if cache doesn`t exist', () => {
      it('should return null', () => {
        store('', undefined);
        const comic = getComic(comicUrlIdThatDoesNotExist);
        expect(comic).toEqual(null);
      });
    });

    describe('if cache.comics doesn`t exist', () => {
      it('should return null', () => {
        store('', {});
        const comic = getComic(comicUrlIdThatDoesNotExist);
        expect(comic).toEqual(null);
      });
    });
  });
});