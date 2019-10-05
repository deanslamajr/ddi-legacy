'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.renameColumn('cells', 'title', 'caption', { transaction: t })
        .then(() => queryInterface.addColumn('cells', 'previous_cell_id', {
          type: Sequelize.UUID,
          references: {
            model: 'cells',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }, { transaction: t }))
        .then(() => queryInterface.addColumn('comics', 'initial_cell_id', {
          type: Sequelize.UUID,
          references: {
            model: 'cells',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }, { transaction: t }));
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.renameColumn('cells', 'title', 'caption', { transaction: t })
        .then(() => queryInterface.removeColumn('cells', 'previous_cell_id', { transaction: t }))
        .then(() => queryInterface.removeColumn('comics', 'initial_cell_id', { transaction: t }));
    })
  }
}
