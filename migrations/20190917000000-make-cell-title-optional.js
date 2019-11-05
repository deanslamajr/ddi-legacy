'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('cells', 'title', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      const Cells = queryInterface.sequelize.define('cells',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
          },
          title: {
            type: Sequelize.STRING
          }
        },
        {
          // sequelize should not add an 's' to the end of this model to form the associated table's name
          freezeTableName: true,
          underscored: true
        }
      );

      const cells = await Cells.findAll({});

      await Promise.all(cells.map(cell => {
        if (!cell.title) {
          return cell.update({title: ''}, {
            // don't alter Cell.updated_at
            // http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update
            silent: true,
            transaction: t
          });
        }
        return Promise.resolve();
      }));  

      return queryInterface.changeColumn('cells', 'title', {
        type: Sequelize.STRING,
        allowNull: false
      }, {transaction: t});
    });
  }
}
