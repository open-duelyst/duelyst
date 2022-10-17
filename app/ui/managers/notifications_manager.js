// pragma PKGS: alwaysloaded

var _NotificationsManager = {};
_NotificationsManager.instance = null;
_NotificationsManager.getInstance = function () {
  if (this.instance == null) {
    this.instance = new NotificationsManager();
  }
  return this.instance;
};
_NotificationsManager.current = _NotificationsManager.getInstance;

_NotificationsManager.NOTIFICATION_QUEST_PROGRESS = 'quest_progress';
_NotificationsManager.NOTIFICATION_BUDDY_MESSAGE = 'buddy_message';
_NotificationsManager.NOTIFICATION_BUDDY_INVITE = 'buddy_invite';
_NotificationsManager.NOTIFICATION_REFERRAL_REWARDS = 'referral_rewards';

module.exports = _NotificationsManager;

var CONFIG = require('app/common/config');
var EVENTS = require('app/common/event_types');
var Logger = require('app/common/logger');
var RSX = require('app/data/resources');
var MainMenuItemView = require('app/ui/views/item/main_menu');
var PlayLayout = require('app/ui/views/layouts/play');
var NotificationModel = require('app/ui/models/notification');
var DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
var moment = require('moment');
var NavigationManager = require('./navigation_manager');
var ChatManager = require('./chat_manager');
var Manager = require('./manager');
var ProfileManager = require('./profile_manager');

