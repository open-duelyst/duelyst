/*
Using node-convict for configuration loading and validation.
Read documentation found here : https://github.com/mozilla/node-convict
Example 1 : https://hacks.mozilla.org/2013/03/taming-configurations-with-node-convict-a-node-js-holiday-season-part-7/
Example 2 : http://blog.nodejitsu.com/npmawesome-managing-app-configuration-with-convict/
*/

const path = require('path');
const url = require('url');
const convict = require('convict');

const config = convict({
  env: {
    doc: 'The applicaton environment.',
    // format: ["development", "production", "staging"],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'env',
  },
  port: {
    doc: 'The api port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
  },
  game_port: {
    doc: 'The game server port to bind.',
    format: 'port',
    default: 8001,
    env: 'GAME_PORT',
  },
  sp_port: {
    doc: 'The SP server port to bind.',
    format: 'port',
    default: 8000,
    env: 'SP_PORT',
  },
  api: {
    doc: 'API URL.',
    default: 'http://localhost:3000',
    env: 'API_URL',
  },
  firebase: {
    url: {
      doc: 'Firebase URL, e.g. https://my-duelyst-project-12345.firebaseio.com/',
      // format: "url",
      default: '',
      env: 'FIREBASE_URL',
    },
    legacyToken: {
      doc: 'Firebase legacy token, e.g. abcdefg1234567890abcdefg1234567890',
      default: '',
      env: 'FIREBASE_LEGACY_TOKEN',
    },
    projectId: {
      doc: 'Firebase project ID (for staging/production).',
      default: '',
      env: 'FIREBASE_PROJECT_ID',
    },
    clientEmail: {
      doc: 'Firebase client email for the private key (for staging/production).',
      default: '',
      env: 'FIREBASE_CLIENT_EMAIL',
    },
    privateKey: {
      doc: 'Firebase private key (for staging/production).',
      default: '',
      env: 'FIREBASE_PRIVATE_KEY',
    },
    authServiceUrl: {
      doc: 'Firebase URL for auth service',
      // format: "url",
      default: '',
      env: 'FIREBASE_AUTH_URL',
    },
    loggingEnabled: {
      doc: 'Enable logging in the Firebase Admin SDK.',
      default: false,
      env: 'FIREBASE_LOGGING_ENABLED',
    },
  },
  jwt: {
    tokenExpiration: {
      doc: 'Time (in minutes) before tokens expire.',
      format: 'int',
      default: 60 * 24 * 14, // 14 days in minutes
      env: 'TOKEN_EXPIRES',
    },
  },
  cdn: {
    doc: 'CDN / S3 url. Default is blank.',
    default: '',
    env: 'CDN_URL',
  },
  aws: {
    assetsBucketName: {
      default: '',
      env: 'S3_ASSETS_BUCKET',
    },
    replaysBucketName: {
      default: 'duelyst-games', // Invalid bucket, but makes localdev happy.
      env: 'S3_REPLAYS_BUCKET',
    },
    cdnDomainName: {
      default: '',
      env: 'CDN_DOMAIN_NAME',
    },
    region: {
      default: 'us-east-1',
      env: 'AWS_REGION',
    },
    accessKey: {
      default: '',
      env: 'AWS_ACCESS_KEY_ID',
    },
    secretKey: {
      default: '',
      env: 'AWS_SECRET_ACCESS_KEY',
    },
  },
  // s3 bucket/key/secret used for game session data uploads
  s3_archive: {
    bucket: {
      doc: 'S3 bucket name used for game session archiving',
      default: 'duelyst-games',
      env: 'S3_ARCHIVE_BUCKET',
    },
    key: {
      doc: 'S3 key for game session archiving',
      default: '',
      env: 'S3_ARCHIVE_KEY',
    },
    secret: {
      doc: 'S3 secret for game session archiving',
      default: '',
      env: 'S3_ARCHIVE_SECRET',
    },
  },
  s3_client_logs: {
    bucket: {
      doc: 'S3 bucket name used for client log archiving',
      default: 'duelyst-client-logs',
      env: 'S3_CLIENT_LOGS_BUCKET',
    },
    key: {
      doc: 'S3 key for client log archiving',
      default: '',
      env: 'S3_CLIENT_LOGS__KEY',
    },
    secret: {
      doc: 'S3 secret for client log archiving',
      default: '',
      env: 'S3_CLIENT_LOGS_SECRET',
    },
  },
  // s3 bucket/key/secret used for any backup data
  s3_user_backup_snapshots: {
    bucket: {
      doc: 'S3 bucket name used for generic backup',
      default: 'duelyst-user-backup-snapshots',
    },
    key: {
      doc: 'S3 key for generic backup',
      default: '',
    },
    secret: {
      doc: 'S3 secret for generic backup',
      default: '',
    },
  },
  redis: {
    host: {
      doc: 'Redis host.',
      default: '127.0.0.1',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'Redis port.',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT',
    },
    password: {
      doc: 'Redis password.',
      default: '',
      env: 'REDIS_PASSWORD',
    },
    ttl: {
      doc: 'Default TTL to set on expiring keys (seconds).',
      default: 3600 * 24 * 3,
      env: 'REDIS_TTL',
    },
  },
  expressLoggingEnabled: {
    doc: 'Enable Express request logging',
    default: false,
    env: 'EXPRESS_LOGGING',
  },
  winston: {
    doc: 'Enable/disable Winston logger.',
    format: Boolean,
    default: false,
    env: 'WINSTON_ENABLE',
  },
  winston_level: {
    doc: 'Log level for Winston',
    default: 'info',
    env: 'WINSTON_LEVEL',
  },
  analyticsEnabled: {
    doc: 'Enable/disable analytics.',
    format: Boolean,
    default: false,
    env: 'ANALYTICS_ENABLED',
  },
  gaId: {
    doc: 'Google Analytics Id',
    default: '', // by default points to STAGING analytics
    env: 'GA_ID',
  },
  auto_buddies: {
    doc: 'Array of buddies to auto-friend on registration.',
    default: [],
  },
  bugsnag: {
    web_key: {
      doc: 'Bugsnag api key for WEB CLIENT errors.',
      default: '',
      env: 'BUGSNAG_WEB',
    },
    desktop_key: {
      doc: 'Bugsnag api key for DESKTOP CLIENT errors.',
      default: '',
      env: 'BUGSNAG_DESKTOP',
    },
    api_key: {
      doc: 'Bugsnag api key for API SERVER errors.',
      default: '',
      env: 'BUGSNAG_API',
    },
    game_key: {
      doc: 'Bugsnag api key for GAME SERVER errors.',
      default: '',
      env: 'BUGSNAG_GAME',
    },
    ai_key: {
      doc: 'Bugsnag api key for AI SERVER errors.',
      default: '',
      env: 'BUGSNAG_AI',
    },
    worker_key: {
      doc: 'Bugsnag api key for WORKER errors.',
      default: '',
      env: 'BUGSNAG_WORKER',
    },
  },
  consul: {
    enabled: {
      doc: 'Enable/disable Consul-based server assignment.',
      format: Boolean,
      default: false,
      env: 'CONSUL_ENABLE',
    },
    ip: {
      doc: 'Consul local agent IP.',
      default: '',
      env: 'CONSUL_IP',
    },
    port: {
      doc: 'Consul local agent port.',
      format: 'port',
      default: 8500,
      env: 'CONSUL_PORT',
    },
    gameServiceName: {
      doc: 'Target service name for getHealthyServers call.',
      default: 'game',
      env: 'CONSUL_GAME_SERVICE',
    },
  },
  zendeskEnabled: {
    doc: 'Enable/disable Zendeks widget.',
    format: Boolean,
    default: false,
    env: 'ZENDESK_ENABLED',
  },
  postgres_connection_string: {
    doc: 'Postgres connection string.',
    default: 'pg://duelyst:duelyst@127.0.0.1/duelyst',
    env: 'POSTGRES_CONNECTION',
  },
  allCardsAvailable: {
    doc: 'Should all cards be usable in this environment or just ones the player owns?',
    format: Boolean,
    default: true,
    env: 'ALL_CARDS_AVAILABLE',
  },
  disableDeckValidation: {
    doc: 'Requires decks to contain exactly 40 cards and 1 general.',
    format: Boolean,
    default: false,
    env: 'DISABLE_DECK_VALIDATION',
  },
  recordClientLogs: {
    doc: 'Buffer 500 log lines on the client to be able to submit to server.',
    format: Boolean,
    default: false,
  },
  datGuiEditorEnabled: {
    doc: 'Should the editor and tools be shown?',
    format: Boolean,
    default: false,
  },
  aiToolsEnabled: {
    doc: 'Should the AI tools be enabled?',
    format: Boolean,
    default: false,
    env: 'AI_TOOLS_ENABLED',
  },
  watchSectionCacheTTL: {
    doc: 'How long should watch cache live (seconds)',
    format: Number,
    default: 60,
  },
  watchSectionMinCurrentVersionGameCount: {
    doc: 'How many games need to be in the buffer (minimum) before we attempt to generate any watchable games',
    format: Number,
    default: 1000,
  },
  inviteCodesActive: {
    doc: 'Are invite codes required for this environment?',
    format: Boolean,
    default: false,
    env: 'INVITE_CODES_ACTIVE',
  },
  recaptcha: {
    enabled: {
      doc: 'Recaptcha Enabled',
      default: false,
    },
    siteKey: {
      doc: 'Site key for Google RECAPTCHA.',
      default: '',
      env: 'RECAPTCHA_SITE_KEY',
    },
    secret: {
      doc: 'Recaptcha Secret',
      default: '',
    },
  },
  matchmaking: {
    allowMatchWithLastOpponent: {
      doc: 'Should matchmaking allow matching with the same opponent twice in a row?',
      default: false,
    },
    defaultGameServer: {
      doc: 'Game server domain name for staging and production; used by Worker.',
      default: '',
      env: 'DEFAULT_GAME_SERVER',
    },
  },
  fastly: {
    token: {
      default: '',
    },
    serviceId: {
      default: '',
    },
  },
});

