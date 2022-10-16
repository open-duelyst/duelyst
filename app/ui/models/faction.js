const FactionModel = Backbone.Model.extend({
  initialize() {
  },

  defaults: {
    id: 0,
    name: 'Faction',
    description: 'Description',
    isNeutral: false,
  },
});

// Expose the class either via CommonJS or the global object
module.exports = FactionModel;
