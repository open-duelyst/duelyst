const path = require('path');
require('app-module-path').addPath(path.join(__dirname, '../..'));
const Firebase = require('firebase');
const c = require('../../config/config');
// const Logger = require('app/common/logger.coffee')

if (process.env.NODE_ENV !== 'test') {
  // Logger.module("UNITTEST").log('Must run as NODE_ENV=test')
  console.log('Must run as NODE_ENV=test');
  process.exit(1);
}

const ref = new Firebase(c.get('firebase'));

ref.authWithCustomToken(c.get('firebaseToken'), (err, data) => {
  if (err) {
    // Logger.module("UNITTEST").log('Firebase authentication failed:', err)
    console.log('Firebase authentication failed:', err);
    process.exit(1);
  } else {
    ref.remove((err) => {
      if (err) {
        // Logger.module("UNITTEST").log('Firebase failed to sync:', err)
        console.log('Firebase failed to sync:', err);
        process.exit(1);
      } else {
        // Logger.module("UNITTEST").log('Firebase cleared')
        console.log('Firebase cleared');
        process.exit(0);
      }
    });
  }
});
