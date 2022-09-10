const Logger = require('app/common/logger');

const PresenceCollection = Backbone.Collection.extend({
  comparator(a, b) {
    let comparison = 0;
    if (a && b) {
      const statusA = a.getStatus();
      const statusB = b.getStatus();
      const unreadA = a.get('_lastUnreadMessageAt') || 0;
      const unreadB = b.get('_lastUnreadMessageAt') || 0;

      // sort by status
      comparison = (
        (Number(unreadB) - Number(unreadA))
        || (Number(statusB === 'online') - Number(statusA === 'online'))
        || (Number(statusB == 'loading') - Number(statusA == 'loading'))
        || (Number(statusB === 'queue') - Number(statusA === 'queue'))
        || (Number(statusB == 'game') - Number(statusA == 'game'))
        || (Number(statusB == 'challenge') - Number(statusA == 'challenge'))
        || (Number(statusB == 'watching') - Number(statusA == 'watching'))
        || (Number(statusB === 'away') - Number(statusA === 'away'))
      );

      if (comparison === 0) {
        // sort alphabetically
        let nameA = a.get('username');
        let nameB = b.get('username');
        if (nameA && nameB) {
          nameA = nameA.toLowerCase();
          nameB = nameB.toLowerCase();
          if (nameA > nameB) return 1;
          if (nameA < nameB) return -1;
        }
      }
    }

    return comparison;
  },
});

// Expose the class either via CommonJS or the global object
module.exports = PresenceCollection;
