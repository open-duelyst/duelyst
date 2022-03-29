
before(function(done){
  this.redis.script('flush', done);
});