var NotificationsManager = Manager.extend({

  _notificationQueue: null,

  mainNotifications: null,
  buddyInviteNotifications: null,
  questNotifications: null,
  messageNotifications: null,

  remoteNotifications: null,

  /* region INITIALIZE */

  initialize: function (options) {
    Manager.prototype.initialize.call(this);

    this._notificationQueue = new Backbone.Collection();

    this.mainNotifications = new Backbone.Collection();
    this.buddyInviteNotifications = new Backbone.Collection();
    this.questNotifications = new Backbone.Collection();
    this.messageNotifications = new Backbone.Collection();
  },

  /* endregion INITIALIZE */

  /* region CONNECT */

  onBeforeConnect: function () {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        var userId = ProfileManager.getInstance().get('id');
        var notificationsRef = new Firebase(process.env.FIREBASE_URL + '/user-notifications/' + userId);

        this.remoteNotifications = new DuelystFirebase.Collection(null, { firebase: notificationsRef.orderByChild('created_at').startAt(moment().utc().valueOf()) });
        this.listenTo(this.remoteNotifications, 'add', this.onRemoteNotificationAdded);

        ChatManager.getInstance().on(EVENTS.status, this._onStatusChanged, this);
      });
  },

  onBeforeDisconnect: function () {
    Manager.prototype.onBeforeDisconnect.call(this);
    ChatManager.getInstance().off(EVENTS.status, this._onStatusChanged, this);
    if (this.remoteNotifications != null) {
      this.stopListening(this.remoteNotifications);
      this.remoteNotifications.off();
      this.remoteNotifications = null;
    }
    this.dismissAllNotifications();
  },

  /* endregion CONNECT */

  /* region GETTERS / SETTERS */

  getMainNotifications: function () {
    return this.mainNotifications;
  },

  getBuddyInviteNotifications: function () {
    return this.buddyInviteNotifications;
  },

  getBuddyMessageNotifications: function () {
    return this.messageNotifications;
  },

  getQuestProgressNotifications: function () {
    return this.questNotifications;
  },

  getCollectionForNotification: function (notification) {
    switch (notification.get('type')) {
    case _NotificationsManager.NOTIFICATION_QUEST_PROGRESS:
      return this.getQuestProgressNotifications();
    case _NotificationsManager.NOTIFICATION_BUDDY_MESSAGE:
      return this.getBuddyMessageNotifications();
    case _NotificationsManager.NOTIFICATION_BUDDY_INVITE:
      return this.getBuddyInviteNotifications();
    default:
      return this.getMainNotifications();
    }
  },

  getCanShowNotification: function (notification) {
    switch (notification.get('type')) {
    case _NotificationsManager.NOTIFICATION_QUEST_PROGRESS:
      return this.getCanShowQuestProgressNotification();
    case _NotificationsManager.NOTIFICATION_BUDDY_MESSAGE:
      return this.getCanShowBuddyMessageNotification();
    case _NotificationsManager.NOTIFICATION_BUDDY_INVITE:
      return this.getCanShowBuddyInviteNotification();
    default:
      return this.getCanShowMainNotification();
    }
  },

  getCanShowMainNotification: function () {
    return !ChatManager.getInstance().getStatusLoading();
  },

  getCanShowQuestProgressNotification: function () {
    // show quest progress when on landing/main
    // FIXME: this check is brittle
    return ChatManager.getInstance().getStatusOnline()
      && !NavigationManager.getInstance().getIsShowingDialogView()
      && !NavigationManager.getInstance().getIsShowingModalView()
      && (NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView)
        || NavigationManager.getInstance().getIsShowingContentViewClass(PlayLayout));
  },

  getCanShowBuddyMessageNotification: function () {
    // show buddy messages when on landing/main
    // FIXME: this check is brittle
    return ChatManager.getInstance().getStatusOnline()
      && ProfileManager.getInstance().profile
      && !ProfileManager.getInstance().profile.get('doNotDisturb')
      && !NavigationManager.getInstance().getIsShowingDialogView()
      && !NavigationManager.getInstance().getIsShowingModalView()
      && NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView);
  },

  getCanShowBuddyInviteNotification: function () {
    // show buddy invites anywhere as long as we're not loading
    return !ChatManager.getInstance().getStatusLoading()
      && ProfileManager.getInstance().profile
      && !ProfileManager.getInstance().profile.get('doNotDisturb');
  },

  getCanQueueNotification: function (notification) {
    switch (notification.get('type')) {
    case _NotificationsManager.NOTIFICATION_QUEST_PROGRESS:
      return true;
    case _NotificationsManager.NOTIFICATION_BUDDY_MESSAGE:
      return false;
    case _NotificationsManager.NOTIFICATION_BUDDY_INVITE:
      return true;
    default:
      return true;
    }
  },

  /* endregion GETTERS / SETTERS */

  /* region EVENTS */

  _onStatusChanged: function () {
    // when we switch status to online, show queued notifications
    if (ChatManager.getInstance().getStatusOnline()) {
      this.showQueuedNotificationsThatCanBeShown();
    }
  },

  /* endregion EVENTS */

  /* region SHOW */

  showNotification: function (notification) {
    if (this.getCanShowNotification(notification)) {
      this._showNotification(notification);
    } else if (this.getCanQueueNotification(notification)) {
      this._queueNotification(notification);
    }
  },

  _queueNotification: function (notification) {
    this._notificationQueue.add(notification);
  },

  _showNotification: function (notification) {
    // get the collection this will be shown in
    var collection = this.getCollectionForNotification(notification);
    if (collection != null) {
      // remove from queue
      this._notificationQueue.remove(notification);

      // show notification in its specific collection
      collection.add(notification);
    }
  },

  showQueuedNotificationsThatCanBeShown: function () {
    var notificationModels = this._notificationQueue.models.slice();

    for (var i = 0; i < notificationModels.length; i++) {
      var notificationModel = notificationModels[i];
      if (this.getCanShowNotification(notificationModel)) {
        this._showNotification(notificationModel);
      }
    }
  },

  /* endregion SHOW */

  /* region DISMISS */

  dismissNotification: function (notification) {
    // trigger the dismiss event on the notification
    notification.trigger('dismiss', notification);

    // remove
    var collection = this.getCollectionForNotification(notification);
    collection.remove(notification);
  },

  dismissAllNotifications: function () {
    this.dismissAllNotificationsForCollection(this.getMainNotifications());
    this.dismissAllBuddyNotifications();
    this.dismissAllNotificationsForCollection(this.getQuestProgressNotifications());
  },

  dismissAllBuddyNotifications: function () {
    this.dismissAllNotificationsForCollection(this.getBuddyInviteNotifications());
    this.dismissAllNotificationsForCollection(this.getBuddyMessageNotifications());
  },

  dismissAllNotificationsForCollection: function (collection) {
    if (collection) {
      var notifications = collection.slice(0);
      for (var i = 0, il = notifications.length; i < il; i++) {
        this.dismissNotification(notifications[i]);
      }
    }
  },

  dismissNotificationsThatCantBeShown: function () {
    if (!this.getCanShowMainNotification()) {
      this.dismissAllNotificationsForCollection(this.getMainNotifications());
    }
    if (!this.getCanShowBuddyInviteNotification()) {
      this.dismissAllNotificationsForCollection(this.getBuddyInviteNotifications());
    }
    if (!this.getCanShowBuddyMessageNotification()) {
      this.dismissAllNotificationsForCollection(this.getBuddyMessageNotifications());
    }
    if (!this.getCanShowQuestProgressNotification()) {
      this.dismissAllNotificationsForCollection(this.getQuestProgressNotifications());
    }
  },

  acceptCTAForNotification: function (notification) {
    notification.set('ctaClicked', true);
    notification.trigger('cta_accept', notification);
    this.dismissNotification(notification);
  },

  /* endregion DISMISS */

  onRemoteNotificationAdded: function (remoteModel) {
    this.mainNotifications.add(remoteModel.attributes);
  },

});
