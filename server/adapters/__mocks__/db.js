const findOneQueue = [];

const findOne = jest.fn(() => {
  return Promise.resolve(findOneQueue.shift());
})

const __setFindOne = (newValue) => {
  findOneQueue.push(newValue)
}

const create = jest.fn((comic) => Promise.resolve(comic));

const update = jest.fn(() => Promise.resolve());

const define = () => ({
  create,
  findOne,
  update
})

const mockTransaction = {
  commit: () => {},
  rollback: () => {}
};
const transaction = (trnsctn) => {
  if (trnsctn) {
    return trnsctn(mockTransaction);
  } else {
    return Promise.resolve(mockTransaction);
  }
}

const sequelize = {
  define,
  transaction
}

module.exports = {
  sequelize,
  __mockTransaction: mockTransaction, 
  __setFindOne
}