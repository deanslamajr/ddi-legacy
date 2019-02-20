const Sequelize = require('sequelize')

const { sequelize } = require('../adapters/db')

const Cells = sequelize.define('cells',
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
    image_url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    studio_state: {
      type: Sequelize.JSON
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    creator_user_id: {
      type: Sequelize.STRING
    },
    order: {
      type: Sequelize.INTEGER
    },
    comic_id: {
      type: Sequelize.UUID,
      references: {
        model: 'comics',
        key: 'id'
      }
    }
  },
  {
    // sequelize should not add an 's' to the end of this model to form the associated table's name
    freezeTableName: true,
    underscored: true
  }
)

module.exports = Cells
