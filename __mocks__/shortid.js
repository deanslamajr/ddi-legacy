const defaultMockedId = 'mockGeneratdId';
let mockIds = [];

const __setIds = (ids = []) => {
  mockIds = ids;
}

const generate = () => {
  if (mockIds && mockIds.length) {
    return mockIds.pop();
  } else {
    return defaultMockedId;
  }
}

const shortid = {
  generate,
  __setIds
}

module.exports = shortid;