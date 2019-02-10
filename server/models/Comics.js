const Sequelize = require('sequelize')

const { sequelize } = require('../adapters/db')

const Comics = sequelize.define('comics',
  {
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
  {
    // sequelize should not add an 's' to the end of this model to form the associated table's name
    freezeTableName: true,
    underscored: true
  }
)

module.exports = Comics
