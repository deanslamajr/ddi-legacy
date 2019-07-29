const Sequelize = require('sequelize')
const bcrypt = require('bcrypt');

const { sequelize } = require('../adapters/db')

const Users = sequelize.define('users',
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
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    is_admin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    // sequelize should not add an 's' to the end of this model to form the associated table's name
    freezeTableName: true,
    underscored: true
  }
);

Users.createNewUser = async function ({username, password, options}) {
  // @todo check if username exists yet
  // if it does, respond 4xx

  const saltRounds = 10;
  const passHash = await bcrypt.hash(password, saltRounds);

  return await Users.create({
    username,
    password: passHash,
    ...options
  })
}

module.exports = Users
