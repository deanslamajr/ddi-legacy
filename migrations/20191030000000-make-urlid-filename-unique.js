'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      const migrations = [];
      
      migrations.push(
        queryInterface.addConstraint('comics', ['url_id'], {
          type: 'unique',
          name: 'comics_url_id_unique',
          transaction: t
        }),
        queryInterface.addConstraint('cells', ['url_id'], {
          type: 'unique',
          name: 'cells_url_id_unique',
          transaction: t
        }),
        queryInterface.addConstraint('cells', ['image_url'], {
          type: 'unique',
          name: 'cells_image_url_unique',
          transaction: t
        })
      );

      await Promise.all(migrations);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      const migrations = [];
      
      migrations.push(
        queryInterface.removeConstraint('comics', 'comics_url_id_unique', {transaction: t}),
        queryInterface.removeConstraint('cells', 'cells_url_id_unique', {transaction: t}),
        queryInterface.removeConstraint('cells', 'cells_image_url_unique', {transaction: t})
      );

      await Promise.all(migrations);
    });
  }
}
