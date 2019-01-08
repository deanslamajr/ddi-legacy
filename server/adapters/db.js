const Sequelize = require('sequelize')

// import logger from '../middleware/logger'
const { serverEnvironment } = require('../env-config')

const sequelize = new Sequelize(serverEnvironment.PGDB_DBNAME, serverEnvironment.PGDB_USERNAME, serverEnvironment.PGDB_PASSWORD, {
  host: config('PGDB_HOST'),
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false
  // logging: (query) => {
  //   logger.info(query)
  // }
})

export { sequelize }
