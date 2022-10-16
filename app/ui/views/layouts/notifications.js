const CONFIG = require('app/common/config');
const NotificationsManager = require('app/ui/managers/notifications_manager');
const ChatManager = require('app/ui/managers/chat_manager');
const TransitionRegion = require('app/ui/views/regions/transition');
const NotificationsTmpl = require('app/ui/templates/layouts/notifications.hbs');
const MainNotificationsCompositeView = require('app/ui/views/composite/main_notifications');
const MessageNotificationsCompositeView = require('app/ui/views/composite/message_notifications');
const QuestNotificationsCompositeView = require('app/ui/views/composite/quest_notifications');

const NotificationsLayout = Backbone.Marionette.LayoutView.extend({

  id: 'app-notifications',

  template: NotificationsTmpl,

  regions: {
    mainNotificationsRegion: { selector: '#app-main-notifications-region', regionClass: TransitionRegion },
    messageNotificationsRegion: { selector: '#app-message-notifications-region', regionClass: TransitionRegion },
    questNotificationsRegion: { selector: '#app-quest-notifications-region', regionClass: TransitionRegion },
  },

  _mergedMainAndBuddyInviteNotificationsCollection: null,

  initialize() {
    this._mergedMainAndBuddyInviteNotificationsCollection = new Backbone.Collection();
    this._mergedMainAndBuddyInviteNotificationsCollection.comparator = function (a, b) {
      const aType = a.get('type');
      const bType = b.get('type');
      if (aType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
        if (bType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
          return 0;
        }
        return 1;
      } if (bType === NotificationsManager.NOTIFICATION_BUDDY_INVITE) {
        return -1;
      }
      return 0;
    };
  },

  onShow() {
    const mainNotificationsCollection = NotificationsManager.getInstance().getMainNotifications();
    const buddyInviteNotificationsCollection = NotificationsManager.getInstance().getBuddyInviteNotifications();
    const mergedNotificationModels = [].concat(mainNotificationsCollection.models, buddyInviteNotificationsCollection.models);
    this._mergedMainAndBuddyInviteNotificationsCollection.add(mergedNotificationModels);
    this.listenTo(mainNotificationsCollection, 'add', this.onMainOrBuddyInviteNotificationAdded);
    this.listenTo(mainNotificationsCollection, 'remove', this.onMainOrBuddyInviteNotificationRemoved);
    this.listenTo(buddyInviteNotificationsCollection, 'add', this.onMainOrBuddyInviteNotificationAdded);
    this.listenTo(buddyInviteNotificationsCollection, 'remove', this.onMainOrBuddyInviteNotificationRemoved);
  },

  onDestroy() {
    this.stopListening(NotificationsManager.getInstance().getMainNotifications());
    this.stopListening(NotificationsManager.getInstance().getBuddyInviteNotifications());
  },

  onRender() {
    this.mainNotificationsRegion.show(new MainNotificationsCompositeView({ collection: this._mergedMainAndBuddyInviteNotificationsCollection }));
    this.messageNotificationsRegion.show(new MessageNotificationsCompositeView({ collection: NotificationsManager.getInstance().getBuddyMessageNotifications() }));
    this.questNotificationsRegion.show(new QuestNotificationsCompositeView({ collection: NotificationsManager.getInstance().getQuestProgressNotifications() }));
  },

  onMainOrBuddyInviteNotificationAdded(model) {
    this._mergedMainAndBuddyInviteNotificationsCollection.add(model);
  },

  onMainOrBuddyInviteNotificationRemoved(model) {
    this._mergedMainAndBuddyInviteNotificationsCollection.remove(model);
  },

});

module.exports = NotificationsLayout;
