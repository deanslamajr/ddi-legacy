const findOneQueue = [];

const findOne = jest.fn(() => {
  return Promise.resolve(findOneQueue.shift());
})

const __setFindOne = (newValue) => {
  findOneQueue.push(newValue)
}

const create = jest.fn((comic) => Promise.resolve(comic));

const define = () => ({
  create,
  findOne
})

const mockTransaction = 'mockTransaction';
const transaction = (trnsctn) => trnsctn(mockTransaction)

const sequelize = {
  define,
  transaction
}

module.exports = {
  sequelize,
  __setFindOne
}