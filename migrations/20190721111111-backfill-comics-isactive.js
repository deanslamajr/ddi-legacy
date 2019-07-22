'use strict'

const { Comics } = require('../server/models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const comics = await Comics.findAll();

    // const response = await comics[0].update({
    //   'is_active': true
    // }, {
    //   silent: true
    // });

    // console.log('response', response)

    return Promise.all(comics.map(comic => comic.update({
      'is_active': true
    }, {
      // don't alter Comic.updated_at
      // http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-update
      silent: true
    })));
  },

  down: () => Promise.resolve()
}
