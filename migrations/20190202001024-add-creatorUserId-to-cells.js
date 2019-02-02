'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.addColumn('cells', 'creator_user_id', { type: Sequelize.STRING }, { transaction: t })
        .then(() => queryInterface.addColumn('cells', 'studio_state', { type: Sequelize.JSON }, { transaction: t }))
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn('cells', 'creator_user_id', { transaction: t })
        .then(() => queryInterface.removeColumn('cells', 'studio_state', { transaction: t }))
    })
  }
}
