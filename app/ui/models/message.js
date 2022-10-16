const Logger = require('app/common/logger');

const Message = Backbone.Model.extend({
  initialize() {
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
