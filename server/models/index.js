const Comics = require('./Comics')
const Cells = require('./Cells')
const Users = require('./Users')

Comics.hasMany(Cells)
Cells.hasOne(Cells, { foreignKey: 'parent_id' })
Cells.belongsTo(Comics)

module.exports = {
  Comics,
  Cells,
  Users
}
