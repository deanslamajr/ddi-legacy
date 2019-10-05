const Sequelize = require('sequelize')
const shortid = require('shortid')

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

async function doesUrlIdExist(urlId) {
  const comic = await Comics.findOne({ where: { url_id: urlId }});
  return !!comic;
}

async function generateUniqueUrlId() {
  let urlId;

  do {
    urlId = `${shortid.generate()}`;
  } while (await doesUrlIdExist(urlId))

  return urlId;
}

async function createNewComic({userId}) {
  const urlId = await generateUniqueUrlId();

  return await Comics.create({
    creator_user_id: userId,
    title: '',
    url_id: urlId
  })
}

Comics.createNewComic = createNewComic;

module.exports = {
  createNewComic,
  Comics
};
