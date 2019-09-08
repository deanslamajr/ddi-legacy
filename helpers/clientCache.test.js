import store from 'store2';
import cloneDeep from 'lodash/cloneDeep';
import {
  createNewCell,
  deleteCell,
  doesCellIdExist,
  doesComicIdExist,
  getComic,
  getComicIdFromCellId,
  setCellStudioState
} from './clientCache';

jest.mock('store2');

describe('clientCache', () => {
  const mockComicId = 'mockComicId';
  const mockCellId = 'mockCellId';

  const mockCell = {
    comicId: mockComicId,
    id: mockCellId,
    studioState: {}
  };

  const mockComic = {
    initialCellId: mockCellId
  };

  const mockCache = {
    comics: {
      [mockComicId]: mockComic
    },
    cells: {
      [mockCellId]: mockCell
    }
  };

  beforeEach(() => {
    store('', cloneDeep(mockCache));
  });

  describe('doesCellIdExist', () => {
    it('should return false if cellId doesnt exist in cache', () => {
      expect(doesCellIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellId exists in cache', () => {
      expect(doesCellIdExist(mockCellId)).toBe(true);
    });

    describe('if cache does not exist', () => {
      it('should return false', () => {
        store('', null);
        expect(doesCellIdExist('shouldNotExist')).toBe(false);
      })
    });

    describe('if cache does not have `cells` field', () => {
      it('should return false', () => {
        store('', {});
        expect(doesCellIdExist('shouldNotExist')).toBe(false);
      });
    });
  });

  describe('doesComicIdExist', () => {
    it('should return false if cellId doesnt exist in cache', () => {
      expect(doesComicIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellId exists in cache', () => {
      expect(doesComicIdExist(mockComicId)).toBe(true);
    });

    describe('if cache does not exist', () => {
      it('should return false', () => {
        store('', null);
        expect(doesComicIdExist('shouldNotExist')).toBe(false);
      })
    });

    describe('if cache does not have `cells` field', () => {
      it('should return false', () => {
        store('', {});
        expect(doesComicIdExist('shouldNotExist')).toBe(false);
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
      setCellStudioState(mockCellId, newStudioState);

      const updatedCache = store('');

      expect(updatedCache.cells[mockCellId].studioState).toBe(newStudioState);
    });
  });

  describe('createNewCell', () => {
    it('creates a new cell in the cache', () => {
      const originalCellsCount = Object.keys(store('').cells).length;
      createNewCell('someThrowawayComicId');
      const newCellsCount = Object.keys(store('').cells).length;
      expect(newCellsCount).toBe(originalCellsCount + 1);
    });

    it('returns the new cell`s cellId', () => {
      const newCellId = createNewCell();
      const cache = store('');

      expect(Object.keys(cache.cells).includes(newCellId)).toBe(true);
    });

    it('sets the new cell`s previousCellId field properly', () => {
      const newCellId = createNewCell(mockComicId);
      const cache = store('');
      expect(cache.cells[newCellId].previousCellId).toBe(mockCellId);
    })

    describe('if this is a new cell for a new comic', () => {
      it('sets the associated comic`s initialCellId field to this cellId', () => {
        store('', null);
  
        const newCellId = createNewCell();
  
        const cache = store('');

        expect(Object.values(cache.comics)[0].initialCellId).toBe(newCellId);
      });
    })

    describe('if no comicId is passed', () => {
      it('creates a new comic', () => {
        const originalCellsCount = Object.keys(store('').cells).length;
        createNewCell('someNewCellId');
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

  describe('getComicIdFromCellId', () => {
    it('should return the comicId of the comic that the given cellId is associated with', () => {
      expect(getComicIdFromCellId(mockCellId)).toBe(mockComicId);
    });

    describe('if cellId does not exist in client cache', () => {
      it('should return null', () => {
        expect(getComicIdFromCellId('someNonExistentCellId')).toBeNull();
      });
    })
  });

  describe('deleteCell', () => {
    it('should remove the cell from the cache', () => {
      const newCellId = createNewCell(mockComicId);
      deleteCell(newCellId);

      const cache = store('');
      expect(cache.cells[newCellId]).toBeUndefined();
    });

    describe('if the associated comic has 0 cells after this removal', () => {
      it('should delete the comic', () => {
        const newCellId = createNewCell(mockComicId);
        deleteCell(mockCellId);

        expect(store('').comics[mockComicId]).toBeDefined();

        deleteCell(newCellId);

        expect(store('').comics[mockComicId]).toBeUndefined();
      });
    });

    describe('if the comic has more than a single cell and this cell was the first cell of the comic', () => {
      it('should set comic.initialCellId correctly', () => {
        const newCellId = createNewCell(mockComicId);
        deleteCell(mockCellId);

        const comic = store('').comics[mockComicId];

        expect(comic.initialCellId).toBe(newCellId);
      });
    })
  });

  describe('getComic', () => {
    it('should return the comic datastructure', () => {
      const comic = getComic(mockComicId);
      expect(comic).toEqual(mockComic);
    });

    describe('if comicId does not exist in cache', () => {
      it('should return null', () => {
        const comic = getComic('comicIdThatDoesNotExist');
        expect(comic).toEqual(null);
      });
    });

    describe('if cache doesn`t exist', () => {
      it('should return null', () => {
        store('', undefined);
        const comic = getComic('comicIdThatDoesNotExist');
        expect(comic).toEqual(null);
      });
    });

    describe('if cache.comics doesn`t exist', () => {
      it('should return null', () => {
        store('', {});
        const comic = getComic('comicIdThatDoesNotExist');
        expect(comic).toEqual(null);
      });
    });
  });
});