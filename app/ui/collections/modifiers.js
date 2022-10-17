'use strict';

var Logger = require('app/common/logger');
var SDK = require('app/sdk');
var ModifierModel = require('app/ui/models/modifier');

var ModifierCollection = Backbone.Collection.extend({
  model: ModifierModel,
  initialize: function () {
  },
});

// Expose the class either via CommonJS or the global object
module.exports = ModifierCollection;
