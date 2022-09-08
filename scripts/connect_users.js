const _ = require('underscore');
const Firebase = require('firebase');

const firebaseUrl = 'https://wargame.firebaseio.com';
const duelystFB = new Firebase(firebaseUrl);

const allUsernames = [
  'wb01@duelyst.com',
  'wb02@duelyst.com',
  'wb03@duelyst.com',
  'wb04@duelyst.com',

  'wb05@duelyst.com', //
  'wb06@duelyst.com',
  'wb07@duelyst.com',
  'wb08@duelyst.com',
  'wb09@duelyst.com',
  'wb10@duelyst.com',
  'wb11@duelyst.com',
  'wb12@duelyst.com',
  'wb13@duelyst.com',
  'wb14@duelyst.com',
];
const allUsers = [];

_.each(allUsernames, (username) => {
  console.log(`... Fetching User ${username}`);
  const ref = duelystFB.child('/users/').startAt(username).endAt(username).once('child_added', (snapshot) => {
    console.log(`DONE ... Fetching User ${username}`);
    allUsers.push(snapshot.val());
    amiDone();
  });
});

function amiDone() {
  if (allUsers.length === allUsernames.length) {
    _.each(allUsers, (user) => {
      const ref = duelystFB.child(`/users/${user.id}`);
      const buddiesRef = ref.child('buddies');

      console.log(`Handling User ${user.fullName}:${user.id}`);

      _.each(allUsers, (buddy) => {
        if (user.id !== buddy.id) {
          console.log(`Setting BUDDY ${buddy.id}`);
          buddiesRef.child(buddy.id).set({ id: buddy.id });
        }
      });
    });
  }
}
