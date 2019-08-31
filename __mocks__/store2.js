let mockCache = {};

const store = (...args) => {
  // setter
  if (args.length === 1) {
    return mockCache;
  }
  else if (args.length === 2) {
    mockCache = args[1];
  }
  else {
    throw new Error('improper use of mock store');
  }
}

module.exports = store;