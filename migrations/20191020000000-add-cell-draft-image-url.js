'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cells', 'draft_image_url', {
      type: Sequelize.STRING
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('cells', 'draft_image_url')
  }
}
