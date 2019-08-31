import store from 'store2';
import {
  createNewCell,
  doesCellIdExist,
  doesComicIdExist,
  setCellStudioState
} from './clientCache';

jest.mock('store2');

describe('clientCache', () => {
  describe('doesCellIdExist', () => {
    const someId = 'someId';

    beforeEach(() => {
      const cache = {
        cells: {
          [someId]: {}
        }
      };

      store('', cache);
    });

    it('should return false if cellId doesnt exist in cache', () => {
      expect(doesCellIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellId exists in cache', () => {
      expect(doesCellIdExist(someId)).toBe(true);
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
    const someId = 'someId';

    beforeEach(() => {
      const cache = {
        comics: {
          [someId]: {}
        }
      };

      store('', cache);
    });

    it('should return false if cellId doesnt exist in cache', () => {
      expect(doesComicIdExist('shouldNotExist')).toBe(false);
    });

    it('should return true if cellId exists in cache', () => {
      expect(doesComicIdExist(someId)).toBe(true);
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
    const cellId = 'someCellId';

    beforeEach(() => {
      const cache = {
        cells: {
          [cellId]: {}
        }
      };

      store('', cache);
    });

    it('should set the given cell`s studio state with the given studio state', () => {
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

      setCellStudioState(cellId, newStudioState);

      const updatedCache = store('');

      expect(updatedCache.cells[cellId]).toBe(newStudioState);
    });

    xdescribe('if the given cellId doesn`t exist in cache', () => {
      it('should add a new cell to the cache with the given cellId', () => {

      });

      it('should create a new comic and add the new cell to this comic', () => {

      });
    });

    xdescribe('if cache does not exist', () => {
      it('should create a cache object', () => {

      })
    });

    xdescribe('if cache does not have `cells` field', () => {
      it('should create a `cells` field', () => {

      });
    });

    xdescribe('if cache does not have `comics` field', () => {
      it('should create a `comics` field', () => {

      });
    });
  });

  describe('createNewCell', () => {
    beforeEach(() => {
      const cache = {
        comics: {},
        cells: {}
      };

      store('', cache);
    });

    it('creates a new cell in the cache', () => {
      const originalCellsCount = Object.keys(store('').cells).length;
      createNewCell();
      const newCellsCount = Object.keys(store('').cells).length;
      expect(newCellsCount).toBe(originalCellsCount + 1);
    });

    it('associates the new cell with the given comic', () => {
      const someComicId = 'someComicId';
      const mockCache = {
        comics: {
          [someComicId]: {
            cells: []
          }
        },
        cells: {}
      };
      store('', mockCache);

      const newCellId = createNewCell(someComicId);

      const cache = store('');
      expect(cache.comics[someComicId].cells.includes(newCellId)).toBe(true);
    });

    it('returns the new cell`s cellId', () => {
      const newCellId = createNewCell();
      const cache = store('');

      expect(newCellId).toBe(Object.keys(cache.cells)[0]);
    });

    describe('if no comicId is passed', () => {
      it('creates a new comic', () => {
        const newCellId = createNewCell();
        const cache = store('');

        expect(Object.keys(cache.comics).length).toBe(1);
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
});