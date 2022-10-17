'use strict';

var Logger = require('app/common/logger');

var Message = Backbone.Model.extend({
  initialize: function () {
    // Logger.module("UI").log("initialize a Message model");
  },

  defaults: {
    fromId: '<id>',
    toId: '<id>',
    body: '<body>',
    timestamp: '<timestamp>',
  },
});

// Expose the class either via CommonJS or the global object
module.exports = Message;
