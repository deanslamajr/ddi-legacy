'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.createTable(
        'comics',
        {
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE,
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
          },
          url_id: {
            type: Sequelize.STRING,
            allowNull: false
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false
          },
          creator_user_id: {
            type: Sequelize.STRING
          }
        }, 
        { transaction: t }
      )
        .then(() => queryInterface.addColumn('cells', 'comic_id', {
          type: Sequelize.UUID,
          references: {
            model: 'comics',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }, { transaction: t }))
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return queryInterface.removeColumn('cells', 'comic_id', { transaction: t })
        .then(() => queryInterface.dropTable('comics', { transaction: t }))
    })
  }
}
