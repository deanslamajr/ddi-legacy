const createNewCell = jest.fn();
const newComicId = 'newComicId';
const createNewComic = jest.fn(() => Promise.resolve({comicId: newComicId}));

const Cells = {
  createNewCell
}

const Comics = {
  createNewComic,
  findOne: jest.fn()
}

const index = {
  Cells,
  Comics
}

module.exports = index;