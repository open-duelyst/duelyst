var redis = require('./setup/redisConnection');
var warlock = require('../lib/warlock')(redis);
var async = require('async');
require('./setup/redisFlush');

describe('benchmark', function() {
  it('lock', function(done) {
    var start = Date.now();
    async.times(
      10000,
      function(n, cb) {
        warlock.lock(''+Math.random(), 10000, cb);
      },
      function(err) {
        if (err) {
          console.trace(err);
        }

        var end = Date.now();
        var delta = end - start;
        done();
      });
    });
});

