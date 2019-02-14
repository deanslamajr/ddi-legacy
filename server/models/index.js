const Comics = require('./Comics')
const Cells = require('./Cells')

Comics.hasMany(Cells)
Cells.hasOne(Cells, { foreignKey: 'parent_id' })
Cells.belongsTo(Comics)

module.exports = {
  Comics,
  Cells
}
