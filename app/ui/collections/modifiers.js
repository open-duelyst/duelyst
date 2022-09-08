const Logger = require('app/common/logger');
const SDK = require('app/sdk');
const ModifierModel = require('app/ui/models/modifier');

const ModifierCollection = Backbone.Collection.extend({
  model: ModifierModel,
  initialize() {
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ModifierCollection;
