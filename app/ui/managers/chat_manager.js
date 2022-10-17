// pragma PKGS: alwaysloaded

// See: https://coderwall.com/p/myzvmg for why managers are created this way

var _ChatManager = {};
_ChatManager.instance = null;
_ChatManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new ChatManager();
  }
  return this.instance;
};
_ChatManager.current = _ChatManager.getInstance;

// expose static status properties
_ChatManager.STATUS_LOADING = 'loading';
_ChatManager.STATUS_ONLINE = 'online';
_ChatManager.STATUS_AWAY = 'away';
_ChatManager.STATUS_QUEUE = 'queue';
_ChatManager.STATUS_GAME = 'game';
_ChatManager.STATUS_WATCHING = 'watching';
_ChatManager.STATUS_CHALLENGE = 'challenge';

module.exports = _ChatManager;

var CONFIG = require('app/common/config');
var Logger = require('app/common/logger');
var EventBus = require('app/common/eventbus');
var EVENTS = require('app/common/event_types');
var Analytics = require('app/common/analytics');
var Promise = require('bluebird');
var UtilsFirebase = require('app/common/utils/utils_firebase');
var audio_engine = require('app/audio/audio_engine');
var Conversations = require('app/ui/collections/conversations');
var BuddiesCollection = require('app/ui/collections/buddies');
var Conversation = require('app/ui/models/conversation');
var NotificationModel = require('app/ui/models/notification');
var RSX = require('app/data/resources');
var NotificationsManager = require('./notifications_manager');
var GamesManager = require('./games_manager');
var ProfileManager = require('./profile_manager');
var Manager = require('./manager');

