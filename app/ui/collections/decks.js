'use strict';

var DecksCollection = Backbone.Collection.extend({
  comparator: function (a, b) {
    // put starters and AI after all others
    if (a.get('isStarter') || b.get('isStarter')) {
      return ((Number(b.get('isStarter')) - Number(a.get('isStarter')))) || (a.get('faction_id') - b.get('faction_id'));
    }

    // sort by most recently touched
    var lastTouchedTimestampA = Math.max(a.get('created_at') || 0, a.get('updated_at') || 0);
    var lastTouchedTimestampB = Math.max(b.get('created_at') || 0, b.get('updated_at') || 0);
    return lastTouchedTimestampB - lastTouchedTimestampA;
  },
});

// Expose the class either via CommonJS or the global object
module.exports = DecksCollection;
