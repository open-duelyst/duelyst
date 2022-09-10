const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../..'));

const redis = require('redis');
const c = require('../../config/config');
const Logger = require('../../app/common/logger.coffee');

if (process.env.NODE_ENV !== 'test') {
  Logger.module('UNITTEST').log('Must run as NODE_ENV=test');
  process.exit(1);
}

const client = redis.createClient({
  host: c.get('redis.ip'),
  port: c.get('redis.port'),
  detect_buffers: true,
});

client.on('ready', () => {
  // flushall deletes all keys in the database
  // http://redis.io/commands/flushall
  client.flushall();
  Logger.module('UNITTEST').log('Redis flushed');
  process.exit(0);
});

client.on('error', (err) => {
  Logger.module('UNITTEST').log('Redis error:', err);
  process.exit(1);
});
