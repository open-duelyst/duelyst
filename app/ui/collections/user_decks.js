const Logger = require('app/common/logger');
const DeckModel = require('app/ui/models/deck');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const DuelystBackbone = require('app/ui/extensions/duelyst_backbone');

const UserDecksCollection = DuelystBackbone.Collection.extend({

  model: DeckModel,
  url: `${process.env.API_URL}/api/me/decks`,

  comparator(a, b) {
    // sort by most recently touched
    const lastTouchedTimestampA = Math.max(a.get('created_at') || 0, a.get('updated_at') || 0);
    const lastTouchedTimestampB = Math.max(b.get('created_at') || 0, b.get('updated_at') || 0);
    return lastTouchedTimestampB - lastTouchedTimestampA;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UserDecksCollection;
