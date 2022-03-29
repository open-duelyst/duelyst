var Redis = require('redis');

var redis = module.exports = Redis.createClient();

before(function(done){
  this.redis = redis;
  if(redis.connected) return done();
  else redis.on('ready', done);
});
