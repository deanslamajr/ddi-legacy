const signData = {
  signedRequest: 'signedRequest',
  url: 'url'
};
const sign = jest.fn(() => Promise.resolve(signData))

module.exports = {
  sign
};