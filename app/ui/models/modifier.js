const Logger = require('app/common/logger');

const ModifierModel = Backbone.Model.extend({
  initialize() {
  },

  defaults: {
    name: 'TDB Name',
    description: 'TDB Description',
    source: 'Undefined',
    stackType: 'Modifier',
    stacks: 1,
    type: 'Modifier',
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ModifierModel;
