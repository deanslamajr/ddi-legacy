'use strict'

const { Comics } = require('../server/models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('comics', 'is_active', {
      type: Sequelize.BOOLEAN
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comics', 'is_active')
  }
}
