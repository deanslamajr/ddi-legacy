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
    draft_image_url: {
      type: Sequelize.STRING
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
  const cell = await Cells.findOne({
    where: {
      // find cells that have this filename as either image_url OR draft_image_url
      [Sequelize.Op.or]: [
        {image_url: filename},
        {draft_image_url: filename}
      ]
    }
  });
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

async function createNewCell ({comicId, userId, transaction}) {
  const [filename, urlId] = await Promise.all([
    generateUniqueFilename(),
    generateUniqueUrlId()
  ]);

  const config = transaction
    ? {transaction}
    : {};

  await Cells.create({
    comic_id: comicId,
    creator_user_id: userId,
    image_url: filename,
    url_id: urlId
  }, config)

  return {
    filename,
    urlId
  }
}

async function createNewDraftFilename ({cellUrlId, transaction}) {
  const filename = await generateUniqueFilename();

  const config = transaction
    ? {transaction}
    : {};

    const cell = await Cells.findOne({ where: { url_id: cellUrlId }});
    await cell.update({draft_image_url: filename}, config)
  
    return filename
}

Cells.createNewCell = createNewCell;
Cells.createNewDraftFilename = createNewDraftFilename;

module.exports = {
  Cells,
  createNewCell
}
