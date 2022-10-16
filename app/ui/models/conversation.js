const Messages = require('app/ui/collections/messages');
const Logger = require('app/common/logger');
const Analytics = require('app/common/analytics');
const ChatManager = require('app/ui/managers/chat_manager');
const ProfileManager = require('app/ui/managers/profile_manager');

const Conversation = Backbone.Model.extend({

  messages: null, // chat messages

  initialize(firebase) {
    const messagesFb = new Firebase(this.get('firebaseURL')).child('messages').startAt(Date.now());
    this.messages = new Messages(null, { firebase: messagesFb });
    this.listenTo(this.messages, 'add', this.onMessageReceived);
  },

  sendReplay(gameId, generalId, messageBody) {
    // only send message if buddy is not offline
    const buddyId = this.get('userId');
    if (ChatManager.getInstance().getBuddiesCollection().getIsBuddyOnlineById(buddyId)) {
      this.messages.create({
        fromId: ProfileManager.getInstance().get('id'),
        toId: buddyId,
        gameId,
        generalId,
        body: messageBody || 'check out my replay',
        timestamp: Firebase.ServerValue.TIMESTAMP,
        '.priority': Firebase.ServerValue.TIMESTAMP,
      });

      // analytics call
      Analytics.track('replay shared', {
        category: Analytics.EventCategory.Chat,
      });
    }
  },

  sendMessage(messageBody) {
    // only send message if buddy is not offline
    const buddyId = this.get('userId');
    if (ChatManager.getInstance().getBuddiesCollection().getIsBuddyOnlineById(buddyId)) {
      this.messages.create({
        fromId: ProfileManager.getInstance().get('id'),
        toId: buddyId,
        body: messageBody,
        timestamp: Firebase.ServerValue.TIMESTAMP,
        '.priority': Firebase.ServerValue.TIMESTAMP,
      });

      // analytics call
      Analytics.track('message sent', {
        category: Analytics.EventCategory.Chat,
      });
    }
  },

  onMessageReceived(m) {
    if (m.get('fromId') != ProfileManager.getInstance().get('id')) {
      // this._lastUnreadMessageAt = Date.now();
      this.set('unread', true);
      this.trigger('message', this.messages.last());
      this.trigger('message_received', this);

      const buddyPresence = ChatManager.getInstance().getBuddiesCollection().getPresenceCollection().find((presence) => presence.userId == m.get('fromId'));

      if (buddyPresence) {
        buddyPresence.set('_lastUnreadMessageAt', Date.now());
      }
    }
  },

  defaults: {
    id: '<id>',
    firebaseURL: '<url>',
    userId: '<id>',
    unread: false,
  },
});

// Expose the class either via CommonJS or the global object
module.exports = Conversation;
