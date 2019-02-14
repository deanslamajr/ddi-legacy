'use strict'
const shortid = require('shortid')
const { Cells } = require('../server/models')

module.exports = {
  up: async () => {
      // sorted by updated_at so that comic creation resembles this order
      const cells = await Cells.findAll({ order: [['updated_at', 'DESC']] })
      const cellsWithoutAssociatedComic = cells.filter(cell => !cell.comic_id)
      
      return Promise.all(cellsWithoutAssociatedComic.map(async (cell) => (
        cell.createComic({
          created_at: cell.created_at,
          title: '',
          url_id: shortid.generate()
        })
      )))
  },

  down: () => Promise.resolve()
}
