'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cells', 'order', {
        type: Sequelize.INTEGER
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('cells', 'order')
  }
}
