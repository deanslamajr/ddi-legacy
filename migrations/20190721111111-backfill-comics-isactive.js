'use strict'

const { Comics } = require('../server/models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async t => {
      const comics = await Comics.findAll({attributes: ['id']});

      return Promise.all(comics.map(comic => comic.update({
        'is_active': true
      }, {
        // don't alter Comic.updated_at
        // http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update
        silent: true,
        transaction: t
      })));
    });
  },

  down: () => Promise.resolve()
}
