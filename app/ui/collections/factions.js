const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const FactionModel = require('app/ui/models/faction');
const CONFIG = require('app/common/config');

const FactionsCollection = Backbone.Collection.extend({

  model: FactionModel,

  initialize() {
    Logger.module('UI').log('initialize a Factions collection');
  },

  /**
   * Adds all enabled factions to this collection.
   */
  addAllFactionsToCollection() {
    const factions = SDK.FactionFactory.getAllEnabledFactions();
    for (let i = 0, il = factions.length; i < il; i++) {
      const faction = factions[i];
      this.add(faction);
    }
  },

  comparator(a, b) {
    // sort by non-neutrality then id ascending
    return (a.get('isNeutral') - b.get('isNeutral')) || (a.get('id') - b.get('id'));
  },
});

// Expose the class either via CommonJS or the global object
module.exports = FactionsCollection;
