const findOneQueue = [];

const findOne = jest.fn(() => {
  return Promise.resolve(findOneQueue.shift());
})

const __setFindOne = (newValue) => {
  findOneQueue.push(newValue)
}

const create = jest.fn(() => Promise.resolve());

const define = () => ({
  create,
  findOne
})

const sequelize = {
  define
}

module.exports = {
  sequelize,
  __setFindOne
}