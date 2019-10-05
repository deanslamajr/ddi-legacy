const Sequelize = require('sequelize')
const shortid = require('shortid')

const { sequelize } = require('../adapters/db')
const {SCHEMA_VERSION} = require('../../config/constants.json')

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
    caption: {
      type: Sequelize.STRING
    },
    creator_user_id: {
      type: Sequelize.STRING
    },
    order: {
      type: Sequelize.INTEGER
    },
    previous_cell_id: {
      type: Sequelize.UUID,
      references: {
        model: 'cells',
        key: 'id'
      }
    },
    schema_version: {
      type: Sequelize.INTEGER,
      defaultValue: SCHEMA_VERSION
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
);

async function doesCellFilenameExist(filename) {
  const cell = await Cells.findOne({ where: { image_url: filename }});
  return !!cell;
}

async function generateUniqueFilename() {
  let filename;

  do {
    filename = `${shortid.generate()}.png`;
  } while (await doesCellFilenameExist(filename))

  return filename;
}

async function doesUrlIdExist(urlId) {
  const cell = await Cells.findOne({ where: { url_id: urlId }});
  return !!cell;
}

async function generateUniqueUrlId() {
  let urlId;

  do {
    urlId = `${shortid.generate()}`;
  } while (await doesUrlIdExist(urlId))

  return urlId;
}

async function createNewCell ({comicId, userId}) {
  const [filename, urlId] = await Promise.all([
    generateUniqueFilename(),
    generateUniqueUrlId()
  ]);

  await Cells.create({
    comic_id: comicId,
    creator_user_id: userId,
    image_url: filename,
    url_id: urlId
  })

  return {
    filename,
    urlId
  }
}

Cells.createNewCell = createNewCell;

module.exports = {
  Cells,
  createNewCell
}
