var should  = require('should');
var redis = require('./setup/redisConnection');
var Promise = require('bluebird');
var warlock = require('../lib/warlock')(redis);
var warlockThen = Promise.promisifyAll(require('../lib/warlock')(redis));

require('./setup/redisFlush');

describe('locking', function() {
  it('sets lock', function (done) {
    warlock.lock('testLock', 1000, function(err, unlock) {
      should.not.exist(err);
      (typeof unlock).should.equal('function');
      done();
    });
  });

  it('returns true if key is locked', function(done) {
    warlock.isLocked('testLock', function(err, isLocked) {
      should.not.exist(err);
      isLocked.should.equal(true);

      done();
    });
  });

  it('does not set lock if it already exists', function(done) {
    warlock.lock('testLock', 1000, function(err, unlock) {
      should.not.exist(err);
      unlock.should.equal(false);
      done();
    });
  });

  it('does not alter expiry of lock if it already exists', function(done) {
    redis.pttl(warlock.makeKey('testLock'), function(err, ttl) {
      warlock.lock('testLock', 1000, function(err, unlock) {
        should.not.exist(err);
        unlock.should.equal(false);

        redis.pttl(warlock.makeKey('testLock'), function(err, ttl2) {
          (ttl2 <= ttl).should.equal(true);

          done();
        });
      });
    });
  });

  it('unlocks', function(done) {
    warlock.lock('unlock', 1000, function(err, unlock) {
      should.not.exist(err);
      unlock(done);
    });
  });

  it('returns false if key is unlocked', function(done) {
    warlock.isLocked('unlock', function(err, isLocked) {
      should.not.exist(err);
      isLocked.should.equal(false);

      done();
    });
  });
});

/*
describe('unlocking with id', function() {
  var lockId;

  it('sets lock and gets lock id', function(done) {
    warlock.lock('customlock', 20000, function(err, unlock, id) {
      should.not.exists(err);
      id.should.type("string");
      lockId = id;
      done();
    });
  });

  it('does not unlock with wrong id', function(done) {
    warlock.unlock('customlock', "wrongid", function(err, result) {
      should.not.exists(err);
      result.should.equal(0);
      done();
    });
  });

  it('unlocks', function(done) {
    warlock.unlock('customlock', lockId, function(err, result) {
      should.not.exists(err);
      result.should.equal(1);
      done();
    });
  });
});
*/

describe('locking', function() {
  it('sets lock', function (done) {
    warlockThen.lockAsync('testLockAsync', 1000)
    .then(unlock => {
      (typeof unlock).should.equal('function');
      done();
    })
    .catch(err => {
      should.not.exist(err);
      done();
    })
  });

  it('returns true if key is locked', function(done) {
    warlockThen.isLockedAsync('testLockAsync')
    .then(isLocked => {
      isLocked.should.equal(true);
      done();
    })
    .catch(err => {
      should.not.exist(err);
      done();
    })
  });

  it('does not set lock if it already exists', function(done) {
    warlockThen.lockAsync('testLockAsync', 1000)
    .then(unlock => {
      unlock.should.equal(false);
      done();
    })
    .catch(err => {
      should.not.exist(err);
      done();
    })
  });

  it('unlocks', function(done) {
    warlockThen.lockAsync('unlockAsync', 1000)
    .then(unlock => {
      unlock(done);
    })
    .catch(err => {
      should.not.exist(err);
      done();
    })
  });

  it('returns false if key is unlocked', function(done) {
    warlockThen.isLockedAsync('unlockAsync')
    .then(isLocked => {
      isLocked.should.equal(false);
      done();
    })
    .catch(err => {
      should.not.exist(err);
      done();
    })
  });
});
