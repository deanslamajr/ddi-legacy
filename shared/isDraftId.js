const {DRAFT_SUFFIX} = require('../config/constants.json')

function isDraftId(comicId = '') {
  if (comicId === null) {
    return false;
  }
  
  return comicId.includes(DRAFT_SUFFIX);
}

module.exports = {
  isDraftId
};