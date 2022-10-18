require('coffeescript/register');
const config = require('../config/config');

// Validate config.
config.set('env', 'development');
if (!config.get('aws.accessKey') || !config.get('aws.secretKey')) {
  console.log('Cannot run without AWS credentials from environment.');
  process.exit(1);
}

// Run the uploader.
try {
  const uploadGameToS3 = require('../worker/upload_game_to_s3.coffee');
  uploadGameToS3('123', '{"game":true}', '{"mouse":true}');
} catch (error) {
  console.log(error.message);
}