try {
  // load environment dependent configuration
  const configFile = path.join(__dirname, `../config/${config.get('env')}.json`);
  config.loadFile(configFile);

  // Example loading multiple files
  // CONFIG_FILES=/path/to/production.json,/path/to/secrets.json,/path/to/sitespecific.json
  // config.loadFile(process.env.CONFIG_FILES.split(','));
} catch (error) {
  // console.log("No configuration files found. Using default config.");
}

// validates configuration against formats specified in schema above
config.validate();

// special case for certain environment flags that are required via ENVIFY in SDK and need to be available on the server as well
if (process.env) {
  if (!process.env.ALL_CARDS_AVAILABLE) process.env.ALL_CARDS_AVAILABLE = config.get('allCardsAvailable');
  if (!process.env.AI_TOOLS_ENABLED) process.env.AI_TOOLS_ENABLED = config.get('aiToolsEnabled');
}

// helper methods to quickly check our current environment
config.isProduction = function () {
  const env = config.get('env');
  if (env === 'production' || env === 'staging') { return true; }
  return false;
};

config.isStaging = function () {
  const env = config.get('env');
  if (env === 'staging') { return true; }
  return false;
};

config.isDevelopment = function () {
  return !config.isProduction();
};

config.version = require('../version.json').version;

const pgUrl = url.parse(config.get('postgres_connection_string'));
console.log(`CONFIG: version:${config.version}`);
console.log(`CONFIG: env:${config.get('env')}`);
console.log(`CONFIG: firebase:${url.parse(config.get('firebase.url')).host}`);
console.log(`CONFIG: postgres:${pgUrl.host}${pgUrl.pathname}`);
console.log(`CONFIG: redis:${config.get('redis.host')}`);

module.exports = config;
