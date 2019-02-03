const Cells = require('./Cells')

Cells.hasOne(Cells, { foreignKey: 'parent_id' })

module.exports = {
  Cells
}
