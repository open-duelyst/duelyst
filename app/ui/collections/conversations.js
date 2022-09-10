const Logger = require('app/common/logger');
const Conversation = require('app/ui/models/conversation');

const Conversations = Backbone.Collection.extend({

  model: Conversation,

  initialize() {
    Logger.module('UI').log('initialize a Conversations collection');
    this.on('add', this.onItemAdded, this);
  },

  onDestroy() {
    this.off('add', this.onItemAdded, this);
  },

  onItemAdded(conversation) {
    Logger.module('UI').debug('New Conversation added to collection');
  },

  getUnreadConversationCount() {
    let count = 0;
    this.each((conversationModel) => {
      if (conversationModel.get('unread')) {
        count++;
      }
    });
    return count;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = Conversations;
