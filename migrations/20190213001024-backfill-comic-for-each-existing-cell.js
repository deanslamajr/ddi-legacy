'use strict'
const shortid = require('shortid')
const { Cells } = require('../server/models')

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      // sorted by updated_at so that comic creation resembles this order
      const cells = await Cells.findAll({
        attributes: ['id', 'comic_id'],
        order: [['updated_at', 'DESC']] }
      );
      const cellsWithoutAssociatedComic = cells.filter(cell => !cell.comic_id)
      
      // For some reason, cells is always in chronological order, regardless of the order directive above
      // this one simple fix resorts the array into reverse chronological order (which is what we want!) 
      cells.reverse()
      
      return Promise.all(cellsWithoutAssociatedComic.map(async (cell) => (
        cell.createComic({
          created_at: cell.created_at,
          title: '',
          url_id: shortid.generate()
        }, { transaction: t })
      )))
    })
  },

  down: () => Promise.resolve()
}
