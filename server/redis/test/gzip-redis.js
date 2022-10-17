const redis = require('redis');

const client = redis.createClient({ host: '127.0.0.1', port: 6379 });
const json = JSON.stringify({ data: 'this is a game' });
const zlib = require('zlib');

const gzip = zlib.gzipSync(json);

console.log('------------------------');
console.log(`plain out => ${json}`);
console.log(`gzip out => 0x${gzip.toString('hex')}`);
console.log('------------------------');

// store the regular json
client.set('plain', json);
client.get('plain', (err, reply) => {
  const response = JSON.parse(reply);
  console.log('------------------------');
  console.log(`plain in => ${reply}`);
  console.log(`plain in decoded => ${response.data}`);
  console.log('------------------------');
});

// store the raw buffer
client.set('gzip', gzip);
client.getBuffer('gzip', (err, reply) => {
  const response = JSON.parse(zlib.gunzipSync(reply));
  console.log('------------------------');
  console.log(`gzip in => 0x${reply.toString('hex')}`);
  console.log(`gzip in decoded => ${response.data}`);
  console.log('------------------------');
});
