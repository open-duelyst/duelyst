'use strict';

var Logger = require('app/common/logger');
var DeckModel = require('app/ui/models/deck');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var DuelystBackbone = require('app/ui/extensions/duelyst_backbone');

var UserDecksCollection = DuelystBackbone.Collection.extend({

  model: DeckModel,
  url: process.env.API_URL + '/api/me/decks',

  comparator: function (a, b) {
    // sort by most recently touched
    var lastTouchedTimestampA = Math.max(a.get('created_at') || 0, a.get('updated_at') || 0);
    var lastTouchedTimestampB = Math.max(b.get('created_at') || 0, b.get('updated_at') || 0);
    return lastTouchedTimestampB - lastTouchedTimestampA;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = UserDecksCollection;
