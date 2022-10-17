'use strict';

var CONFIG = require('app/common/config');
var NotificationsManager = require('app/ui/managers/notifications_manager');
var ChatManager = require('app/ui/managers/chat_manager');
var TransitionRegion = require('app/ui/views/regions/transition');
var NotificationsTmpl = require('app/ui/templates/layouts/notifications.hbs');
var MainNotificationsCompositeView = require('app/ui/views/composite/main_notifications');
var MessageNotificationsCompositeView = require('app/ui/views/composite/message_notifications');
var QuestNotificationsCompositeView = require('app/ui/views/composite/quest_notifications');

var NotificationsLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-notifications',

  template: NotificationsTmpl,

  regions: {
    mainNotificationsRegion: { selector: '#app-main-notifications-region', regionClass: TransitionRegion },
    messageNotificationsRegion: { selector: '#app-message-notifications-region', regionClass: TransitionRegion },
    questNotificationsRegion: { selector: '#app-quest-notifications-region', regionClass: TransitionRegion },
  },

  _mergedMainAndBuddyInviteNotificationsCollection: null,

  initialize: function () {
    this._mergedMainAndBuddyInviteNotificationsCollection = new Backbone.Collection();
    this._mergedMainAndBuddyInviteNotificationsCollection.comparator = function (a, b) {
      var aType = a.get('type');
      var bType = b.get('type');
      if (aType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
        if (bType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
          return 0;
        } else {
          return 1;
        }
      } else if (bType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
        return -1;
      } else {
        return 0;
      }
    };
  },

  onShow: function () {
    var mainNotificationsCollection = NotificationsManager.getInstance().getMainNotifications();
    var buddyInviteNotificationsCollection = NotificationsManager.getInstance().getBuddyInviteNotifications();
    var mergedNotificationModels = [].concat(mainNotificationsCollection.models, buddyInviteNotificationsCollection.models);
    this._mergedMainAndBuddyInviteNotificationsCollection.add(mergedNotificationModels);
    this.listenTo(mainNotificationsCollection, 'add', this.onMainOrBuddyInviteNotificationAdded);
    this.listenTo(mainNotificationsCollection, 'remove', this.onMainOrBuddyInviteNotificationRemoved);
    this.listenTo(buddyInviteNotificationsCollection, 'add', this.onMainOrBuddyInviteNotificationAdded);
    this.listenTo(buddyInviteNotificationsCollection, 'remove', this.onMainOrBuddyInviteNotificationRemoved);
  },

  onDestroy: function () {
    this.stopListening(NotificationsManager.getInstance().getMainNotifications());
    this.stopListening(NotificationsManager.getInstance().getBuddyInviteNotifications());
  },

  onRender: function () {
    this.mainNotificationsRegion.show(new MainNotificationsCompositeView({ collection: this._mergedMainAndBuddyInviteNotificationsCollection }));
    this.messageNotificationsRegion.show(new MessageNotificationsCompositeView({ collection: NotificationsManager.getInstance().getBuddyMessageNotifications() }));
    this.questNotificationsRegion.show(new QuestNotificationsCompositeView({ collection: NotificationsManager.getInstance().getQuestProgressNotifications() }));
  },

  onMainOrBuddyInviteNotificationAdded: function (model) {
    this._mergedMainAndBuddyInviteNotificationsCollection.add(model);
  },

  onMainOrBuddyInviteNotificationRemoved: function (model) {
    this._mergedMainAndBuddyInviteNotificationsCollection.remove(model);
  },

});

module.exports = NotificationsLayout;