var ChatManager = Manager.extend({

  // firebase refs
  userConversationsIndexRef: null,
  conversations: null,
  invitesListRef: null,
  _connectionRef: null,
  _presenceRef: null,

  // backbone models / collections
  buddiesCollection: null,

  // state
  connected: false,
  _status: _ChatManager.STATUS_LOADING,

  initialize: function (options) {
    Manager.prototype.initialize.call(this);
  },

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);

    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        var username = ProfileManager.getInstance().get('username');
        // configure presence
        this.conversations = new Conversations();
        this._presenceRef = new Firebase(process.env.FIREBASE_URL + '/users/' + userId).child('presence');
        this._connectionRef = new Firebase(process.env.FIREBASE_URL + '/.info/connected');
        this._connectionRef.on('value', function (snapshot) {
          if (snapshot.val()) {
          // var sessionRef = this._presenceRef.push();
            this._presenceRef.child('status').set(this._status);
            this._presenceRef.child('username').set(username);

            this._presenceRef.onDisconnect().update({
              ended: Firebase.ServerValue.TIMESTAMP,
              status: 'offline',
            });

            this._presenceRef.child('began').set(Firebase.ServerValue.TIMESTAMP);
          }
        }, this);
        this.userConversationsIndexRef = new Firebase(process.env.FIREBASE_URL + 'chat/users/' + userId + '/conversations');
        this.invitesListRef = new Firebase(process.env.FIREBASE_URL + 'chat/users/' + userId + '/buddy-invites');

        this.buddiesCollection = new BuddiesCollection(null, { firebase: process.env.FIREBASE_URL + 'users/' + userId + '/buddies' });

        this.invitesListRef.on('child_added', this._onBuddyInviteReceived.bind(this));

        this.onReady().then(function () {
          Logger.module('UI').log('ChatManager::onReady');
          this.buddiesCollection.each(this._onBuddyAdded.bind(this));
          this.listenTo(this.buddiesCollection, 'add', this._onBuddyAdded);
          this.listenTo(this.buddiesCollection, 'remove', this._onBuddyRemoved);
          this.listenTo(this.conversations, 'message', this.onReceivedMessage);
          this.listenTo(EventBus.getInstance(), EVENTS.pointer_down, this.onResetAwayStatus);
          this.listenTo(EventBus.getInstance(), EVENTS.pointer_up, this.onResetAwayStatus);
          this.listenTo(EventBus.getInstance(), EVENTS.pointer_move, this.onResetAwayStatus);
        }.bind(this));

        this._markAsReadyWhenModelsAndCollectionsSynced([this.buddiesCollection]);

      /*
      this.userConversationsIndexRef.startAt(Date.now()).on("child_added",function(snapshot) { // startAt(Firebase.ServerValue.TIMESTAMP)
      Logger.module("UI").log("chat conversation started");
      this.onConversationStarted(snapshot.val());
      }.bind(this));

      this.userConversationsIndexRef.on("child_changed",function(snapshot) { // startAt(Firebase.ServerValue.TIMESTAMP)
      Logger.module("UI").log("chat conversation continued");
      this.onConversationStarted(snapshot.val());
      }.bind(this));
      */
      });
  },

  /*
   Usually called on logout, this function disconnects all firebase listeners
   */
  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    this.conversations = null;
    if (this.invitesListRef) {
      this.invitesListRef.off();
    }
    if (this._presenceRef) {
      // TODO: if a user account is destroyed while they are online, this will still write to FIREBASE
      this._presenceRef.child('ended').set(Firebase.ServerValue.TIMESTAMP);
      this._presenceRef.child('status').set('offline');
      this._presenceRef.off();
      this._presenceRef.onDisconnect().cancel(); // cancel any queued disconnection events from this reference
    }
    if (this._connectionRef) {
      this._connectionRef.off();
    }
  },

  /* endregion CONNECT */

  /* region BUDDIES */

  inviteBuddy: function (buddyUsername) {
    var promise = new Promise(function (resolve, reject) {
      buddyUsername = buddyUsername.toLowerCase();
      var indexRef = new Firebase(process.env.FIREBASE_URL).child('username-index').child(buddyUsername).once('value', function (snapshot) {
        // check if users exists in some global username based index by using "value" check
        var buddyId = snapshot.val();

        // null values mean no user exists for that username, so reject
        if (buddyId === null) {
          reject(new Error('User not found!'));
          return;
        }

        if (ProfileManager.getInstance().get('id') == buddyId) {
          reject(new Error('Can\'t add yourself!'));
          return;
        }

        if (this.buddiesCollection.get(buddyId)) {
          reject(new Error('Buddy already in list!'));
          return;
        }

        var inviteData = {
          fromUserId: ProfileManager.getInstance().get('id'),
          fromName: ProfileManager.getInstance().get('username'),
          sentAt: new Date(),
        };

        var buddyInvites = new Firebase(process.env.FIREBASE_URL + '/chat/users/' + buddyId + '/buddy-invites');
        var inviteRef = buddyInvites.child(ProfileManager.getInstance().get('id'));
        inviteRef.set(inviteData);

        // analytics call
        Analytics.track('buddy invite sent', {
          category: Analytics.EventCategory.Chat,
        });

        // resolve successfully
        resolve();
      }.bind(this));
    }.bind(this));

    return promise;
  },

  removeBuddy: function (buddyModel) {
    var myBuddiesRef = new Firebase(process.env.FIREBASE_URL + '/users/' + ProfileManager.getInstance().get('id') + '/buddies');
    myBuddiesRef.child(buddyModel.userId).remove();

    var theirBuddiesRef = new Firebase(process.env.FIREBASE_URL + '/users/' + buddyModel.userId + '/buddies');
    theirBuddiesRef.child(ProfileManager.getInstance().get('id')).remove();
  },

  acceptBuddyInvite: function (inviteData) {
    // TODO: this needs to be secured
    var myBuddiesRef = new Firebase(process.env.FIREBASE_URL + '/users/' + ProfileManager.getInstance().get('id') + '/buddies');
    myBuddiesRef.child(inviteData.fromUserId).set({
      createdAt: Firebase.ServerValue.TIMESTAMP,
    });

    // here
    var theirBuddiesRef = new Firebase(process.env.FIREBASE_URL + '/users/' + inviteData.fromUserId + '/buddies');
    theirBuddiesRef.child(ProfileManager.getInstance().get('id')).set({
      createdAt: Firebase.ServerValue.TIMESTAMP,
    });

    // analytics call
    Analytics.track('buddy invite accepted', {
      category: Analytics.EventCategory.Chat,
    });
  },

  _onBuddyInviteReceived: function (snapshot) {
    if (ProfileManager.getInstance().profile.get('doNotDisturb')) {
      // defer rejection because this is a direct response to an event
      _.defer(function () {
        snapshot.ref().remove();
      });
    } else {
      // create a notification
      var notification = new NotificationModel({
        message: snapshot.val().fromName + ' wants to add you to their buddy list.',
        type: NotificationsManager.NOTIFICATION_BUDDY_INVITE,
        ctaTitle: 'Accept',
        data: snapshot.val(),
        firebaseRef: snapshot.ref(),
      });

      // listen to changes to the notification, such as knowing that the CTA has been clicked or dismissed
      this.listenTo(notification, 'cta_accept', function (model) {
        this.acceptBuddyInvite(model.get('data'));
        notification.get('firebaseRef').remove();
        this.stopListening(notification);
      }, this);
      this.listenTo(notification, 'dismiss', function (model) {
        notification.get('firebaseRef').remove();
        this.stopListening(notification);
      }, this);

      // show the notification
      NotificationsManager.getInstance().showNotification(notification);

      // play notification sound
      audio_engine.current().play_effect(RSX.sfx_ui_notification.audio, false);
    }
  },

  _onBuddyAdded: function (model) {
    // start up the conversation now so it is ready
    this.startConversation(model.get('id'));
  },

  _onBuddyRemoved: function (model) {
    // stop the conversation between myself and removed buddy
    this.stopConversation(model.get('id'));
  },

  // Redefined below.
  /*
  getBuddiesCollection: function () {
    return this.buddies;
  },
  */

  /* endregion BUDDIES */

  /* region CONVERSATIONS */

  onReceivedMessage: function (messageModel) {
    // show latest message
    if (messageModel) {
      Logger.module('UI').log('ChatManager.onReceivedMessage', messageModel);
      var notification = new NotificationModel(_.extend(_.clone(messageModel.attributes), {
        type: NotificationsManager.NOTIFICATION_BUDDY_MESSAGE,
      }));

      // show the notification
      NotificationsManager.getInstance().showNotification(notification);
    }
  },

  _onConversationStarted: function (conversationData) {
    var conversationModel = this.conversations.get(conversationData.id);

    if (!conversationModel) {
      // create conversation model
      conversationModel = new Conversation({
        id: conversationData.id,
        firebaseURL: process.env.FIREBASE_URL + '/chat/conversations/' + conversationData.id,
        userId: conversationData.userId,
      });
      this.conversations.add(conversationModel);
    }

    return conversationModel;
  },

  startConversation: function (userId) {
    var conversationId = this.getConversationId(userId, ProfileManager.getInstance().get('id'));
    return this._onConversationStarted({
      id: conversationId,
      userId: userId,
    });
  },

  stopConversation: function (userId) {
    var conversationId = this.getConversationId(userId, ProfileManager.getInstance().get('id'));
    var conversationModel = this.conversations.get(conversationId);
    if (conversationModel != null) {
      this.conversations.remove(conversationModel);
    }
  },

  setConversationAsRead: function (userId) {
    var conversationId = this.getConversationId(userId, ProfileManager.getInstance().get('id'));
    var conversationModel = this.conversations.get(conversationId);
    if (conversationModel) {
      // conversationModel._lastUnreadMessageAt = null;
      conversationModel.set('unread', false);
    }
  },

  getConversationId: function (userId1, userId2) {
    var id = (userId1 < userId2) ? userId1 + ':' + userId2 : userId2 + ':' + userId1;
    return id;
  },

  /* endregion CONVERSATIONS */

  /* region STATUS */

  setStatus: function (status) {
    if (this._status !== status) {
      Logger.module('UI').log('ChatManager::setStatus -> ' + status);

      this._status = status;

      if (this._presenceRef) {
        this._presenceRef.child('status').set(this._status);
      }

      this.trigger(EVENTS.status, this._status);
    }
  },

  getStatus: function () {
    return this._status;
  },

  getStatusLoading: function () {
    return this._status === _ChatManager.STATUS_LOADING;
  },

  getStatusOnline: function () {
    return this._status === _ChatManager.STATUS_ONLINE;
  },

  getStatusAway: function () {
    return this._status === _ChatManager.STATUS_AWAY;
  },

  getStatusQueue: function () {
    return this._status === _ChatManager.STATUS_QUEUE;
  },

  getStatusGame: function () {
    return this._status === _ChatManager.STATUS_GAME;
  },

  getStatusWatching: function () {
    return this._status === _ChatManager.STATUS_WATCHING;
  },

  getStatusChallenge: function () {
    return this._status === _ChatManager.STATUS_CHALLENGE;
  },

  getStatusIsInBattle: function () {
    return this.getStatusGame() || this.getStatusWatching() || this.getStatusChallenge();
  },

  getIsStatusValidForBuddyGameInvite: function (status) {
    return status === _ChatManager.STATUS_ONLINE || status === _ChatManager.STATUS_AWAY;
  },

  getIsMyStatusValidForBuddyGameInvite: function () {
    return this.getIsStatusValidForBuddyGameInvite(this._status);
  },

  getIsMyStatusValidForSpectatingBuddyGame: function () {
    return this._status === _ChatManager.STATUS_ONLINE || this._status === _ChatManager.STATUS_AWAY;
  },

  onResetAwayStatus: function () {
    if (this.getStatusAway()) {
      this.setStatus(_ChatManager.STATUS_ONLINE);
    } else {
      this.startAwayStatusCheck();
    }
  },

  startAwayStatusCheck: function () {
    if (!this._setAwayStatus) {
      this._setAwayStatus = _.debounce(function () {
        if (this.connected && this.getStatusOnline())
          this.setStatus(_ChatManager.STATUS_AWAY);
        else
          this._setAwayStatus();
      }.bind(this), 60000);
    }
    this._setAwayStatus();
  },

  /* endregion STATUS */

  getBuddiesCollection: function () {
    return this.buddiesCollection;
  },

  getLastPlayedOpponentUsername: function () {
    var lastGame = GamesManager.getInstance().playerGames.last();
    if (lastGame) {
      return lastGame.get('opponent_username');
    }
  },

  setRankInStatus: function (rank) {
    if (this._presenceRef)
      this._presenceRef.child('rank').set(rank);
  },
});
