const Logger = require('app/common/logger');
const Message = require('app/ui/models/message');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');

const Messages = DuelystFirebase.Collection.extend({
  model: Message,
  initialize() {
    Logger.module('UI').log('initialize a Messages collection');
  },
});

// Expose the class either via CommonJS or the global object
module.exports = Messages;
