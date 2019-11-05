const Sequelize = require('sequelize')
const shortid = require('shortid')

const { sequelize } = require('../adapters/db')

const { ERROR_TYPES } = require('./constants');

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
    initial_cell_id: {
      type: Sequelize.UUID,
      references: {
        model: 'cells',
        key: 'id'
      }
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    url_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
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

async function createNewComic({userId, transaction}) {
  const urlId = shortid.generate();

  const config = transaction
    ? {transaction}
    : {};

  try {
    return await Comics.create({
      creator_user_id: userId,
      title: '',
      url_id: urlId
    }, config);
  }
  catch(error) {
    if (error.errors) {
      for(let i = 0; i < error.errors.length; i++) {
        const sqlError = error.errors[i];
        if (sqlError.type === ERROR_TYPES.UNIQUE_VIOLATION) {
          return createNewComic({userId, transaction});
        }
      }
    }

    throw error;
  }
}

Comics.createNewComic = createNewComic;

module.exports = {
  createNewComic,
  Comics
};
