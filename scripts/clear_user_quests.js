// Configuration object
const Firebase = require('firebase');
const _ = require('underscore');
const config = require('../config/config');

const fbRef = new Firebase(config.get('firebase'));
// Firebase secure token for duelyst-dev.firebaseio.com
const firebaseToken = config.get('firebaseToken');

console.log(config.get('firebase'));

fbRef.auth(firebaseToken, (error) => {
  if (error) {
    console.log('Error authenticating against our database.');
    process.exit(1);
  }
});

if (process.argv[2]) {
  const email = process.argv[2].replace('.', ',');
  const action = process.argv[3];
  const amount = parseFloat(process.argv[4]);

  console.log(`searching for user: ${email}`);
  fbRef.child('email-index').child(email).on('value', (snapshot) => {
    if (snapshot.val()) {
      console.log(`found user ${snapshot.val()}`);
      const questsRef = fbRef.child('user-quests').child(snapshot.val()).child('daily').child('current');
      questsRef.transaction((data) => {
        data = null;
        return data;
      }, (error, commited, snapshot) => {
        if (error) {
          console.log('Error: transaction failed');
          process.exit(1);
        } else if (commited) {
          console.log('SUCCESS');
          process.exit(1);
        }
      });
    } else {
      console.log('no user with this email exists');
    }
  });
} else {
  console.log('Error: no user email provided');
  process.exit(1);
}
