'use strict';

var Logger = require('app/common/logger');
var Conversation = require('app/ui/models/conversation');

var Conversations = Backbone.Collection.extend({

  model: Conversation,

  initialize: function () {
    Logger.module('UI').log('initialize a Conversations collection');
    this.on('add', this.onItemAdded, this);
  },

  onDestroy: function () {
    this.off('add', this.onItemAdded, this);
  },

  onItemAdded: function (conversation) {
    Logger.module('UI').debug('New Conversation added to collection');
  },

  getUnreadConversationCount: function () {
    var count = 0;
    this.each(function (conversationModel) {
      if (conversationModel.get('unread')) {
        count++;
      }
    }.bind(this));
    return count;
  },

});

// Expose the class either via CommonJS or the global object
module.exports = Conversations;
