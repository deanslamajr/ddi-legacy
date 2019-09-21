const Sequelize = require('sequelize')

const { sequelize } = require('../adapters/db')

const Comics = sequelize.define('comics',
  {
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
);

async function createNewComic() {

}

Comics.createNewComic = createNewComic;

module.exports = {
  createNewComic,
  Comics
};
