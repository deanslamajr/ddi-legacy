'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cells', 'title', { type: Sequelize.STRING })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('cells', 'title')
  }
}
