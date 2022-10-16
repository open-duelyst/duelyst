// pragma PKGS: alwaysloaded

const _NotificationsManager = {};
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

const CONFIG = require('app/common/config');
const EVENTS = require('app/common/event_types');
const Logger = require('app/common/logger');
const RSX = require('app/data/resources');
const MainMenuItemView = require('app/ui/views/item/main_menu');
const PlayLayout = require('app/ui/views/layouts/play');
const NotificationModel = require('app/ui/models/notification');
const DuelystFirebase = require('app/ui/extensions/duelyst_firebase');
const moment = require('moment');
const NavigationManager = require('./navigation_manager');
const ChatManager = require('./chat_manager');
const Manager = require('./manager');
const ProfileManager = require('./profile_manager');

var NotificationsManager = Manager.extend({

  _notificationQueue: null,

  mainNotifications: null,
  buddyInviteNotifications: null,
  questNotifications: null,
  messageNotifications: null,

  remoteNotifications: null,

  /* region INITIALIZE */

  initialize(options) {
    Manager.prototype.initialize.call(this);

    this._notificationQueue = new Backbone.Collection();

    this.mainNotifications = new Backbone.Collection();
    this.buddyInviteNotifications = new Backbone.Collection();
    this.questNotifications = new Backbone.Collection();
    this.messageNotifications = new Backbone.Collection();
  },

  /* endregion INITIALIZE */

  /* region CONNECT */

  onBeforeConnect() {
    Manager.prototype.onBeforeConnect.call(this);
    ProfileManager.getInstance().onReady()
      .bind(this)
      .then(function () {
        const userId = ProfileManager.getInstance().get('id');
        const notificationsRef = new Firebase(`${process.env.FIREBASE_URL}/user-notifications/${userId}`);

        this.remoteNotifications = new DuelystFirebase.Collection(null, { firebase: notificationsRef.orderByChild('created_at').startAt(moment().utc().valueOf()) });
        this.listenTo(this.remoteNotifications, 'add', this.onRemoteNotificationAdded);

        ChatManager.getInstance().on(EVENTS.status, this._onStatusChanged, this);
      });
  },

  onBeforeDisconnect() {
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

  getMainNotifications() {
    return this.mainNotifications;
  },

  getBuddyInviteNotifications() {
    return this.buddyInviteNotifications;
  },

  getBuddyMessageNotifications() {
    return this.messageNotifications;
  },

  getQuestProgressNotifications() {
    return this.questNotifications;
  },

  getCollectionForNotification(notification) {
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

  getCanShowNotification(notification) {
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

  getCanShowMainNotification() {
    return !ChatManager.getInstance().getStatusLoading();
  },

  getCanShowQuestProgressNotification() {
    // show quest progress when on landing/main
    // FIXME: this check is brittle
    return ChatManager.getInstance().getStatusOnline()
      && !NavigationManager.getInstance().getIsShowingDialogView()
      && !NavigationManager.getInstance().getIsShowingModalView()
      && (NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView)
        || NavigationManager.getInstance().getIsShowingContentViewClass(PlayLayout));
  },

  getCanShowBuddyMessageNotification() {
    // show buddy messages when on landing/main
    // FIXME: this check is brittle
    return ChatManager.getInstance().getStatusOnline()
      && ProfileManager.getInstance().profile
      && !ProfileManager.getInstance().profile.get('doNotDisturb')
      && !NavigationManager.getInstance().getIsShowingDialogView()
      && !NavigationManager.getInstance().getIsShowingModalView()
      && NavigationManager.getInstance().getIsShowingContentViewClass(MainMenuItemView);
  },

  getCanShowBuddyInviteNotification() {
    // show buddy invites anywhere as long as we're not loading
    return !ChatManager.getInstance().getStatusLoading()
      && ProfileManager.getInstance().profile
      && !ProfileManager.getInstance().profile.get('doNotDisturb');
  },

  getCanQueueNotification(notification) {
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

  _onStatusChanged() {
    // when we switch status to online, show queued notifications
    if (ChatManager.getInstance().getStatusOnline()) {
      this.showQueuedNotificationsThatCanBeShown();
    }
  },

  /* endregion EVENTS */

  /* region SHOW */

  showNotification(notification) {
    if (this.getCanShowNotification(notification)) {
      this._showNotification(notification);
    } else if (this.getCanQueueNotification(notification)) {
      this._queueNotification(notification);
    }
  },

  _queueNotification(notification) {
    this._notificationQueue.add(notification);
  },

  _showNotification(notification) {
    // get the collection this will be shown in
    const collection = this.getCollectionForNotification(notification);
    if (collection != null) {
      // remove from queue
      this._notificationQueue.remove(notification);

      // show notification in its specific collection
      collection.add(notification);
    }
  },

  showQueuedNotificationsThatCanBeShown() {
    const notificationModels = this._notificationQueue.models.slice();

    for (let i = 0; i < notificationModels.length; i++) {
      const notificationModel = notificationModels[i];
      if (this.getCanShowNotification(notificationModel)) {
        this._showNotification(notificationModel);
      }
    }
  },

  /* endregion SHOW */

  /* region DISMISS */

  dismissNotification(notification) {
    // trigger the dismiss event on the notification
    notification.trigger('dismiss', notification);

    // remove
    const collection = this.getCollectionForNotification(notification);
    collection.remove(notification);
  },

  dismissAllNotifications() {
    this.dismissAllNotificationsForCollection(this.getMainNotifications());
    this.dismissAllBuddyNotifications();
    this.dismissAllNotificationsForCollection(this.getQuestProgressNotifications());
  },

  dismissAllBuddyNotifications() {
    this.dismissAllNotificationsForCollection(this.getBuddyInviteNotifications());
    this.dismissAllNotificationsForCollection(this.getBuddyMessageNotifications());
  },

  dismissAllNotificationsForCollection(collection) {
    if (collection) {
      const notifications = collection.slice(0);
      for (let i = 0, il = notifications.length; i < il; i++) {
        this.dismissNotification(notifications[i]);
      }
    }
  },

  dismissNotificationsThatCantBeShown() {
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

  acceptCTAForNotification(notification) {
    notification.set('ctaClicked', true);
    notification.trigger('cta_accept', notification);
    this.dismissNotification(notification);
  },

  /* endregion DISMISS */

  onRemoteNotificationAdded(remoteModel) {
    this.mainNotifications.add(remoteModel.attributes);
  },

});
