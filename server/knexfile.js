const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '..'));
const config = require('../config/config');

const environmentName = process.env.NODE_ENV;
const knexConfig = {};

if (!process.env.NODE_ENV) {
  throw new Error('Can not run without NODE_ENV');
}

knexConfig[environmentName] = {
  client: 'postgresql',
  connection: config.get('postgres_connection_string'),
  pool: {
    min: 1,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};

module.exports = knexConfig;
