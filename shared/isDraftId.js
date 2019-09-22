const {DRAFT_SUFFIX} = require('../config/constants.json')

function isDraftId(comicId = '') {
  return comicId.includes(DRAFT_SUFFIX);
}

module.exports = {
  isDraftId
};