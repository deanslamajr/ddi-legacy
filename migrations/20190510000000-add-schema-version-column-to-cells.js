'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('cells', 'schema_version', {
        type: Sequelize.INTEGER
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('cells', 'schema_version')
  }
}
