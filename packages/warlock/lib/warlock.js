var crypto       = require('crypto');
var Scripty      = require('node-redis-scripty');
var UUID         = require('uuid');

module.exports = function(redis){
  var warlock = {};

  var scripty = new Scripty(redis);

  warlock.makeKey = function(key) {
    return key + ':lock';
  };

  /**
   * Set a lock key
   * @param {string}   key    Name for the lock key. String please.
   * @param {integer}  ttl    Time in milliseconds for the lock to live.
   * @param {Function} cb
   */
  warlock.lock = function(key, ttl, cb) {
    cb = cb || function(){};

    if (typeof key !== 'string') {
      return cb(new Error('lock key must be string'));
    }

    var id;
    UUID.v1(null, (id = new Buffer(16)));
    id = id.toString('base64');
    redis.set(
      warlock.makeKey(key), id,
      'PX', ttl, 'NX',
      function(err, lockSet) {
        if (err) return cb(err);

        var unlock = warlock.unlock.bind(warlock, key, id);
        if (!lockSet) unlock = false;

        return cb(err, unlock);
      }
    );
  };

  warlock.unlock = function(key, id, cb) {
    cb = cb || function(){};

    if (typeof key !== 'string') {
      return cb(new Error('lock key must be string'));
    }

    scripty.loadScriptFile(
      'parityDel',
      __dirname + '/lua/parityDel.lua',
      function(err, parityDel){
        if (err) return cb(err);

        return parityDel.run(1, warlock.makeKey(key), id, cb);
      }
    );
  };

  /**
   * Set a lock optimistically (retries until reaching maxAttempts).
   */
  warlock.optimistic = function(key, ttl, maxAttempts, wait, cb) {
    var attempts = 0;

    var tryLock = function() {
      attempts += 1;
      warlock.lock(key, ttl, function(err, unlock) {
        if (err) return cb(err);

        if (typeof unlock !== 'function') {
          if (attempts >= maxAttempts) {
            var e = new Error('unable to obtain lock');
            e.maxAttempts = maxAttempts;
            e.key = key;
            e.ttl = ttl;
            e.wait = wait;
            return cb(e);
          }
          return setTimeout(tryLock, wait);
        }

        return cb(err, unlock);
      });
    };

    tryLock();
  };

  /**
   * Check if the key is locked
   */
  warlock.isLocked = function(key, cb) {
    cb = cb || function(){};

    if (typeof key !== 'string') {
      return cb(new Error('lock key must be string'));
    }

    redis.exists(
      warlock.makeKey(key),
      function(err, isLocked){
        if (err) return cb(err);
        return cb(err, Boolean(isLocked));
      }
    );
  };

  return warlock;
};
